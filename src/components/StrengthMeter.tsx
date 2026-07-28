import { Shield, Zap, Clock, TrendingUp } from 'lucide-react';
import { type Strength, estimateCrackTime } from '@/lib/password';

type Props = {
  strength: Strength;
  entropyBits: number;
};

export function StrengthMeter({ strength, entropyBits }: Props) {
  const segments = 5;
  const filled = Math.max(strength.score, entropyBits > 0 ? 1 : 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-850/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-teal-400" />
          <span className="text-sm font-medium text-slate-300">Strength</span>
        </div>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>

      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background:
                i < filled ? strength.color : 'rgba(148, 163, 184, 0.14)',
              boxShadow: i < filled ? `0 0 12px ${strength.color}55` : 'none',
            }}
          />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <Stat
          icon={<TrendingUp size={14} />}
          label="Entropy"
          value={`${Math.round(entropyBits)} bits`}
        />
        <Stat
          icon={<Clock size={14} />}
          label="Crack time"
          value={estimateCrackTime(entropyBits)}
        />
        <Stat
          icon={<Zap size={14} />}
          label="Pool size"
          value={entropyBits > 0 ? 'Mixed' : '—'}
        />
      </dl>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-900/50 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-200">{value}</dd>
    </div>
  );
}
