import { useEffect } from 'react';
import useStore from '../store/useStore';
import KanbanBoard from '../components/KanbanBoard';
import IssueReportForm from '../components/IssueReportForm';
import IssueDetailPanel from '../components/IssueDetailPanel';

export default function BoardPage() {
  const { fetchIssues, fetchUsers, showReportForm, selectedIssueId } = useStore();

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  return (
    <div className="h-[calc(100vh-64px)]">
      <KanbanBoard />
      {showReportForm && <IssueReportForm />}
      {selectedIssueId && <IssueDetailPanel />}
    </div>
  );
}
