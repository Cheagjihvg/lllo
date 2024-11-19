import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getHistory(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query; // Assuming userId is passed as query parameter

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Query history data for the specified user
    const result = await pool.query(
      'SELECT * FROM scan_history WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );

    const history = result.rows;

    if (history.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return res.status(500).json({ message: 'Failed to fetch scan history' });
  }
}

export default getHistory;
