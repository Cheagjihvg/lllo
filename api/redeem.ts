import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function handleRedeemKey(req: NextApiRequest, res: NextApiResponse) {
  const { key, userId } = req.body;

  if (!key || !userId) {
    return res.status(400).json({ message: 'Key and userId are required' });
  }

  try {
    // Check if the key exists and is valid (not expired and not already used)
    const keyResult = await pool.query(
      'SELECT * FROM keys WHERE key = $1 AND expires_at > NOW() AND used = FALSE',
      [key]
    );

    if (keyResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired key' });
    }

    const keyData = keyResult.rows[0];

    // Assign the key's associated plan to the user
    const plan = keyData.plan; // Assuming the key contains a 'plan' field
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);

    // Mark the key as used
    await pool.query('UPDATE keys SET used = TRUE WHERE key = $1', [key]);

    return res.status(200).json({
      message: `Key redeemed successfully! Your plan is now ${plan}.`,
    });
  } catch (error) {
    console.error('Error redeeming key:', error);
    return res.status(500).json({ message: 'Failed to redeem key' });
  }
}

export default handleRedeemKey;
