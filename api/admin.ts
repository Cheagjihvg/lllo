import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://default:ptxTHP9sA3Gh@ep-late-tree-a4b4ckrl.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function handleAdminAction(req: NextApiRequest, res: NextApiResponse) {
  const { action, userId, planId, key, expiresAt } = req.body;

  switch (action) {
    // Key Management
    case 'create-key':
      try {
        // Create a new key with expiration date
        const result = await pool.query(
          'INSERT INTO keys (key, expires_at) VALUES ($1, $2) RETURNING *',
          [key, expiresAt]
        );
        return res.status(200).json({ message: 'Key created successfully!', key: result.rows[0] });
      } catch (error) {
        console.error('Error creating key:', error);
        return res.status(500).json({ message: 'Failed to create key' });
      }

    case 'delete-key':
      try {
        // Delete the key
        await pool.query('DELETE FROM keys WHERE key = $1', [key]);
        return res.status(200).json({ message: 'Key deleted successfully!' });
      } catch (error) {
        console.error('Error deleting key:', error);
        return res.status(500).json({ message: 'Failed to delete key' });
      }

    // User Management
    case 'ban-user':
      try {
        // Ban the user
        await pool.query('UPDATE users SET banned = TRUE WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User banned successfully!' });
      } catch (error) {
        console.error('Error banning user:', error);
        return res.status(500).json({ message: 'Failed to ban user' });
      }

    case 'unban-user':
      try {
        // Unban the user
        await pool.query('UPDATE users SET banned = FALSE WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User unbanned successfully!' });
      } catch (error) {
        console.error('Error unbanning user:', error);
        return res.status(500).json({ message: 'Failed to unban user' });
      }

    // Plan Management
    case 'assign-plan':
      try {
        // Assign a plan to the user
        await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [planId, userId]);
        return res.status(200).json({ message: `Plan assigned to user!` });
      } catch (error) {
        console.error('Error assigning plan:', error);
        return res.status(500).json({ message: 'Failed to assign plan' });
      }

    // Fetch Key List
    case 'show-keys':
      try {
        const result = await pool.query(
          `SELECT keys.id AS key_id, keys.key, keys.expires_at, users.id AS user_id, users.username
           FROM keys
           LEFT JOIN users ON keys.user_id = users.id`
        );
        return res.status(200).json(result.rows);
      } catch (error) {
        console.error('Error fetching keys:', error);
        return res.status(500).json({ message: 'Failed to fetch keys' });
      }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}

export default handleAdminAction;
