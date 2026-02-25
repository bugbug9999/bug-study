const { Octokit } = require('@octokit/rest');
const db = require('../db');

function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

const owner = () => process.env.GITHUB_OWNER;
const repo = () => process.env.GITHUB_REPO;

const CATEGORY_LABELS = {
  bug: 'bug',
  ux_ui: 'ux/ui',
  feature: 'enhancement',
  performance: 'performance',
  other: 'other',
};

const PRIORITY_LABELS = {
  P0: 'P0-critical',
  P1: 'P1-high',
  P2: 'P2-medium',
  P3: 'P3-low',
};

// Create GitHub issue from approved board issue
async function createIssue(issue) {
  const octokit = getOctokit();

  const labels = [
    CATEGORY_LABELS[issue.category] || 'other',
    PRIORITY_LABELS[issue.priority] || 'P2-medium',
  ];
  if (issue.chain) labels.push(issue.chain.toLowerCase());
  labels.push('needs-assignee');

  const body = `## 📋 이슈 요약
${issue.title}

## ${issue.category === 'bug' ? '🐛' : '📝'} 카테고리 / 우선순위
${CATEGORY_LABELS[issue.category] || issue.category} / ${issue.priority}

## 📝 상세 내용
${issue.description || issue.raw_input}

## 💡 해결 방향
${issue.resolution_suggestion || '(미정)'}

## 🔗 출처 / 환경
- 출처: ${issue.source || '미지정'}
- 체인: ${issue.chain || '미지정'}
- 버전: ${issue.version || '미지정'}
- 제보자: @${issue.reporter_name || 'anonymous'}

---
*Created by Lair Issue Board*`;

  const { data } = await octokit.issues.create({
    owner: owner(),
    repo: repo(),
    title: issue.title,
    body,
    labels,
  });

  // Update local issue record
  await db.query(
    `UPDATE issues SET
      github_issue_number = $2,
      github_issue_url = $3,
      github_issue_id = $4,
      status = 'in_review'
     WHERE id = $1`,
    [issue.id, data.number, data.html_url, data.id]
  );

  // Log
  await db.query(
    `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
    [issue.id, 'github_issue_created', `GitHub Issue #${data.number} 생성됨`]
  );

  return data;
}

// Set assignee on GitHub issue
async function setAssignee(githubIssueNumber, githubLogin) {
  const octokit = getOctokit();
  await octokit.issues.addAssignees({
    owner: owner(),
    repo: repo(),
    issue_number: githubIssueNumber,
    assignees: [githubLogin],
  });
  // Remove needs-assignee label
  try {
    await octokit.issues.removeLabel({
      owner: owner(),
      repo: repo(),
      issue_number: githubIssueNumber,
      name: 'needs-assignee',
    });
  } catch (_) {
    // Label might not exist
  }
}

// Add in-progress label
async function setInProgress(githubIssueNumber) {
  const octokit = getOctokit();
  await octokit.issues.addLabels({
    owner: owner(),
    repo: repo(),
    issue_number: githubIssueNumber,
    labels: ['in-progress'],
  });
}

// Close GitHub issue
async function closeIssue(githubIssueNumber) {
  const octokit = getOctokit();
  await octokit.issues.update({
    owner: owner(),
    repo: repo(),
    issue_number: githubIssueNumber,
    state: 'closed',
  });
}

// Create comment on GitHub issue
async function createComment(githubIssueNumber, body) {
  const octokit = getOctokit();
  const { data } = await octokit.issues.createComment({
    owner: owner(),
    repo: repo(),
    issue_number: githubIssueNumber,
    body,
  });
  return data;
}

module.exports = {
  createIssue,
  setAssignee,
  setInProgress,
  closeIssue,
  createComment,
};
