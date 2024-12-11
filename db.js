const db = require("mysql2");

const conn = db.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "930809",
  database: "bookshop",
  dateStrings: true,
});

conn.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    throw err;
  }
  console.log("Connected!");
});

module.exports = conn;
