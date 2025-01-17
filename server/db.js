require("dotenv").config(); // Load env variables
const { Pool } = require("pg");

// Set up your database configuration
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

module.exports.query = (text, params) => pool.query(text, params);
