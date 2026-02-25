// Authentication middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Authentication required' });
}

// Role-based authorization
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Check if user can assign (lead only)
function canAssign(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { role } = req.user;
  if (role === 'lead') return next();
  // Developers can assign to themselves
  if (role === 'developer' && req.body.assignee_id === req.user.id) return next();
  res.status(403).json({ error: 'Only leads can assign issues to others' });
}

// Check if user can change priority (developer + lead)
function canChangePriority(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { role } = req.user;
  if (role === 'lead' || role === 'developer') return next();
  res.status(403).json({ error: 'Members cannot change priority' });
}

module.exports = { requireAuth, requireRole, canAssign, canChangePriority };
