import { useEffect, useState } from 'react';
import {
  X, ExternalLink, GitPullRequest, Clock, CheckCircle2,
  Loader2, AlertCircle, Lightbulb, Send, UserPlus,
} from 'lucide-react';
import useStore from '../store/useStore';
import * as api from '../services/api';

const CATEGORY_CONFIG = {
  bug: { emoji: '🐛', label: 'Bug' },
  ux_ui: { emoji: '🎨', label: 'UX/UI' },
  feature: { emoji: '💡', label: 'Feature' },
  performance: { emoji: '⚡', label: 'Performance' },
  other: { emoji: '📝', label: 'Other' },
};

const PRIORITY_CONFIG = {
  P0: { label: 'P0 Critical', color: 'bg-red-600' },
  P1: { label: 'P1 High', color: 'bg-orange-500' },
  P2: { label: 'P2 Medium', color: 'bg-yellow-500' },
  P3: { label: 'P3 Low', color: 'bg-gray-500' },
};

const STATUS_LABELS = {
  pending: '⏳ Pending',
  review: '👀 AI Review 완료',
  in_review: '🔍 In Review',
  in_progress: '🛠 In Progress',
  done: '✅ Done',
};

const CATEGORIES = ['bug', 'ux_ui', 'feature', 'performance', 'other'];
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];

export default function IssueDetailPanel() {
  const { selectedIssueId, setSelectedIssueId, issues, users, user, updateIssueInStore } = useStore();
  const issue = issues.find((i) => i.id === selectedIssueId);

  const [logs, setLogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [approving, setApproving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!selectedIssueId) return;
    api.fetchIssueLogs(selectedIssueId).then(setLogs).catch(() => {});
    api.fetchComments(selectedIssueId).then(setComments).catch(() => {});
  }, [selectedIssueId]);

  if (!issue) return null;

  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.other;
  const pri = PRIORITY_CONFIG[issue.priority];
  const canApprove = issue.status === 'review' && !issue.github_issue_number;
  const canAssignIssue = user?.role === 'lead' || (user?.role === 'developer');

  async function handleApprove() {
    setApproving(true);
    try {
      const result = await api.approveIssue(issue.id);
      updateIssueInStore(result.issue);
      api.fetchIssueLogs(selectedIssueId).then(setLogs).catch(() => {});
    } catch (err) {
      alert(`승인 실패: ${err.message}`);
    } finally {
      setApproving(false);
    }
  }

  async function handleAssign(assigneeId) {
    try {
      const updated = await api.assignIssue(issue.id, assigneeId);
      updateIssueInStore(updated);
      setAssigning(false);
      api.fetchIssueLogs(selectedIssueId).then(setLogs).catch(() => {});
    } catch (err) {
      alert(`배정 실패: ${err.message}`);
    }
  }

  async function handleSaveEdit() {
    try {
      const updated = await api.updateIssue(issue.id, editForm);
      updateIssueInStore(updated);
      setEditing(false);
    } catch (err) {
      alert(`수정 실패: ${err.message}`);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const comment = await api.createComment(issue.id, commentText);
      setComments([...comments, comment]);
      setCommentText('');
    } catch (err) {
      alert(`코멘트 실패: ${err.message}`);
    }
  }

  function startEditing() {
    setEditForm({
      title: issue.title || '',
      category: issue.category || 'other',
      priority: issue.priority || 'P2',
      description: issue.description || '',
      resolution_suggestion: issue.resolution_suggestion || '',
    });
    setEditing(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => setSelectedIssueId(null)}
      />
      <div className="relative w-full max-w-2xl bg-lair-surface border-l border-lair-border h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-lair-surface z-10 p-5 border-b border-lair-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {pri && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${pri.color}`}>
                  {pri.label}
                </span>
              )}
              <span className="text-sm">{cat.emoji} {cat.label}</span>
              {issue.github_issue_number && (
                <a
                  href={issue.github_issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-lair-accent hover:underline"
                >
                  #{issue.github_issue_number} <ExternalLink size={10} />
                </a>
              )}
            </div>
            <button
              onClick={() => setSelectedIssueId(null)}
              className="p-1 text-lair-muted hover:text-lair-text"
            >
              <X size={18} />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-lair-text">
            {issue.title || issue.raw_input?.slice(0, 80) || '(처리 중...)'}
          </h2>
        </div>

        <div className="p-5 space-y-6">
          {/* Status / Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-lair-muted">상태</span>
              <div className="mt-1 font-medium">{STATUS_LABELS[issue.status]}</div>
            </div>
            <div>
              <span className="text-lair-muted">담당자</span>
              <div className="mt-1 font-medium flex items-center gap-2">
                {issue.assignee_github_login ? (
                  `@${issue.assignee_github_login}`
                ) : (
                  <span className="text-lair-muted">미배정</span>
                )}
                {canAssignIssue && issue.status !== 'done' && (
                  <button
                    onClick={() => setAssigning(!assigning)}
                    className="p-1 text-lair-accent hover:text-lair-accent-light"
                    title="담당자 배정"
                  >
                    <UserPlus size={14} />
                  </button>
                )}
              </div>
              {assigning && (
                <div className="mt-2 bg-lair-card border border-lair-border rounded-lg p-2 space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAssign(u.id)}
                      className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-lair-border transition-colors flex items-center gap-2"
                    >
                      {u.github_avatar_url && (
                        <img src={u.github_avatar_url} className="w-5 h-5 rounded-full" alt="" />
                      )}
                      @{u.github_login}
                      <span className="text-xs text-lair-muted ml-auto">{u.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <span className="text-lair-muted">제보자</span>
              <div className="mt-1">@{issue.reporter_name || issue.reporter_login || '?'}</div>
            </div>
            <div>
              <span className="text-lair-muted">제보일</span>
              <div className="mt-1">{new Date(issue.created_at).toLocaleDateString('ko-KR')}</div>
            </div>
            {issue.source && (
              <div>
                <span className="text-lair-muted">출처</span>
                <div className="mt-1">{issue.source}</div>
              </div>
            )}
            {issue.chain && (
              <div>
                <span className="text-lair-muted">체인</span>
                <div className="mt-1">{issue.chain} {issue.version && `${issue.version}`}</div>
              </div>
            )}
            {issue.linked_pr_number && (
              <div className="col-span-2">
                <span className="text-lair-muted">연결된 PR</span>
                <a
                  href={issue.linked_pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-lair-success hover:underline"
                >
                  <GitPullRequest size={14} /> PR #{issue.linked_pr_number}
                </a>
              </div>
            )}
          </div>

          {/* Approve / Edit buttons for review state */}
          {(canApprove || issue.status === 'review') && (
            <div className="flex gap-3">
              {!editing && (
                <button
                  onClick={startEditing}
                  className="flex-1 py-2.5 border border-lair-border text-lair-text rounded-lg hover:bg-lair-card transition-colors text-sm font-medium"
                >
                  수정하기
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex-1 py-2.5 bg-lair-accent hover:bg-lair-accent-light disabled:opacity-40 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {approving ? 'GitHub 등록 중...' : 'GitHub에 등록 ✓'}
                </button>
              )}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="bg-lair-card border border-lair-accent/30 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-lair-muted">제목</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full mt-1 bg-lair-surface border border-lair-border rounded px-3 py-2 text-sm text-lair-text focus:outline-none focus:border-lair-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-lair-muted">카테고리</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full mt-1 bg-lair-surface border border-lair-border rounded px-3 py-2 text-sm text-lair-text focus:outline-none focus:border-lair-accent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-lair-muted">우선순위</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full mt-1 bg-lair-surface border border-lair-border rounded px-3 py-2 text-sm text-lair-text focus:outline-none focus:border-lair-accent"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-lair-muted">상세 내용</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full mt-1 bg-lair-surface border border-lair-border rounded px-3 py-2 text-sm text-lair-text focus:outline-none focus:border-lair-accent resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-lair-muted">해결 방향</label>
                <textarea
                  value={editForm.resolution_suggestion}
                  onChange={(e) => setEditForm({ ...editForm, resolution_suggestion: e.target.value })}
                  rows={3}
                  className="w-full mt-1 bg-lair-surface border border-lair-border rounded px-3 py-2 text-sm text-lair-text focus:outline-none focus:border-lair-accent resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 border border-lair-border rounded text-sm text-lair-muted hover:text-lair-text"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 bg-lair-accent text-white rounded text-sm hover:bg-lair-accent-light"
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* Detail content (read mode) */}
          {!editing && issue.description && (
            <div>
              <h3 className="text-sm font-semibold text-lair-muted mb-2">상세 내용</h3>
              <div className="bg-lair-card border border-lair-border rounded-lg p-4 text-sm text-lair-text whitespace-pre-wrap">
                {issue.description}
              </div>
            </div>
          )}

          {!editing && issue.resolution_suggestion && (
            <div>
              <h3 className="text-sm font-semibold text-lair-muted mb-2 flex items-center gap-1">
                <Lightbulb size={14} /> 해결 방향 제안
              </h3>
              <div className="bg-lair-card border border-lair-border rounded-lg p-4 text-sm text-lair-text whitespace-pre-wrap">
                {issue.resolution_suggestion}
              </div>
            </div>
          )}

          {/* Raw input */}
          {issue.raw_input && (
            <div>
              <h3 className="text-sm font-semibold text-lair-muted mb-2">원문</h3>
              <div className="bg-lair-card/50 border border-lair-border rounded-lg p-3 text-xs text-lair-muted italic">
                "{issue.raw_input}"
              </div>
            </div>
          )}

          {/* AI Activity Log */}
          {logs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-lair-muted mb-2">🤖 AI 활동 로그</h3>
              <div className="bg-lair-card border border-lair-border rounded-lg p-4 space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    {log.status === 'completed' && <CheckCircle2 size={14} className="text-lair-success mt-0.5" />}
                    {log.status === 'processing' && <Loader2 size={14} className="text-lair-accent animate-spin mt-0.5" />}
                    {log.status === 'failed' && <AlertCircle size={14} className="text-lair-danger mt-0.5" />}
                    <span className="text-lair-text">{log.detail}</span>
                    <span className="text-lair-muted ml-auto whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-lair-muted mb-2">
              💬 코멘트 {issue.github_issue_number && <span className="text-xs font-normal">(GitHub 동기화)</span>}
            </h3>

            {comments.length > 0 && (
              <div className="space-y-3 mb-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-lair-card border border-lair-border rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-lair-muted mb-1">
                      <span className="font-medium text-lair-text">
                        @{c.author_github_login || c.author_name}
                      </span>
                      {c.source === 'github' && (
                        <span className="text-[10px] bg-lair-surface px-1.5 py-0.5 rounded">GitHub</span>
                      )}
                      <span className="ml-auto">
                        {new Date(c.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-lair-text whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="코멘트 입력..."
                className="flex-1 bg-lair-card border border-lair-border rounded-lg px-3 py-2 text-sm text-lair-text placeholder-lair-muted/50 focus:outline-none focus:border-lair-accent"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-lair-accent text-white rounded-lg disabled:opacity-40 hover:bg-lair-accent-light transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
