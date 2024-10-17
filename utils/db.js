import pg from "pg";
import env from "dotenv";

env.config();

//postgresql with own credentials
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Set to true for production with valid certificates
    }
});

db.connect()
    .then(() => console.log("Connected To Database Successfully"))
    .catch((err) => console.error("Database Connection Error", err));

export default db;