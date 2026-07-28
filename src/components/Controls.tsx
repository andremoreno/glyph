import { RefreshCw } from 'lucide-react';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  unit?: string;
};

export function Slider({ value, min, max, onChange, label, unit }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="rounded-lg bg-ink-700 px-2.5 py-1 text-sm font-semibold tabular-nums text-teal-300">
          {value}
          {unit ? <span className="ml-0.5 text-xs text-slate-500">{unit}</span> : null}
        </span>
      </div>
      <input
        type="range"
        className="cipher-slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function RegenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Regenerate"
      className="group flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-800/70 text-slate-300 transition hover:border-teal-500/50 hover:text-teal-300 active:scale-95"
    >
      <RefreshCw
        size={18}
        className="transition-transform duration-500 group-hover:rotate-180"
      />
    </button>
  );
}
