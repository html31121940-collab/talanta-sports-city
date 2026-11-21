
"use strict";

const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

// TLS configuration for TiDB Cloud
const useSSL = process.env.DB_SSL === "true";

const sslConfig = useSSL
    ? {
        ca: fs.readFileSync(
            path.resolve(__dirname, process.env.DB_CA_PATH || "certs/ca.pem"),
            "utf8"
        ),
        rejectUnauthorized: true
    }
    : undefined;

// MySQL / TiDB connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "talanta_app",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "talanta_sports_city",
    ...(sslConfig ? { ssl: sslConfig } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

async function testConnection() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(
            "SELECT DATABASE() AS database_name, VERSION() AS mysql_version"
        );

        return rows[0];
    } finally {
        connection.release();
    }
}

module.exports = { pool, testConnection };
