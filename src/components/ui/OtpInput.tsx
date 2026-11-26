import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

interface Props { length?: number; onComplete: (code: string) => void; disabled?: boolean; error?: boolean; label: string; }
/** Remount (change `key`) to clear. Supports auto-advance, backspace, arrow keys and paste. */
export function OtpInput({ length = 6, onComplete, disabled, error, label }: Props) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const live = useRef<string[]>(digits); // synchronous mirror so fast typing never reads stale state
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function commit(next: string[], focus: number) {
    live.current = next;
    setDigits(next);
    refs.current[Math.min(focus, length - 1)]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  }
  function onChange(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...live.current]; next[i] = d;
    commit(next, d ? i + 1 : i);
  }
  function onKeyDown(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !live.current[i] && i > 0) { e.preventDefault(); const n = [...live.current]; n[i - 1] = ''; commit(n, i - 1); }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  }
  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, k) => text[k] ?? '');
    commit(next, text.length);
  }
  return (
    <div role="group" aria-label={label} className="flex justify-between gap-2" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1} disabled={disabled} aria-label={`Digit ${i + 1} of ${length}`} autoFocus={i === 0}
          onChange={(e) => onChange(i, e.target.value)} onKeyDown={(e) => onKeyDown(i, e)} onFocus={(e) => e.target.select()}
          className={`h-12 w-full min-w-0 rounded-control border bg-white text-center text-lg font-semibold text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 ${error ? 'border-danger' : 'border-charcoal/12'}`} />
      ))}
    </div>
  );
}
