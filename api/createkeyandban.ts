import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createKeyAndBan(req: NextApiRequest, res: NextApiResponse) {
  const { userId, key, expiresAt } = req.body;

  if (!userId || !key || !expiresAt) {
    return res.status(400).json({ message: 'Missing user ID, key, or expiration date' });
  }

  try {
    // Start a transaction to ensure both actions are completed together
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the key
      const keyResult = await client.query(
        'INSERT INTO keys (key, expires_at) VALUES ($1, $2) RETURNING *',
        [key, expiresAt]
      );

      // Ban the user
      await client.query('UPDATE users SET banned = TRUE WHERE id = $1', [userId]);

      await client.query('COMMIT');
      return res.status(200).json({ message: 'Key created and user banned successfully!', key: keyResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createKeyAndBan:', error);
      return res.status(500).json({ message: 'Error creating key and banning user' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in createKeyAndBan:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default createKeyAndBan;
