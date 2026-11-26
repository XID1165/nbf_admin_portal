import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { OtpInput } from '../ui/OtpInput';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { AuthError, type Challenge } from '../../services/types';

const RESEND_SECONDS = 30;

export function MfaForm({ challenge, onBack }: { challenge: Challenge; onBack: () => void }) {
  const { verifyOtp, resendOtp } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [round, setRound] = useState(0); // remount OTP boxes to clear them

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const submit = useCallback(async (code: string) => {
    setError(''); setBusy(true);
    try { await verifyOtp(challenge.challengeId, code); }
    catch (err) { setError(err instanceof AuthError ? err.message : 'Verification failed. Try again.'); setBusy(false); setRound((r) => r + 1); }
  }, [verifyOtp, challenge.challengeId]);

  async function resend() {
    setError('');
    try { await resendOtp(challenge.challengeId); setSeconds(RESEND_SECONDS); setRound((r) => r + 1); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not resend code.'); }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-primary underline-offset-2 hover:text-dark hover:underline">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />Back to sign in
      </button>
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldCheck className="size-6" aria-hidden="true" /></span>
      <p className="text-xs font-semibold uppercase tracking-wide text-dark">Step 2 of 2</p>
      <h2 className="mt-1 text-2xl font-semibold text-charcoal">Verify it&rsquo;s you</h2>
      <p className="mt-1 text-sm text-charcoal/70">Enter the 6-digit code sent to {challenge.maskedEmail}</p>
      <div className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}
        <OtpInput key={round} label="One-time passcode" onComplete={submit} disabled={busy} error={!!error} />
        <p aria-live="polite" className="flex h-5 items-center justify-center gap-2 text-sm text-charcoal/70">
          {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Verifying…</>
            : seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}`
            : <button type="button" onClick={resend} className="font-medium text-primary underline underline-offset-2 hover:text-dark">Resend code</button>}
        </p>
      </div>
    </div>
  );
}
