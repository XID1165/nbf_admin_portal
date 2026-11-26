import { auditLog } from './auditLog';
import { AuthError, type AuthService, type Challenge, type Session, type UserProfile } from './types';

const PASSWORD = 'Nbf@2026';
const OTP = '123456';
const MAX_ATTEMPTS = 5;

const u = (id: string, username: string, displayName: string, role: UserProfile['role']): UserProfile =>
  ({ id, username, displayName, email: `${username}@nbf.ae`, role });
const DIRECTORY: UserProfile[] = [
  u('1', 'it.admin', 'Ahmed Al Zaabi', 'IT'),
  u('2', 'mkt.user', 'Layla Hassan', 'Marketing'),
  u('3', 'prod.user', 'Omar Khalid', 'Product'),
  u('4', 'bo.user', 'Sara Nasser', 'BackOffice'),
  u('5', 'bo.checker', 'Hamad Al Ketbi', 'BackOfficeChecker'),
];
const LOCKED = new Set(['locked.user']);
const DISABLED = new Set(['disabled.user']);
const NETWORK_FAIL = new Set(['network.user']);

const failed = new Map<string, number>();
const challenges = new Map<string, UserProfile>();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Accepts `NBF\name`, `name@nbf.ae` or `name`; returns lowercase bare name. */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^nbf\\/i, '').replace(/@nbf\.ae$/i, '').toLowerCase();
}
const mask = (email: string) => email.replace(/^(.).*(@.*)$/, '$1•••$2');
const toSession = (user: UserProfile): Session => ({ user, role: user.role, signedInAt: new Date().toISOString() });

export const auth: AuthService = {
  async signIn(rawUsername, password): Promise<Challenge> {
    const name = normalizeUsername(rawUsername);
    await wait(700);
    const fail = (code: ConstructorParameters<typeof AuthError>[0], msg: string): never => {
      auditLog.record({ user: name, action: 'LOGIN_PASSWORD', result: `FAILURE:${code}` });
      throw new AuthError(code, msg);
    };
    if (NETWORK_FAIL.has(name)) fail('NETWORK', 'Unable to reach the authentication server.');
    if (LOCKED.has(name) || (failed.get(name) ?? 0) >= MAX_ATTEMPTS) fail('ACCOUNT_LOCKED', 'Account locked.');
    if (DISABLED.has(name)) fail('ACCOUNT_DISABLED', 'Account disabled.');
    const user = DIRECTORY.find((d) => d.username === name);
    if (!user || password !== PASSWORD) {
      const n = (failed.get(name) ?? 0) + 1;
      failed.set(name, n);
      if (n >= MAX_ATTEMPTS) fail('ACCOUNT_LOCKED', 'Account locked.');
      fail('INVALID_CREDENTIALS', `Invalid username or password. ${MAX_ATTEMPTS - n} attempt(s) remaining.`);
    }
    failed.delete(name);
    const challengeId = crypto.randomUUID();
    challenges.set(challengeId, user!);
    auditLog.record({ user: name, action: 'LOGIN_PASSWORD', result: 'SUCCESS' });
    return { challengeId, maskedEmail: mask(user!.email) };
  },

  async verifyOtp(challengeId, code): Promise<Session> {
    await wait(600);
    const user = challenges.get(challengeId);
    if (!user) throw new AuthError('OTP_EXPIRED', 'Verification expired. Please sign in again.');
    if (code !== OTP) {
      auditLog.record({ user: user.username, action: 'LOGIN_MFA', result: 'FAILURE:INVALID_OTP' });
      throw new AuthError('INVALID_OTP', 'Incorrect code. Please try again.');
    }
    challenges.delete(challengeId);
    auditLog.record({ user: user.username, action: 'LOGIN_MFA', result: 'SUCCESS' });
    return toSession(user);
  },

  async resendOtp(challengeId) {
    await wait(400);
    const user = challenges.get(challengeId);
    if (!user) throw new AuthError('OTP_EXPIRED', 'Verification expired. Please sign in again.');
    auditLog.record({ user: user.username, action: 'MFA_RESEND', result: 'SUCCESS' });
  },

  /** Mock SSO: IdP already enforces MFA, so it resolves directly to a session. */
  async signInWithSso(): Promise<Session> {
    await wait(900);
    const user = DIRECTORY[0];
    auditLog.record({ user: user.username, action: 'LOGIN_SSO', result: 'SUCCESS' });
    return toSession(user);
  },
};

export const DEMO_ACCOUNTS = [
  ...DIRECTORY.map((d) => ({ username: d.username, note: ({ IT: 'IT · view only', Marketing: 'no access to Customer controls', Product: 'no access to Customer controls', BackOffice: 'Back-office maker', BackOfficeChecker: 'Back-office checker' } as Record<string, string>)[d.role] })),
  { username: 'locked.user', note: 'locked error' },
  { username: 'disabled.user', note: 'disabled error' },
  { username: 'network.user', note: 'network error' },
];
export const DEMO_PASSWORD = PASSWORD;
export const DEMO_OTP = OTP;
