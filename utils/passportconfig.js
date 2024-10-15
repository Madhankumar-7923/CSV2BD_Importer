import db from "./db.js";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

function initialize(passport) {

    const authenticateUser = (email, password, done) => {

        db.query(`SELECT * FROM users WHERE email = $1`, [email], (err, results) => {

            if (err) {
                throw err;
            }

            if (results.rows.length > 0) {
                const user = results.rows[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err;
                    }

                    if (isMatch) {
                        const simplifiedResults = results.rows.map(row => ({ id: row.id, name: row.name, email: row.email }));
                        console.log("User Logged In: ", simplifiedResults);

                        return done(null, user);
                    }

                    else {
                        const simplifiedResults = results.rows.map(row => ({ id: row.id, name: row.name, email: row.email }));
                        console.log("User tried login with incorrect credentials: ", simplifiedResults);

                        return done(null, false, { message: "Password is not correct" });
                    }
                });

            }

            else {
                return done(null, false, { message: "Email not registered" });
            }

        });

    }

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        authenticateUser
    ));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        db.query(`SELECT * FROM users WHERE id = $1`, [id], (err, result) => {
            if (err) {
                throw err
            }

            return done(null, result.rows[0]);
        });

    });
}

export default initialize;