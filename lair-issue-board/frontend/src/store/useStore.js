import { create } from 'zustand';
import * as api from '../services/api';

const useStore = create((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('lair_token');
    set({ user: null, isAuthenticated: false });
  },

  // Issues
  issues: [],
  loading: false,
  error: null,

  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      const issues = await api.fetchIssues();
      set({ issues, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addIssue: (issue) =>
    set((state) => ({
      issues: [issue, ...state.issues.filter((i) => i.id !== issue.id)],
    })),

  updateIssueInStore: (updated) =>
    set((state) => ({
      issues: state.issues.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)),
    })),

  // Kanban helpers
  getIssuesByStatus: (status) => {
    const { issues } = get();
    // Backlog includes both pending and review
    if (status === 'backlog') {
      return issues.filter((i) => i.status === 'pending' || i.status === 'review');
    }
    return issues.filter((i) => i.status === status);
  },

  // Users
  users: [],
  fetchUsers: async () => {
    try {
      const users = await api.fetchUsers();
      set({ users });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  },

  // Selected issue (detail panel)
  selectedIssueId: null,
  setSelectedIssueId: (id) => set({ selectedIssueId: id }),

  // Report form modal
  showReportForm: false,
  setShowReportForm: (show) => set({ showReportForm: show }),
}));

export default useStore;
