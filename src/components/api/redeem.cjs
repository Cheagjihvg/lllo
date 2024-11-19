const { Pool } = require('pg');  // Using CommonJS `require`
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

async function redeemKey(req, res) {
  if (req.method === 'POST') {
    const { redeemKey, userId } = req.body;

    // Check if redeemKey and userId are provided
    if (!redeemKey || !userId) {
      return res.status(400).json({ message: 'Invalid redeem key or user ID' });
    }

    // Search for the redeem key in the database
    const query = 'SELECT * FROM redeem_keys WHERE key = $1 AND used = false';
    try {
      const result = await pool.query(query, [redeemKey]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid or already used redeem key' });
      }

      const redeem = result.rows[0];

      // Update the redeem key as used
      await pool.query('UPDATE redeem_keys SET used = true WHERE key = $1', [redeemKey]);

      // Award coins based on the redeem key
      const coins = redeem.coins || 0;

      // Update the user's coins and plan in the database
      const updateUserQuery = 'UPDATE users SET coins = coins + $1, plan = $2 WHERE id = $3';
      await pool.query(updateUserQuery, [coins, 'pro', userId]);

      res.status(200).json({ message: 'Redeem successful', coins });
    } catch (error) {
      console.error('Error redeeming key:', error);
      res.status(500).json({ message: 'Error redeeming the key. Please try again later.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

module.exports = redeemKey;  // CommonJS export
