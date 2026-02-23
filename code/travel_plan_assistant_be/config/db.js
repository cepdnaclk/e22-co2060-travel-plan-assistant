const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // change if you set one
    database: "travel_planner",
});

module.exports = pool;