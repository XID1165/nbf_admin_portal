import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert, type AlertKind } from '../ui/Alert';
import { AuthError, type Challenge } from '../../services/types';
import { useAuth } from '../../context/AuthContext';

export function validateUsername(v: string): string {
  const t = v.trim();
  if (!t) return 'Enter your username.';
  if (/\s/.test(t)) return 'Username cannot contain spaces.';
  if (t.includes('@')) return /^[^\s@]+@nbf\.ae$/i.test(t) ? '' : 'Use the format user@nbf.ae.';
  if (t.includes('\\')) return /^nbf\\[\w.-]+$/i.test(t) ? '' : 'Use the format NBF\\username.';
  return /^[\w.-]+$/.test(t) ? '' : 'Username contains invalid characters.';
}
const BANNERS: Record<string, { kind: AlertKind; title: string; text?: string }> = {
  INVALID_CREDENTIALS: { kind: 'error', title: 'Sign-in failed' },
  ACCOUNT_LOCKED: { kind: 'locked', title: 'Account locked', text: 'Too many failed attempts or a security lock. Contact the IT Service Desk to unlock your account.' },
  ACCOUNT_DISABLED: { kind: 'disabled', title: 'Account disabled', text: 'Your account has been disabled. Contact the IT Service Desk.' },
  NETWORK: { kind: 'network', title: 'Connection problem', text: 'We could not reach the authentication service. Check your connection and try again.' },
};

export function CredentialsForm({ onChallenge }: { onChallenge: (c: Challenge) => void }) {
  const { signIn, signInWithSso } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [banner, setBanner] = useState<{ kind: AlertKind; title: string; text: string } | null>(null);
  const [busy, setBusy] = useState<'pw' | 'sso' | null>(null);

  const fail = (err: unknown) => {
    const code = err instanceof AuthError ? err.code : 'NETWORK';
    const b = BANNERS[code] ?? BANNERS.NETWORK;
    setBanner({ kind: b.kind, title: b.title, text: b.text ?? (err as Error).message });
  };
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = { username: validateUsername(username), password: password ? '' : 'Enter your password.' };
    setErrors(next); setBanner(null);
    if (next.username || next.password) return;
    setBusy('pw');
    try { onChallenge(await signIn(username, password)); } catch (err) { fail(err); setBusy(null); }
  }
  async function onSso() {
    setBanner(null); setBusy('sso');
    try { await signInWithSso(); } catch (err) { fail(err); setBusy(null); }
  }
  const caret = (e: KeyboardEvent) => setCaps(e.getModifierState('CapsLock'));

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-success-50 px-2.5 text-success"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" />Directory online</span>
        <span className="inline-flex h-6 items-center rounded-full bg-charcoal/5 px-2.5 font-normal text-charcoal/70">corp.nbf.ae</span>
      </div>
      <h2 className="mt-[26px] text-2xl font-medium leading-[30px] text-charcoal">Sign in</h2>
      <p className="mt-2.5 text-sm leading-5 text-charcoal/70">Use your NBF network credentials.</p>
      <form onSubmit={onSubmit} noValidate className="mt-[34px] space-y-5">
        {banner && <Alert kind={banner.kind} title={banner.title}>{banner.text}</Alert>}
        <Input label="Username" value={username} autoComplete="username" placeholder="NBF\firstname.lastname"
          onChange={(e) => setUsername(e.target.value)} onBlur={() => username && setErrors((x) => ({ ...x, username: validateUsername(username) }))}
          error={errors.username} icon={<User className="size-4" aria-hidden="true" />} />
        <Input label="Password" type={show ? 'text' : 'password'} value={password} autoComplete="current-password" placeholder="Enter your password"
          labelAction={<a href="mailto:servicedesk@nbf.ae?subject=Password%20reset" className="text-xs font-medium text-primary underline-offset-2 hover:text-dark hover:underline">Forgot password?</a>}
          onChange={(e) => setPassword(e.target.value)} onKeyUp={caret} onKeyDown={caret} onBlur={() => setCaps(false)}
          error={errors.password} hint={caps ? 'Caps Lock is on.' : undefined} icon={<Lock className="size-4" aria-hidden="true" />}
          trailing={<button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
            className="rounded-control p-2 text-charcoal/70 hover:text-dark">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} />
        <label className="flex items-center gap-3 text-sm text-charcoal"><input type="checkbox" defaultChecked className="size-[18px] rounded accent-primary" />Trust this device for 8 hours</label>
        <Button type="submit" loading={busy === 'pw'} disabled={busy === 'sso'} className="w-full shadow-[0_6px_16px_-6px_rgb(var(--primary)/0.6)]">Sign in<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-charcoal/60" role="separator">
        <span className="h-px flex-1 bg-charcoal/12" />or<span className="h-px flex-1 bg-charcoal/12" />
      </div>
      <Button variant="secondary" onClick={onSso} loading={busy === 'sso'} disabled={busy === 'pw'} className="w-full">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx=".8" /><rect x="9" y="1.5" width="5.5" height="5.5" rx=".8" /><rect x="1.5" y="9" width="5.5" height="5.5" rx=".8" /><rect x="9" y="9" width="5.5" height="5.5" rx=".8" /></svg>
        Continue with Windows sign-in
      </Button>
      <p className="mt-8 flex items-start gap-3 rounded-control bg-charcoal/5 p-4 text-xs leading-5 text-charcoal/70"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-charcoal/70" aria-hidden="true" />Authorised NBF personnel only. All sessions and actions are recorded in the audit trail in line with bank security policy.</p>
    </div>
  );
}
