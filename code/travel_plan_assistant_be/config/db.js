const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "toor", // change if you set one
    database: "travel_planner",
});

module.exports = pool;