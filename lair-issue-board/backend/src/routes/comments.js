const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const githubService = require('../services/githubService');

// GET /api/comments?issue_id=xxx
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { issue_id } = req.query;
    if (!issue_id) return res.status(400).json({ error: 'issue_id required' });

    const { rows } = await db.query(
      `SELECT c.*, u.github_avatar_url as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [issue_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments — create comment (syncs to GitHub)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { issue_id, body } = req.body;
    if (!issue_id || !body?.trim()) {
      return res.status(400).json({ error: 'issue_id and body required' });
    }

    // Save locally
    const { rows } = await db.query(
      `INSERT INTO comments (issue_id, author_id, author_github_login, author_name, body, source)
       VALUES ($1, $2, $3, $4, $5, 'board')
       RETURNING *`,
      [issue_id, req.user.id, req.user.github_login, req.user.github_name, body]
    );
    const comment = rows[0];

    // Sync to GitHub if issue has a GitHub counterpart
    const { rows: issueRows } = await db.query(
      'SELECT github_issue_number FROM issues WHERE id = $1',
      [issue_id]
    );
    if (issueRows[0]?.github_issue_number) {
      const ghComment = await githubService.createComment(
        issueRows[0].github_issue_number,
        `**@${req.user.github_login}** (via Lair Issue Board):\n\n${body}`
      );
      await db.query(
        'UPDATE comments SET github_comment_id = $1 WHERE id = $2',
        [ghComment.id, comment.id]
      );
    }

    const broadcast = req.app.get('broadcast');
    broadcast('comment:created', { ...comment, issue_id });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
