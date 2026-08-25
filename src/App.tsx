import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, TextCursorInput } from 'lucide-react';
import {
  type CharSet,
  type PassphraseOptions,
  generatePassword,
  generatePassphrase,
  entropyBits,
  passphraseEntropy,
  strengthFromEntropy,
} from '@/lib/password';
import { useCopyToClipboard } from '@/lib/useCopyToClipboard';
import { StrengthMeter } from '@/components/StrengthMeter';
import { HistoryPanel, type HistoryEntry } from '@/components/HistoryPanel';
import { Toggle } from '@/components/Toggle';
import { Slider } from '@/components/Controls';
import { PasswordDisplay } from '@/components/PasswordDisplay';

type Mode = 'password' | 'passphrase';

const DEFAULT_SETS: CharSet = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  customChars: '',
};

const DEFAULT_PASSPHRASE: PassphraseOptions = {
  words: 5,
  separator: '-',
  capitalize: true,
  includeNumber: true,
  includeSymbol: false,
};

const SEPARATORS = [
  { label: 'Dash', value: '-' },
  { label: 'Dot', value: '.' },
  { label: 'Space', value: ' ' },
  { label: 'Underscore', value: '_' },
  { label: 'None', value: '' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('password');
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState<CharSet>(DEFAULT_SETS);
  const [passphrase, setPassphrase] = useState<PassphraseOptions>(DEFAULT_PASSPHRASE);
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [autoClear, setAutoClear] = useState(false);
  const [copyState, copyToClipboard] = useCopyToClipboard();

  const noCharsetSelected = !sets.lowercase && !sets.uppercase && !sets.numbers && !sets.symbols;

  const generate = useCallback(() => {
    setIsGenerating(true);
    let next = '';
    if (mode === 'password') {
      if (!noCharsetSelected) next = generatePassword(length, sets);
    } else {
      next = generatePassphrase(passphrase);
    }
    setPassword(next);
    if (next) {
      setHistory((h) =>
        [{ id: crypto.randomUUID(), value: next, createdAt: Date.now(), kind: mode }, ...h].slice(0, 12),
      );
    }
    window.setTimeout(() => setIsGenerating(false), 250);
  }, [mode, length, sets, passphrase, noCharsetSelected]);

  // Generate on mount and whenever settings change.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, sets, passphrase]);

  const entropy = useMemo(() => {
    if (mode === 'password') return entropyBits(password, sets);
    return passphraseEntropy(password, passphrase);
  }, [mode, password, sets, passphrase]);

  const strength = useMemo(() => strengthFromEntropy(entropy), [entropy]);

  const handleCopy = useCallback(
    (text: string = password) => {
      if (text) copyToClipboard(text, autoClear ? 30000 : undefined);
    },
    [password, copyToClipboard, autoClear],
  );

  const removeFromHistory = useCallback((id: string) => {
    setHistory((h) => h.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  // Keyboard shortcut: spacebar (without focus in an input) regenerates.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
      if (e.code === 'Space' && !typing) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [generate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-slate-200">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between sm:mb-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-ink-950 shadow-lg shadow-teal-500/20 overflow-hidden p-2">
              <img src="/favicon.svg" alt="Passgen Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Inti Vision Glyph</h1>
              <p className="text-xs text-slate-500">Fortify your Secrets</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-6 min-w-0">
            {/* Mode switch */}
            <div className="inline-flex rounded-xl border border-white/5 bg-ink-850/60 p-1">
              <ModeButton
                active={mode === 'password'}
                onClick={() => setMode('password')}
                icon={<KeyRound size={15} />}
                label="Random Password"
              />
              <ModeButton
                active={mode === 'passphrase'}
                onClick={() => setMode('passphrase')}
                icon={<TextCursorInput size={15} />}
                label="Passphrase"
              />
            </div>

            <PasswordDisplay
              value={password}
              copyState={copyState}
              onCopy={() => handleCopy()}
              onRegenerate={generate}
              isGenerating={isGenerating}
            />

            <StrengthMeter strength={strength} entropyBits={entropy} />

            {/* Options */}
            <div className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-ink-850/60 p-5 backdrop-blur-sm sm:p-6">
              {mode === 'password' ? (
                <div className="space-y-5">
                  <Slider
                    label="Length"
                    value={length}
                    min={8}
                    max={64}
                    onChange={setLength}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Toggle
                      label="Uppercase (A–Z)"
                      checked={sets.uppercase}
                      onChange={(v) => setSets((s) => ({ ...s, uppercase: v }))}
                    />
                    <Toggle
                      label="Lowercase (a–z)"
                      checked={sets.lowercase}
                      onChange={(v) => setSets((s) => ({ ...s, lowercase: v }))}
                    />
                    <Toggle
                      label="Numbers (0–9)"
                      checked={sets.numbers}
                      onChange={(v) => setSets((s) => ({ ...s, numbers: v }))}
                    />
                    <Toggle
                      label="Symbols (!@#$)"
                      checked={sets.symbols}
                      onChange={(v) => setSets((s) => ({ ...s, symbols: v }))}
                    />
                  </div>

                  {sets.symbols && (
                    <div className="rounded-xl bg-ink-900/30 p-4 border border-white/5">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Custom Symbols
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. @#_-"
                        value={sets.customChars || ''}
                        onChange={(e) => {
                          const onlySymbols = e.target.value.replace(/[a-zA-Z0-9\s]/g, '');
                          setSets((s) => ({ ...s, customChars: onlySymbols }));
                        }}
                        className="w-full rounded-lg bg-ink-900/80 border border-white/10 px-3 py-2 text-sm text-slate-200 transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <p className="mt-2 text-[11px] text-slate-500">
                        If filled, these symbols will replace the default symbol set.
                      </p>
                    </div>
                  )}

                  <Toggle
                    label="Exclude ambiguous characters"
                    description="Skip look-alikes like I, l, O, 0, 1"
                    checked={sets.excludeAmbiguous}
                    onChange={(v) => setSets((s) => ({ ...s, excludeAmbiguous: v }))}
                  />
                  {noCharsetSelected && (
                    <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                      Select at least one character type to generate a password.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <Slider
                    label="Words"
                    value={passphrase.words}
                    min={3}
                    max={10}
                    onChange={(v) => setPassphrase((p) => ({ ...p, words: v }))}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Separator
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SEPARATORS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => setPassphrase((p) => ({ ...p, separator: s.value }))}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${passphrase.separator === s.value
                            ? 'bg-teal-500 text-ink-950'
                            : 'bg-ink-900/50 text-slate-400 hover:bg-ink-800 hover:text-slate-200'
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Toggle
                      label="Capitalize words"
                      checked={passphrase.capitalize}
                      onChange={(v) => setPassphrase((p) => ({ ...p, capitalize: v }))}
                    />
                    <Toggle
                      label="Append a number"
                      checked={passphrase.includeNumber}
                      onChange={(v) => setPassphrase((p) => ({ ...p, includeNumber: v }))}
                    />
                    <Toggle
                      label="Append a symbol"
                      checked={passphrase.includeSymbol}
                      onChange={(v) => setPassphrase((p) => ({ ...p, includeSymbol: v }))}
                    />
                  </div>
                </div>
              )}
              <div className="border-t border-white/5 pt-5">
                <Toggle
                  label="Auto-clear clipboard"
                  description="Clear copied password after 30 seconds"
                  checked={autoClear}
                  onChange={setAutoClear}
                />
              </div>
            </div>

            <p className="text-center text-xs text-slate-600">
              Press <kbd className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">Space</kbd> to regenerate · Everything runs locally in your browser
            </p>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start min-w-0">
            <HistoryPanel
              entries={history}
              onCopy={handleCopy}
              onRemove={removeFromHistory}
              onClear={clearHistory}
            />
          </aside>
        </div>

        <footer className="mt-14 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          Built with the Web Crypto API · No data leaves your device
        </footer>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active
        ? 'bg-teal-500 text-ink-950 shadow shadow-teal-500/20'
        : 'text-slate-400 hover:text-slate-200'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
