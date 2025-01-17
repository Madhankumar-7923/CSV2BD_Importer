import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import multer from "multer";
import fs from "fs";
import PGStore from 'connect-pg-simple';

import db from "./utils/db.js";
import initialize from "./utils/passportconfig.js";
import dataCSV from "./utils/csvImporter.js";

import path from "path";
import { fileURLToPath } from "url";

env.config();

const app = express();
const port = process.env.PORT || 3000;

// Get the directory name from the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initialize(passport);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// set the public files directory
app.use(express.static(path.join(__dirname, 'public')));
/*app.use(express.static("public"));*/

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set up the session store
const PgSession = PGStore(session);

app.use(session({
    store: new PgSession({
        pool: db, // Connection pool
        tableName: 'session' // Use a specific table name for sessions
    }),
    secret: process.env.SESSION_CODE,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure multer to store files in the /tmp directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tmpDir = path.join('/tmp', 'uploads');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        cb(null, tmpDir); // Save files to /tmp/uploads
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original filename
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get("/register", checkAuthenticated, (req, res) => {
    res.render("register.ejs");
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard.ejs", { user: req.user.name });
});

app.get("/logout", checkNotAuthenticated, (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success_msg", "Logged out Successfully");
        res.redirect("/login");
    });
});

app.get("/success", checkNotAuthenticated, (req, res) => {
    const { icon, message, output } = req.query;
    res.render('success.ejs', { icon, message, output });
});

app.post("/register", async (req, res) => {
    let { name, email, password, cfpassword } = req.body;

    //console.log(name, email, password, cfpassword);
    let errors = [];

    if (!name || !email || !password || !cfpassword) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should contain at least 6 characters" });
    }

    if (password != cfpassword) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render("register.ejs", { errors });
    }

    else {
        //Passed form validation

        let hashedPassword = await bcrypt.hash(password, 10);
        //console.log(hashedPassword);
        db.query(`SELECT * FROM users WHERE email = $1`, [email],
            (err, results) => {

                if (err) {
                    throw err;
                }

                if (results.rows.length > 0) {
                    errors.push({ message: "Email already registered" });
                    res.render("register.ejs", { errors });
                    const simplifiedResults = results.rows.map(row => ({ id: row.id, name: row.name, email: row.email }));
                    console.log("User Exist: ", simplifiedResults);
                }

                else {
                    db.query(`INSERT INTO users (name, email, password) 
                        VALUES ($1, $2, $3) 
                        RETURNING id, name, email, password`,
                        [name, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                throw err
                            }
                            const simplifiedResults = results.rows.map(row => ({ id: row.id, name: row.name, email: row.email }));
                            console.log("New User Registered: ", simplifiedResults);
                            req.flash('success_msg', "You are now registered, Please login!");
                            res.redirect("/login");
                        }

                    );
                }

            }
        );

    }

});

app.post("/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true
    })
);

app.post("/upload", upload.single('file'), (req, res) => {

    if (!req.file) {
        return (res.status(400).send("No File Uploaded."));
    }

    const tableName = req.body.tableName;
    const filePath = req.file.path;

    dataCSV(filePath, tableName, res);
    console.log("File Imported");
});

app.post("/dashboard", (req, res) => {
    res.redirect("/dashboard");
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }

    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login");
}

// Render the 404 page
app.use((req, res) => {
    res.status(404).render("error404.ejs");
});

app.listen(port, () => {
    console.log(`Server Started in port ${port}`);
});