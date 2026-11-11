const { Pool } = require("pg");
const fs = require("fs");

function createPool() {
  const caPath = process.env.DB_CA_PATH;

  if (!caPath) {
    throw new Error("DB_CA_PATH is required");
  }

  return new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      ca: fs.readFileSync(caPath, "utf8"),
      rejectUnauthorized: true
    },
    connectionTimeoutMillis: 5000,
    max: 5
  });
}

// Create the pool only when a database operation is requested.
let pool;

module.exports = {
  query: (...args) => {
    if (!pool) {
      pool = createPool();
    }

    return pool.query(...args);
  }
};