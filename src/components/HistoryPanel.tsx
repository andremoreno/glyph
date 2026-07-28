import { History, Copy, Trash2, Clock, Download } from 'lucide-react';

export type HistoryEntry = {
  id: string;
  value: string;
  createdAt: number;
  kind: 'password' | 'passphrase';
};

type Props = {
  entries: HistoryEntry[];
  onCopy: (value: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function HistoryPanel({ entries, onCopy, onRemove, onClear }: Props) {
  const handleExport = () => {
    const text = entries
      .map((e) => `[${new Date(e.createdAt).toLocaleString()}] ${e.kind.toUpperCase()}: ${e.value}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ivipassgen-history.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-ink-850/60 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-200">Recent</h2>
          <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {entries.length}
          </span>
        </div>
        {entries.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              title="Export History"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-ink-700 hover:text-teal-400"
            >
              <Download size={13} /> Export
            </button>
            <button
              onClick={onClear}
              title="Clear History"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-ink-700 hover:text-rose-400"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        )}
      </div>

      <div className="cipher-scroll max-h-[420px] flex-1 overflow-y-auto p-3">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <Clock size={28} className="text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">No passwords yet</p>
            <p className="mt-1 text-xs text-slate-600">
              Generated passwords appear here for the session.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-transparent bg-ink-900/40 px-3 py-2.5 transition hover:border-white/5 hover:bg-ink-800/60"
              >
                <code className="flex-1 truncate font-mono text-sm text-slate-300">
                  {e.value}
                </code>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-600">
                  {e.kind === 'passphrase' ? 'phrase' : 'pw'}
                </span>
                <span className="shrink-0 text-[10px] text-slate-600">{timeAgo(e.createdAt)}</span>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => onCopy(e.value)}
                    title="Copy"
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-ink-700 hover:text-teal-400"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onRemove(e.id)}
                    title="Remove"
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-ink-700 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="border-t border-white/5 px-5 py-2.5 text-[11px] text-slate-600">
        History lives only in this browser session and clears when you close the tab.
      </p>
    </div>
  );
}
