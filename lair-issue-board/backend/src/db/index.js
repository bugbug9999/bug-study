const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,

  async migrate() {
    try {
      const schema = fs.readFileSync(
        path.join(__dirname, 'schema.sql'),
        'utf-8'
      );
      await pool.query(schema);
      console.log('[DB] Migration complete');
    } catch (err) {
      console.error('[DB] Migration error:', err.message);
      // In dev mode, continue even if DB is not ready
      if (process.env.NODE_ENV === 'production') throw err;
    }
  },
};
