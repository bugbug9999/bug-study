import { useDroppable } from '@dnd-kit/core';
import IssueCard from './IssueCard';

export default function KanbanColumn({ id, title, subtitle, issues }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 flex flex-col bg-lair-surface/50 rounded-xl border transition-colors ${
        isOver ? 'border-lair-accent bg-lair-accent/5' : 'border-lair-border'
      }`}
    >
      {/* Column header */}
      <div className="p-4 border-b border-lair-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lair-text">{title}</h2>
          <span className="text-xs bg-lair-card px-2 py-0.5 rounded-full text-lair-muted">
            {issues.length}
          </span>
        </div>
        <p className="text-xs text-lair-muted mt-1">{subtitle}</p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-lair-muted text-sm">이슈 없음</div>
        ) : (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
}
