import { useCallback, useEffect, useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'error';

/** Copy text to the clipboard with a transient "copied" status. */
export function useCopyToClipboard(resetMs = 1600): [CopyState, (text: string, clearAfterMs?: number) => Promise<void>] {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);

  const copy = useCallback(
    async (text: string, clearAfterMs?: number) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        setState('copied');
      } catch {
        setState('error');
      }
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState('idle'), resetMs);

      window.clearTimeout(clearTimer.current);
      if (clearAfterMs) {
        clearTimer.current = window.setTimeout(async () => {
          if (navigator.clipboard && window.isSecureContext) {
            try {
              await navigator.clipboard.writeText('');
            } catch {}
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
