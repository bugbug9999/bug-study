import { Plus, LogOut } from 'lucide-react';
import useStore from '../store/useStore';

export default function Header() {
  const { user, logout, setShowReportForm } = useStore();

  return (
    <header className="h-16 bg-lair-surface border-b border-lair-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏰</span>
        <h1 className="text-lg font-bold text-lair-text">Lair Issue Board</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lair-accent hover:bg-lair-accent-light text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          이슈 제보
        </button>

        <div className="flex items-center gap-3">
          {user?.github_avatar_url && (
            <img
              src={user.github_avatar_url}
              alt=""
              className="w-8 h-8 rounded-full border border-lair-border"
            />
          )}
          <span className="text-sm text-lair-muted">@{user?.github_login}</span>
          <span className="text-xs px-2 py-0.5 bg-lair-card border border-lair-border rounded text-lair-muted">
            {user?.role}
          </span>
          <button
            onClick={logout}
            className="p-2 text-lair-muted hover:text-lair-text transition-colors"
            title="로그아웃"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
