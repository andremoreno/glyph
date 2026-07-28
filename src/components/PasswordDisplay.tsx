import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';

type Props = {
  value: string;
  copyState: 'idle' | 'copied' | 'error';
  onCopy: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
};

export function PasswordDisplay({ value, copyState, onCopy, onRegenerate, isGenerating }: Props) {
  const empty = !value;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-850/90 to-ink-900/90 p-5 shadow-2xl shadow-black/40 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          {empty ? (
            <div className="flex h-12 items-center">
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-ink-700/60" />
            </div>
          ) : (
            <div
              key={value}
              className="animate-flashIn break-all font-mono text-xl font-medium tracking-wide text-slate-100 sm:text-2xl"
            >
              {value}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-800/70 text-slate-300 transition hover:border-teal-500/50 hover:text-teal-300 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={`transition-transform duration-500 ${
                isGenerating ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
          </button>

          <button
            onClick={onCopy}
            disabled={empty}
            className={`flex h-12 items-center gap-2 rounded-xl px-5 font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
              copyState === 'copied'
                ? 'bg-emerald-500 text-white'
                : copyState === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'bg-teal-500 text-ink-950 hover:bg-teal-400'
            }`}
          >
            {copyState === 'copied' ? (
              <>
                <Check size={18} strokeWidth={2.5} /> Copied
              </>
            ) : copyState === 'error' ? (
              <>
                <AlertCircle size={18} /> Failed
              </>
            ) : (
              <>
                <Copy size={18} /> Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
