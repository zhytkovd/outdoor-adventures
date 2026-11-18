const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Paths are resolved from the Backend folder (where you run `npm run dev` or
// `node test-db.js`). __dirname can't be used: Next.js bundles this file and
// changes it.
const backendRoot = process.cwd();

require("dotenv").config({
    path: path.join(backendRoot, ".env")
});

function createPool() {
    // Load Aiven CA certificate
    const caCertificate = fs.readFileSync(
        path.join(backendRoot, "certs", "ca.pem"),
        "utf8"
    );

    return mysql.createPool({
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
}

// Reuse one pool across Next.js hot reloads instead of opening a new set of
// connections every time a file is saved.
const pool = globalThis.__mysqlPool || createPool();
if (process.env.NODE_ENV !== "production") {
    globalThis.__mysqlPool = pool;
}

module.exports = pool;
