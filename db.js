const db = require('mysql2');

const conn = db.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '930809',
  database: 'bookshop',
  dateStrings: true,
});

module.exports = conn;
