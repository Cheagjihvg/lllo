import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function removeKeyAndBan(req: NextApiRequest, res: NextApiResponse) {
  const { userId, key } = req.body;

  if (!userId || !key) {
    return res.status(400).json({ message: 'Missing user ID or key' });
  }

  try {
    // Start a transaction to ensure both actions are completed together
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove the key
      await client.query('DELETE FROM keys WHERE key = $1', [key]);

      // Ban the user
      await client.query('UPDATE users SET banned = TRUE WHERE id = $1', [userId]);

      await client.query('COMMIT');
      return res.status(200).json({ message: 'Key removed and user banned successfully!' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in removeKeyAndBan:', error);
      return res.status(500).json({ message: 'Error removing key and banning user' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in removeKeyAndBan:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default removeKeyAndBan;
