const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lair-dev-jwt';

// Start GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Generate JWT for frontend
    const token = jwt.sign(
      {
        id: req.user.id,
        github_login: req.user.github_login,
        role: req.user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { id, github_login, github_name, github_avatar_url, role } = req.user;
  res.json({ id, github_login, github_name, github_avatar_url, role });
});

// Verify JWT (for SPA auth)
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

router.get('/failure', (_req, res) => {
  res.status(401).json({ error: 'GitHub authentication failed' });
});

module.exports = router;
