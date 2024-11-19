const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use environment variable for database URL
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { redeemKey, userId } = req.body;

    if (!redeemKey || !userId) {
      return res.status(400).json({ message: 'Invalid redeem key or user ID' });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM redeem_keys WHERE key = $1 AND used = false',
        [redeemKey]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid or already used redeem key' });
      }

      const redeem = result.rows[0];

      await pool.query('UPDATE redeem_keys SET used = true WHERE key = $1', [redeemKey]);

      const coins = redeem.coins || 0;
      await pool.query('UPDATE users SET coins = coins + $1, plan = $2 WHERE id = $3', [
        coins,
        'pro',
        userId,
      ]);

      return res.status(200).json({ message: 'Redeem successful', coins });
    } catch (error) {
      console.error('Error redeeming key:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
