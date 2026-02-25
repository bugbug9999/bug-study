import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import IssueCard from './IssueCard';
import useStore from '../store/useStore';
import * as api from '../services/api';

const COLUMNS = [
  { id: 'backlog', title: '📥 Backlog', subtitle: 'Pending / AI Review' },
  { id: 'in_review', title: '🔍 In Review', subtitle: 'GitHub Issue 생성됨' },
  { id: 'in_progress', title: '🛠 In Progress', subtitle: '담당자 작업 중' },
  { id: 'done', title: '✅ Done', subtitle: '처리 완료' },
];

// Map column IDs to issue statuses for drag-drop
const COLUMN_TO_STATUS = {
  backlog: 'review',
  in_review: 'in_review',
  in_progress: 'in_progress',
  done: 'done',
};

export default function KanbanBoard() {
  const { issues, getIssuesByStatus, updateIssueInStore } = useStore();
  const [activeId, setActiveId] = useState(null);

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id;
    const targetColumn = over.id;
    const newStatus = COLUMN_TO_STATUS[targetColumn];
    if (!newStatus) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    // Prevent moving to same column
    const currentColumn = issue.status === 'pending' || issue.status === 'review' ? 'backlog' : issue.status;
    if (currentColumn === targetColumn) return;

    try {
      const updated = await api.updateIssue(issueId, { status: newStatus });
      updateIssueInStore(updated);
    } catch (err) {
      console.error('Failed to move issue:', err);
    }
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 h-full overflow-x-auto">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            subtitle={col.subtitle}
            issues={getIssuesByStatus(col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? (
          <div className="drag-overlay">
            <IssueCard issue={activeIssue} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
