import { useCallback, useEffect, useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'error';

/** Copy text to the clipboard with a transient "copied" status. */
export function useCopyToClipboard(resetMs = 1600): [CopyState, (text: string, clearAfterMs?: number) => Promise<void>] {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);

  const writeText = async (textToCopy: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      try {
        ta.focus();
        ta.select();
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const copy = useCallback(
    async (text: string, clearAfterMs?: number) => {
      try {
        await writeText(text);
        setState('copied');
      } catch {
        setState('error');
      }

      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState('idle'), resetMs);

      window.clearTimeout(clearTimer.current);
      if (clearAfterMs) {
        clearTimer.current = window.setTimeout(async () => {
          try {
            await writeText('');
          } catch (e) {
            // Ignore failure to clear clipboard
            console.error('Failed to clear clipboard', e);
          }
        }, clearAfterMs);
      }
    },
    [resetMs],
  );

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(clearTimer.current);
  }, []);

  return [state, copy];
}
