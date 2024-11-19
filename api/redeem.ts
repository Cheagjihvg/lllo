import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg'; // PostgreSQL connection pool

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { redeemKey, userId } = req.body;

    if (!redeemKey || !userId) {
      return res.status(400).json({ message: 'Missing redeem key or user ID' });
    }

    try {
      // Step 1: Validate redeem key
      const keyResult = await pool.query(
        'SELECT * FROM redeem_keys WHERE key = $1 AND is_used = false LIMIT 1',
        [redeemKey]
      );

      if (keyResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or already used redeem key' });
      }

      const redeemKeyData = keyResult.rows[0];
      const { reward_amount, plan } = redeemKeyData;

      // Step 2: Award coins to the user
      const userResult = await pool.query(
        'SELECT coins, plan FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];
      const newCoins = user.coins + reward_amount;

      // Step 3: Update user record (coins and plan)
      await pool.query(
        'UPDATE users SET coins = $1, plan = $2 WHERE id = $3',
        [newCoins, plan, userId]
      );

      // Step 4: Mark redeem key as used
      await pool.query('UPDATE redeem_keys SET is_used = true WHERE key = $1', [redeemKey]);

      return res.status(200).json({
        message: 'Redeem successful',
        coins: reward_amount, // The number of coins awarded
      });
    } catch (error) {
      console.error('Error processing redeem:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
