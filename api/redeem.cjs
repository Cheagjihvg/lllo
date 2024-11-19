const { Pool } = require('pg');  // Using CommonJS `require`
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

async function redeemKey(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { redeemKey, userId } = req.body;
    if (!redeemKey || !userId) {
      return res.status(400).json({ message: 'Invalid redeem key or user ID' });
    }

    const query = 'SELECT * FROM redeem_keys WHERE key = $1 AND used = false';
    const result = await pool.query(query, [redeemKey]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or already used redeem key' });
    }

    const redeem = result.rows[0];
    await pool.query('UPDATE redeem_keys SET used = true WHERE key = $1', [redeemKey]);

    const coins = redeem.coins || 0;
    const updateUserQuery = 'UPDATE users SET coins = coins + $1, plan = $2 WHERE id = $3';
    await pool.query(updateUserQuery, [coins, 'pro', userId]);

    return res.status(200).json({ message: 'Redeem successful', coins });
  } catch (error) {
    console.error('Error redeeming key:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = redeemKey;
