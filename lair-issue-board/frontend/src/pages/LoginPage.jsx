import { Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lair-bg">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏰</div>
          <h1 className="text-3xl font-bold text-lair-text mb-2">Lair Issue Board</h1>
          <p className="text-lair-muted">
            AI가 이슈를 정제하고, GitHub과 실시간 동기화되는 칸반 시스템
          </p>
        </div>

        <div className="bg-lair-surface border border-lair-border rounded-xl p-8">
          <a
            href="/auth/github"
            className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-lair-card hover:bg-lair-border border border-lair-border rounded-lg transition-colors text-lair-text font-medium"
          >
            <Github size={20} />
            GitHub로 로그인
          </a>

          <div className="mt-6 text-center text-lair-muted text-sm">
            <p>GitHub 계정으로 로그인하면 별도 가입 없이</p>
            <p>바로 이슈를 제보하고 관리할 수 있어요.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-lair-muted">
            <div className="bg-lair-surface border border-lair-border rounded-lg p-3">
              <div className="text-lg mb-1">🤖</div>
              <div>AI 자동 분류</div>
            </div>
            <div className="bg-lair-surface border border-lair-border rounded-lg p-3">
              <div className="text-lg mb-1">🔄</div>
              <div>GitHub 동기화</div>
            </div>
            <div className="bg-lair-surface border border-lair-border rounded-lg p-3">
              <div className="text-lg mb-1">📋</div>
              <div>칸반 보드</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
