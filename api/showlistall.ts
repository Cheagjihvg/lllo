import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function showListAll(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query(
      `SELECT keys.id AS key_id, keys.key, keys.expires_at, users.id AS user_id, users.username, users.banned
       FROM keys
       LEFT JOIN users ON keys.user_id = users.id`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No keys found' });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching keys and users:', error);
    return res.status(500).json({ message: 'Error fetching data' });
  }
}

export default showListAll;
