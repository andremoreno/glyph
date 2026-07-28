import { Check } from 'lucide-react';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, description, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
        checked
          ? 'border-teal-500/40 bg-teal-500/10'
          : 'border-white/5 bg-ink-900/40 hover:border-white/10 hover:bg-ink-800/50'
      } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        )}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? 'bg-teal-500' : 'bg-ink-700'
        }`}
      >
        <span
          className={`absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-all ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        >
          {checked && <Check size={10} className="text-teal-600" strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}
