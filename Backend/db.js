require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createPool({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT) || 3306,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,


ssl: {
    ca: process.env.DB_SSL_CA?.replace(/\\n/g, "\n"),
    rejectUnauthorized: true
},

waitForConnections: true,
connectionLimit: 10,
queueLimit: 0

});

db.getConnection((err, connection) => {
if (err) {
console.error("MySQL connection failed:", err.message);
return;
}


console.log("MySQL connected successfully!");
connection.release();


});

module.exports = db;
