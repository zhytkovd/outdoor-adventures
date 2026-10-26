require("dotenv").config({ path: ".env" });

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load Aiven CA certificate
const caCertificate = fs.readFileSync(
    path.join(__dirname, "certs", "ca.pem"),
    "utf8"
);

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: caCertificate,
        rejectUnauthorized: true
    }
});

module.exports = pool;