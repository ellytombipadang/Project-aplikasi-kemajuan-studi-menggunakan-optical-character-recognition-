const mysql = require("mysql");
// const dbConfig = require("./../config/db.config");

var connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "transkrip",
});
module.exports = connection;