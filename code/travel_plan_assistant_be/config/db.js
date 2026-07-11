const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    port: 3307,
    password: "", // change if you set one
    database: "travel_planner",
});

module.exports = pool;