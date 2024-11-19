// api/redeem.ts

import { NextApiRequest, NextApiResponse } from 'next'; // Vercel uses Next.js, so these types work

// Assuming you're using a Postgres client or another database client
import { Client } from 'pg';

// Create a new PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { redeemKey, userId } = req.body;

    if (!redeemKey || !userId) {
      return res.status(400).json({ message: 'Invalid redeem key or user ID.' });
    }

    try {
      // Verify redeem key and update user
      const result = await client.query(
        'SELECT * FROM redeem_keys WHERE key = $1 AND used = FALSE',
        [redeemKey]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired redeem key.' });
      }

      // Mark the key as used
      await client.query('UPDATE redeem_keys SET used = TRUE WHERE key = $1', [redeemKey]);

      // Retrieve user details
      const user = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Assuming user object has a 'plan' field to update
      await client.query('UPDATE users SET plan = $1 WHERE id = $2', ['pro', userId]);

      // Respond with success
      return res.status(200).json({ message: 'Key redeemed successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  } else {
    // Only allow POST requests
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
