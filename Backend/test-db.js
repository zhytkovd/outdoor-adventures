const pool = require("./db");

async function testConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        console.log("Connected to Aiven MySQL!");
        console.log(rows);

    } catch (error) {
        console.error("Connection failed:", error.message);

    } finally {
        await pool.end();
    }
}

testConnection();