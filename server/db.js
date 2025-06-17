// server/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,     // e.g. "postgres"
  host: process.env.DB_HOST,     // e.g. "localhost"
  database: process.env.DB_NAME, // e.g. "rating_system"
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pool;
