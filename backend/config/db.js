const { Pool } = require('pg');

const shouldUseSsl =
  process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: false
      }
    : false
});

module.exports = pool;
