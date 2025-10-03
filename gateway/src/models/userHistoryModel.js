import pool from '../config/db.js';

export const createHistoryTable = async () => {
	const queryText = `
    CREATE TABLE IF NOT EXISTS history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      image BYTEA NOT NULL,
      content_type TEXT NOT NULL,
      original_name TEXT,
      description TEXT,
      location TEXT,
      prediction TEXT,
      confidence NUMERIC,
      image_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

	try {
		await pool.query(queryText);
		console.log('History table created if not exists');
	} catch (error) {
		console.log('Error creating history table: ', error);
	}
};
