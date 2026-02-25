const API_BASE = '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('lair_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: getHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Issues
export const fetchIssues = (params) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/issues${qs ? `?${qs}` : ''}`);
};

export const fetchIssue = (id) => request(`/issues/${id}`);

export const createIssue = (data) =>
  request('/issues', { method: 'POST', body: JSON.stringify(data) });

export const updateIssue = (id, data) =>
  request(`/issues/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const approveIssue = (id) =>
  request(`/issues/${id}/approve`, { method: 'POST' });

export const assignIssue = (id, assignee_id) =>
  request(`/issues/${id}/assign`, { method: 'POST', body: JSON.stringify({ assignee_id }) });

export const fetchIssueLogs = (id) => request(`/issues/${id}/logs`);

// Comments
export const fetchComments = (issue_id) => request(`/comments?issue_id=${issue_id}`);

export const createComment = (issue_id, body) =>
  request('/comments', { method: 'POST', body: JSON.stringify({ issue_id, body }) });

// Users
export const fetchUsers = () => request('/users');

// Auth
export const verifyAuth = () => request('/auth/verify');
