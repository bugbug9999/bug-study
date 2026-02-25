const router = require('express').Router();
const db = require('../db');
const { requireAuth, canAssign, canChangePriority } = require('../middleware/auth');
const aiService = require('../services/aiService');
const githubService = require('../services/githubService');

// GET /api/issues — list all issues (with optional filters)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, category, priority, assignee_id } = req.query;
    let query = `
      SELECT i.*,
        u_reporter.github_login as reporter_login,
        u_reporter.github_avatar_url as reporter_avatar,
        u_assignee.github_login as assignee_login,
        u_assignee.github_avatar_url as assignee_avatar
      FROM issues i
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND i.status = $${idx++}`;
      params.push(status);
    }
    if (category) {
      query += ` AND i.category = $${idx++}`;
      params.push(category);
    }
    if (priority) {
      query += ` AND i.priority = $${idx++}`;
      params.push(priority);
    }
    if (assignee_id) {
      query += ` AND i.assignee_id = $${idx++}`;
      params.push(assignee_id);
    }

    query += ` ORDER BY i.created_at DESC`;
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/issues/:id — single issue detail
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT i.*,
        u_reporter.github_login as reporter_login,
        u_reporter.github_avatar_url as reporter_avatar,
        u_assignee.github_login as assignee_login,
        u_assignee.github_avatar_url as assignee_avatar
       FROM issues i
       LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
       LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Issue not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/issues — create new issue (team member reports)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { raw_input, source, chain, version } = req.body;
    if (!raw_input?.trim()) {
      return res.status(400).json({ error: 'raw_input is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO issues (raw_input, source, chain, version, reporter_id, reporter_name, status, ai_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'pending')
       RETURNING *`,
      [raw_input, source, chain, version, req.user.id, req.user.github_login]
    );

    const issue = rows[0];
    const broadcast = req.app.get('broadcast');

    // Broadcast new card to kanban
    broadcast('issue:created', issue);

    // Kick off AI processing in background
    aiService.processIssue(issue.id, raw_input, source, chain, version).then((result) => {
      if (result.success) {
        // Fetch updated issue and broadcast
        db.query('SELECT * FROM issues WHERE id = $1', [issue.id]).then(({ rows }) => {
          broadcast('issue:updated', rows[0]);
        });
      }
    });

    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/issues/:id — update issue fields (edit AI draft, change status, etc.)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const allowed = [
      'title', 'category', 'priority', 'description',
      'resolution_suggestion', 'source', 'chain', 'version', 'status',
    ];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        // Permission checks
        if (field === 'priority' && req.user.role === 'member') {
          return res.status(403).json({ error: 'Members cannot change priority' });
        }
        updates.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!rows[0]) return res.status(404).json({ error: 'Issue not found' });

    const broadcast = req.app.get('broadcast');
    broadcast('issue:updated', rows[0]);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/issues/:id/approve — approve AI draft → create GitHub issue
router.post('/:id/approve', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM issues WHERE id = $1', [req.params.id]);
    const issue = rows[0];
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (issue.github_issue_number) {
      return res.status(400).json({ error: 'GitHub issue already created' });
    }

    // Create GitHub issue
    const ghIssue = await githubService.createIssue(issue);

    // Fetch updated issue
    const { rows: updated } = await db.query('SELECT * FROM issues WHERE id = $1', [issue.id]);

    const broadcast = req.app.get('broadcast');
    broadcast('issue:updated', updated[0]);

    res.json({ issue: updated[0], github_issue: ghIssue });
  } catch (err) {
    next(err);
  }
});

// POST /api/issues/:id/assign — assign issue to team member (manual)
router.post('/:id/assign', requireAuth, canAssign, async (req, res, next) => {
  try {
    const { assignee_id } = req.body;

    // Get assignee info
    const { rows: userRows } = await db.query('SELECT * FROM users WHERE id = $1', [assignee_id]);
    if (!userRows[0]) return res.status(404).json({ error: 'User not found' });
    const assignee = userRows[0];

    // Update local issue
    const { rows } = await db.query(
      `UPDATE issues SET
        assignee_id = $2,
        assignee_github_login = $3,
        status = CASE WHEN status IN ('in_review', 'review') THEN 'in_progress' ELSE status END
       WHERE id = $1 RETURNING *`,
      [req.params.id, assignee.id, assignee.github_login]
    );
    const issue = rows[0];
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Sync to GitHub if issue exists
    if (issue.github_issue_number) {
      await githubService.setAssignee(issue.github_issue_number, assignee.github_login);
      if (issue.status === 'in_progress') {
        await githubService.setInProgress(issue.github_issue_number);
      }
    }

    await db.query(
      `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
      [issue.id, 'assignee_set', `담당자 배정: @${assignee.github_login}`]
    );

    const broadcast = req.app.get('broadcast');
    broadcast('issue:updated', issue);

    res.json(issue);
  } catch (err) {
    next(err);
  }
});

// GET /api/issues/:id/logs — AI activity logs
router.get('/:id/logs', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM ai_logs WHERE issue_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
