import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function handleAdminAction(req, res) {
  const { action, userId, planId, key, expiresAt } = req.body;

  // Authorization Check
  const isAdmin = req.headers['authorization'] === 'Bearer YOUR_SECRET_KEY';
  if (!isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  switch (action) {
    case 'create-key':
      try {
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
        await pool.query('DELETE FROM keys WHERE key = $1', [key]);
        return res.status(200).json({ message: 'Key deleted successfully!' });
      } catch (error) {
        console.error('Error deleting key:', error);
        return res.status(500).json({ message: 'Failed to delete key' });
      }

    case 'ban-user':
      try {
        await pool.query('UPDATE users SET banned = TRUE WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User banned successfully!' });
      } catch (error) {
        console.error('Error banning user:', error);
        return res.status(500).json({ message: 'Failed to ban user' });
      }

    case 'unban-user':
      try {
        await pool.query('UPDATE users SET banned = FALSE WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User unbanned successfully!' });
      } catch (error) {
        console.error('Error unbanning user:', error);
        return res.status(500).json({ message: 'Failed to unban user' });
      }

    case 'assign-plan':
      try {
        await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [planId, userId]);
        return res.status(200).json({ message: `Plan assigned to user!` });
      } catch (error) {
        console.error('Error assigning plan:', error);
        return res.status(500).json({ message: 'Failed to assign plan' });
      }

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
