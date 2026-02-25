import { useDraggable } from '@dnd-kit/core';
import { Clock, ExternalLink, GitPullRequest, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';

const CATEGORY_CONFIG = {
  bug: { emoji: '🐛', label: 'Bug', color: 'text-red-400' },
  ux_ui: { emoji: '🎨', label: 'UX/UI', color: 'text-purple-400' },
  feature: { emoji: '💡', label: 'Feature', color: 'text-blue-400' },
  performance: { emoji: '⚡', label: 'Performance', color: 'text-yellow-400' },
  other: { emoji: '📝', label: 'Other', color: 'text-gray-400' },
};

const PRIORITY_CONFIG = {
  P0: { label: 'P0', color: 'bg-red-600 text-white' },
  P1: { label: 'P1', color: 'bg-orange-500 text-white' },
  P2: { label: 'P2', color: 'bg-yellow-500 text-black' },
  P3: { label: 'P3', color: 'bg-gray-500 text-white' },
};

const STATUS_BADGE = {
  pending: { label: '⏳ Pending', color: 'text-yellow-400' },
  review: { label: '👀 Review', color: 'text-blue-400' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function IssueCard({ issue }) {
  const { setSelectedIssueId } = useStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.other;
  const pri = PRIORITY_CONFIG[issue.priority];
  const statusBadge = STATUS_BADGE[issue.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => setSelectedIssueId(issue.id)}
      className={`bg-lair-card border border-lair-border rounded-lg p-4 cursor-pointer hover:border-lair-accent/50 transition-all ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      {/* Top row: priority + category */}
      <div className="flex items-center gap-2 mb-2">
        {pri && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pri.color}`}>
            {pri.label}
          </span>
        )}
        <span className={`text-xs ${cat.color}`}>
          {cat.emoji} {cat.label}
        </span>
        {statusBadge && (
          <span className={`text-xs ml-auto ${statusBadge.color}`}>{statusBadge.label}</span>
        )}
        {issue.ai_status === 'processing' && (
          <Loader2 size={14} className="ml-auto text-lair-accent animate-spin" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-lair-text leading-snug mb-3">
        {issue.title || issue.raw_input?.slice(0, 60) || '(AI 정제 중...)'}
      </h3>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-lair-muted">
        <div className="flex items-center gap-2">
          <span>@{issue.reporter_name || issue.reporter_login || '?'}</span>
          {issue.assignee_github_login && (
            <span className="text-lair-accent">→ @{issue.assignee_github_login}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {issue.github_issue_number && (
            <span className="flex items-center gap-0.5">
              <ExternalLink size={10} />#{issue.github_issue_number}
            </span>
          )}
          {issue.linked_pr_number && (
            <span className="flex items-center gap-0.5 text-lair-success">
              <GitPullRequest size={10} />#{issue.linked_pr_number}
            </span>
          )}
        </div>
      </div>

      {/* Source & chain badges */}
      {(issue.source || issue.chain) && (
        <div className="flex items-center gap-2 mt-2">
          {issue.source && (
            <span className="text-[10px] bg-lair-surface px-1.5 py-0.5 rounded text-lair-muted">
              {issue.source}
            </span>
          )}
          {issue.chain && (
            <span className="text-[10px] bg-lair-surface px-1.5 py-0.5 rounded text-lair-muted">
              {issue.chain}
            </span>
          )}
        </div>
      )}

      {/* Time */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-lair-muted">
        <Clock size={10} />
        {timeAgo(issue.created_at)}
      </div>
    </div>
  );
}
