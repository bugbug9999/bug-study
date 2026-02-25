import { useState } from 'react';
import { X, Send } from 'lucide-react';
import useStore from '../store/useStore';
import * as api from '../services/api';

const SOURCES = [
  { value: '', label: '선택 (선택사항)' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'internal', label: '내부' },
  { value: 'partner', label: '파트너' },
  { value: 'other', label: '기타' },
];

const CHAINS = [
  { value: '', label: '선택 (선택사항)' },
  { value: 'Kaia', label: 'Kaia' },
  { value: 'Berachain', label: 'Berachain' },
  { value: 'Ethereum', label: 'Ethereum' },
  { value: 'Arbitrum', label: 'Arbitrum' },
  { value: 'Other', label: '기타' },
];

export default function IssueReportForm() {
  const { setShowReportForm, addIssue } = useStore();
  const [form, setForm] = useState({
    raw_input: '',
    source: '',
    chain: '',
    version: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.raw_input.trim()) return;

    setSubmitting(true);
    try {
      const issue = await api.createIssue({
        raw_input: form.raw_input,
        source: form.source || null,
        chain: form.chain || null,
        version: form.version || null,
      });
      addIssue(issue);
      setShowReportForm(false);
    } catch (err) {
      alert(`제보 실패: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-lair-surface border border-lair-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-lair-border">
          <h2 className="text-lg font-semibold text-lair-text">새 이슈 제보</h2>
          <button
            onClick={() => setShowReportForm(false)}
            className="p-1.5 text-lair-muted hover:text-lair-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Raw input */}
          <div>
            <label className="block text-sm text-lair-muted mb-2">
              어떤 문제인가요? (자유롭게 써주세요)
            </label>
            <textarea
              value={form.raw_input}
              onChange={(e) => setForm({ ...form, raw_input: e.target.value })}
              placeholder="예: Kaia에서 stKAIA 스왑하면 에러뜸. Confirm 눌렀는데 그냥 실패함"
              rows={4}
              className="w-full bg-lair-card border border-lair-border rounded-lg px-4 py-3 text-sm text-lair-text placeholder-lair-muted/50 focus:outline-none focus:border-lair-accent resize-none"
              autoFocus
            />
          </div>

          {/* Source & Chain */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-lair-muted mb-2">출처</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full bg-lair-card border border-lair-border rounded-lg px-3 py-2.5 text-sm text-lair-text focus:outline-none focus:border-lair-accent"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-lair-muted mb-2">체인</label>
              <select
                value={form.chain}
                onChange={(e) => setForm({ ...form, chain: e.target.value })}
                className="w-full bg-lair-card border border-lair-border rounded-lg px-3 py-2.5 text-sm text-lair-text focus:outline-none focus:border-lair-accent"
              >
                {CHAINS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm text-lair-muted mb-2">앱 버전</label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="예: v2.1.3"
              className="w-full bg-lair-card border border-lair-border rounded-lg px-4 py-2.5 text-sm text-lair-text placeholder-lair-muted/50 focus:outline-none focus:border-lair-accent"
            />
          </div>

          {/* Info */}
          <div className="bg-lair-card/50 border border-lair-border rounded-lg p-3 text-xs text-lair-muted">
            🤖 제보하면 AI가 자동으로 제목, 카테고리, 우선순위, 해결 방향을 작성합니다.
            <br />
            AI 초안을 검토한 후 "GitHub에 등록" 버튼으로 승인하면 이슈가 생성됩니다.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!form.raw_input.trim() || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-lair-accent hover:bg-lair-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            <Send size={16} />
            {submitting ? 'AI 분석 요청 중...' : '제보하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
