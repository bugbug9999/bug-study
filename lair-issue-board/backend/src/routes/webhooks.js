const router = require('express').Router();
const crypto = require('crypto');
const express = require('express');
const db = require('../db');

// Raw body parser for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

function verifySignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // Skip in dev if no secret configured
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.body);
  const expected = `sha256=${hmac.digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// POST /api/webhooks/github
router.post('/github', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const payload = JSON.parse(req.body.toString());
  const broadcast = req.app.get('broadcast');

  try {
    switch (event) {
      case 'issues':
        await handleIssueEvent(payload, broadcast);
        break;
      case 'issue_comment':
        await handleCommentEvent(payload, broadcast);
        break;
      case 'pull_request':
        await handlePREvent(payload, broadcast);
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function handleIssueEvent(payload, broadcast) {
  const { action, issue, assignee } = payload;
  const issueNumber = issue.number;

  // Find our local issue
  const { rows } = await db.query(
    'SELECT * FROM issues WHERE github_issue_number = $1',
    [issueNumber]
  );
  if (!rows[0]) return;
  const localIssue = rows[0];

  switch (action) {
    case 'assigned': {
      if (assignee) {
        // Find user by github login
        const { rows: users } = await db.query(
          'SELECT * FROM users WHERE github_login = $1',
          [assignee.login]
        );
        const userId = users[0]?.id || null;
        await db.query(
          `UPDATE issues SET assignee_id = $2, assignee_github_login = $3, status = 'in_progress' WHERE id = $1`,
          [localIssue.id, userId, assignee.login]
        );
      }
      break;
    }
    case 'labeled': {
      const label = payload.label?.name;
      if (label === 'in-progress') {
        await db.query(
          `UPDATE issues SET status = 'in_progress' WHERE id = $1`,
          [localIssue.id]
        );
      }
      break;
    }
    case 'closed': {
      await db.query(
        `UPDATE issues SET status = 'done' WHERE id = $1`,
        [localIssue.id]
      );
      break;
    }
    case 'reopened': {
      await db.query(
        `UPDATE issues SET status = 'in_review' WHERE id = $1`,
        [localIssue.id]
      );
      break;
    }
  }

  // Broadcast updated issue
  const { rows: updated } = await db.query('SELECT * FROM issues WHERE id = $1', [localIssue.id]);
  broadcast('issue:updated', updated[0]);
}

async function handleCommentEvent(payload, broadcast) {
  const { action, comment, issue } = payload;
  if (action !== 'created') return;

  // Don't re-sync comments from our own bot
  if (comment.body.includes('(via Lair Issue Board)')) return;

  const { rows } = await db.query(
    'SELECT * FROM issues WHERE github_issue_number = $1',
    [issue.number]
  );
  if (!rows[0]) return;

  const { rows: existing } = await db.query(
    'SELECT * FROM comments WHERE github_comment_id = $1',
    [comment.id]
  );
  if (existing[0]) return; // Already synced

  const { rows: inserted } = await db.query(
    `INSERT INTO comments (issue_id, author_github_login, author_name, body, github_comment_id, source)
     VALUES ($1, $2, $3, $4, $5, 'github')
     RETURNING *`,
    [rows[0].id, comment.user.login, comment.user.login, comment.body, comment.id]
  );

  broadcast('comment:created', { ...inserted[0], issue_id: rows[0].id });
}

async function handlePREvent(payload, broadcast) {
  const { action, pull_request } = payload;
  const prBody = pull_request.body || '';

  // Detect "closes #N" pattern
  const closePattern = /(?:closes?|fixes?|resolves?)\s+#(\d+)/gi;
  let match;
  while ((match = closePattern.exec(prBody)) !== null) {
    const issueNumber = parseInt(match[1], 10);
    const { rows } = await db.query(
      'SELECT * FROM issues WHERE github_issue_number = $1',
      [issueNumber]
    );
    if (!rows[0]) continue;

    if (action === 'opened' || action === 'synchronize') {
      await db.query(
        `UPDATE issues SET linked_pr_number = $2, linked_pr_url = $3 WHERE id = $1`,
        [rows[0].id, pull_request.number, pull_request.html_url]
      );
      await db.query(
        `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
        [rows[0].id, 'pr_linked', `PR #${pull_request.number} 연결됨`]
      );
    }

    if (action === 'closed' && pull_request.merged) {
      await db.query(
        `UPDATE issues SET status = 'done' WHERE id = $1`,
        [rows[0].id]
      );
      await db.query(
        `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
        [rows[0].id, 'pr_merged', `PR #${pull_request.number} Merge 완료 → Done`]
      );
    }

    const { rows: updated } = await db.query('SELECT * FROM issues WHERE id = $1', [rows[0].id]);
    broadcast('issue:updated', updated[0]);
  }
}

module.exports = router;
