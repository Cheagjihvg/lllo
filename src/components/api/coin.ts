import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg'; // PostgreSQL client

// Connect to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: { rejectUnauthorized: false }, // Required for cloud hosting environments like Vercel
});

// Interface for coin payment request
interface CoinPaymentData {
  userId: string;
  planName: string;
  coinAmount: number;
}

// Function to get the user's coin balance from the database
async function getUserCoins(userId: string): Promise<number> {
  const result = await pool.query('SELECT coins FROM users WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0].coins; // Assuming the coins are stored in the "coins" column
}

// Function to deduct coins from the user's account
async function deductCoins(userId: string, amount: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // Get current coin balance
    const currentCoins = await getUserCoins(userId);

    if (currentCoins < amount) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins
    const newBalance = currentCoins - amount;
    await client.query('UPDATE users SET coins = $1 WHERE user_id = $2', [newBalance, userId]);

    // Commit transaction
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback if any error occurs
    throw error;
  } finally {
    client.release();
  }
}

// Function to update the user's plan
async function updateUserPlan(userId: string, planName: string): Promise<boolean> {
  const result = await pool.query('UPDATE users SET plan = $1 WHERE user_id = $2 RETURNING *', [planName, userId]);
  return result.rowCount > 0; // Return true if the update was successful
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, planName, coinAmount }: CoinPaymentData = req.body;

    try {
      // Get user coin balance
      const userCoins = await getUserCoins(userId);

      // Check if the user has enough coins
      if (userCoins < coinAmount) {
        return res.status(400).json({ message: 'Insufficient coins. Please top up your balance.' });
      }

      // Deduct coins from the user's account
      const success = await deductCoins(userId, coinAmount);
      if (!success) {
        return res.status(500).json({ message: 'Error deducting coins.' });
      }

      // Update the user's plan
      const planUpdated = await updateUserPlan(userId, planName);
      if (!planUpdated) {
        return res.status(500).json({ message: 'Error updating user plan.' });
      }

      return res.status(200).json({ message: `Successfully upgraded to ${planName} plan.` });
    } catch (error) {
      console.error('Error during payment processing:', error);
      return res.status(500).json({ message: 'An error occurred while processing your payment.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
