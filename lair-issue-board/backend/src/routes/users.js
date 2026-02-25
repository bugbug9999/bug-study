const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/users — list team members
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, github_login, github_name, github_avatar_url, role FROM users ORDER BY github_login'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role — change user role (lead only)
router.patch('/:id/role', requireAuth, requireRole('lead'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['member', 'developer', 'lead'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const { rows } = await db.query(
      'UPDATE users SET role = $2 WHERE id = $1 RETURNING id, github_login, github_name, github_avatar_url, role',
      [req.params.id, role]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
