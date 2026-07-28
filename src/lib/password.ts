import { WORDLIST } from './wordlist';

export type CharSet = {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  customChars?: string;
};

export const AMBIGUOUS_CHARS = new Set(['I', 'l', 'O', '0', '1', '|', '`', "'", '"']);

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/~';

/** Cryptographically secure unbiased integer in [0, max). */
export function secureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) throw new Error('max must be a positive integer');
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 % max) + 1) % max;
  const arr = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value > limit);
  return value % max;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pool(set: keyof Omit<CharSet, 'excludeAmbiguous'>): string {
  return { lowercase: LOWER, uppercase: UPPER, numbers: DIGITS, symbols: SYMBOLS }[set];
}

function filterAmbiguous(s: string): string {
  return [...s].filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
}

export function generatePassword(length: number, sets: CharSet): string {
  const active: string[] = [];
  if (sets.lowercase) active.push(pool('lowercase'));
  if (sets.uppercase) active.push(pool('uppercase'));
  if (sets.numbers) active.push(pool('numbers'));
  if (sets.symbols) {
    active.push(sets.customChars ? sets.customChars : pool('symbols'));
  }

  if (active.length === 0) return '';

  const cleaned = sets.excludeAmbiguous ? active.map(filterAmbiguous) : active;
  const all = cleaned.join('');
  if (all.length === 0) return '';

  // Guarantee at least one character from each selected pool.
  const required: string[] = [];
  for (const c of cleaned) {
    if (c.length > 0) required.push(c[secureRandomInt(c.length)]);
  }

  const chars: string[] = [...required];
  while (chars.length < length) {
    chars.push(all[secureRandomInt(all.length)]);
  }

  return shuffle(chars).slice(0, length).join('');
}

export type PassphraseOptions = {
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
};

export function generatePassphrase(opts: PassphraseOptions): string {
  const parts: string[] = [];
  for (let i = 0; i < opts.words; i++) {
    let w = WORDLIST[secureRandomInt(WORDLIST.length)];
    if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    parts.push(w);
  }

  let result = parts.join(opts.separator);

  if (opts.includeNumber) {
    const pos = secureRandomInt(result.length + 1);
    const num = secureRandomInt(100).toString();
    result = result.slice(0, pos) + num + result.slice(pos);
  }
  if (opts.includeSymbol) {
    const sym = SYMBOLS[secureRandomInt(SYMBOLS.length)];
    const pos = secureRandomInt(result.length + 1);
    result = result.slice(0, pos) + sym + result.slice(pos);
  }
  return result;
}

/** Entropy in bits, the foundation of strength scoring. */
export function entropyBits(password: string, sets: CharSet): number {
  if (!password) return 0;
  let poolSize = 0;
  if (sets.lowercase) poolSize += 26;
  if (sets.uppercase) poolSize += 26;
  if (sets.numbers) poolSize += 10;
  if (sets.symbols) {
    poolSize += sets.customChars ? sets.customChars.length : SYMBOLS.length;
  }
  
  if (poolSize === 0) poolSize = 26;
  if (sets.excludeAmbiguous) poolSize = Math.max(poolSize - AMBIGUOUS_CHARS.size, 1);
  return password.length * Math.log2(poolSize);
}

export function passphraseEntropy(pw: string, opts: PassphraseOptions): number {
  if (!pw) return 0;
  let bits = opts.words * Math.log2(WORDLIST.length);
  if (opts.capitalize) bits += opts.words * Math.log2(2);
  if (opts.includeNumber) bits += Math.log2(100);
  if (opts.includeSymbol) bits += Math.log2(SYMBOLS.length);
  return bits;
}

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  percent: number;
};

export function strengthFromEntropy(bits: number): Strength {
  if (bits <= 0) return { score: 0, label: 'Empty', color: '#64748b', percent: 0 };
  if (bits < 35) return { score: 1, label: 'Very Weak', color: '#ef4444', percent: 20 };
  if (bits < 60) return { score: 2, label: 'Weak', color: '#f97316', percent: 40 };
  if (bits < 90) return { score: 3, label: 'Strong', color: '#eab308', percent: 70 };
  if (bits < 120) return { score: 4, label: 'Very Strong', color: '#22c55e', percent: 88 };
  return { score: 4, label: 'Fortress', color: '#2dd4bf', percent: 100 };
}

/** Rough crack-time estimate rendered for humans. Based on entropy + a guessed rate. */
export function estimateCrackTime(bits: number): string {
  if (bits <= 0) return 'Instantly';
  const guessesPerSecond = 1e10; // offline fast hash attack
  const seconds = Math.pow(2, bits) / guessesPerSecond / 2; // average = half the keyspace
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31557600) return `${Math.round(seconds / 86400)} days`;
  const years = seconds / 31557600;
  if (years < 1000) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1e6) return `${Math.round(years / 1000).toLocaleString()} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toPrecision(3)} million years`;
  if (years < 1e12) return `${(years / 1e9).toPrecision(3)} billion years`;
  if (years < 1e15) return `${(years / 1e12).toPrecision(3)} trillion years`;
  return 'Eternity';
}
