import { delay, initialsOf, type Tone } from './controls';
import { auditLog } from './auditLog';

export type AuditModule = 'Auth' | 'Applications' | 'Users' | 'Accounts' | 'Access';
export interface AuditEvent { id: string; time: string; actor: { name: string; initials: string; tone: Tone }; parts: { t: string; em?: boolean }[]; module: AuditModule; ip: string | null }
export interface AuditTrailService { load(currentUser: { username: string; displayName: string }): Promise<AuditEvent[]> }

const E = (id: string, time: string, name: string, tone: Tone, parts: AuditEvent['parts'], module: AuditModule, ip: string | null): AuditEvent =>
  ({ id, time: `Today ${time}`, actor: { name, initials: name === 'System' ? 'S' : name === 'IT Admin' ? 'IA' : initialsOf(name).slice(0, 2), tone }, parts, module, ip });
const t = (s: string) => ({ t: s });
const em = (s: string) => ({ t: s, em: true });

/** Phrases for events recorded by this session's mock services (everything else is ignored). */
function live(code: string, result: string, detail?: string): { parts: AuditEvent['parts']; module: AuditModule } | null {
  const ok = result === 'SUCCESS';
  if (code.startsWith('CONTROL_REQUEST_') && detail) return { parts: [t(detail)], module: /account|debit|credit|full block/i.test(detail) ? 'Accounts' : 'Users' };
  const m: Record<string, [string, AuditModule]> = {
    LOGIN_MFA: ['signed in with Active Directory and MFA', 'Auth'], LOGIN_SSO: ['signed in via Windows SSO', 'Auth'], LOGOUT: ['signed out', 'Auth'],
    USER_BLOCK_REQUESTED: ['requested a user block', 'Users'], USER_UNBLOCK_REQUESTED: ['requested a user unblock', 'Users'],
    USER_BLOCK_APPROVED: ['approved a user block', 'Users'], USER_UNBLOCK_APPROVED: ['approved a user unblock', 'Users'],
    USER_BLOCK_REJECTED: ['rejected a user block', 'Users'], USER_UNBLOCK_REJECTED: ['rejected a user unblock', 'Users'],
    ACCOUNT_BLOCK_REQUESTED: ['requested an account block', 'Accounts'], ACCOUNT_UNBLOCK_REQUESTED: ['requested an account unblock', 'Accounts'],
    ACCOUNT_BLOCK_APPROVED: ['approved an account block', 'Accounts'], ACCOUNT_UNBLOCK_APPROVED: ['approved an account unblock', 'Accounts'],
    ACCOUNT_BLOCK_REJECTED: ['rejected an account block', 'Accounts'], ACCOUNT_UNBLOCK_REJECTED: ['rejected an account unblock', 'Accounts'],
  };
  if (code === 'LOGIN_PASSWORD' && !ok) return { parts: [t('had a failed sign-in attempt')], module: 'Auth' };
  const hit = m[code];
  return hit && ok ? { parts: [t(hit[0])], module: hit[1] } : null;
}

/** In-memory mock; swap for an API-backed implementation behind the same interface. */
export const auditTrail: AuditTrailService = {
  async load(me) {
    await delay();
    const mine = auditLog.list().flatMap((e, i) => {
      const l = live(e.action, e.result, e.detail); if (!l) return [];
      const own = e.user === me.username;
      const name = own ? me.displayName : e.user;
      const d = new Date(e.timestamp);
      return [{ id: `live-${i}`, time: `Today ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, actor: { name, initials: initialsOf(name).slice(0, 2), tone: 'teal' as Tone }, parts: l.parts, module: l.module, ip: null }];
    }).reverse();
    return [
      ...mine,
      E('s1', '08:51', 'Rashid Al Ketbi', 'slate', [t('moved application to Credit check '), em('APP-26-11-0482')], 'Applications', '10.12.4.31'),
      E('s2', '08:44', 'Omar Haddad', 'dark', [t('requested unblock of account •••• '), em('4419')], 'Accounts', '10.12.6.08'),
      E('s3', '08:30', 'Noura Al Mazrouei', 'teal', [t('requested unblock of user '), em('Layla Al Suwaidi')], 'Users', '10.12.6.14'),
      E('s4', '07:12', 'System', 'slate', [t('auto-blocked user after 5 failed OTPs '), em('Layla Al Suwaidi')], 'Users', null),
      E('s5', '06:58', 'Mariam Al Zaabi', 'slate', [t('approved KYC documents '), em('APP-26-11-0457')], 'Applications', '10.12.4.19'),
      E('s6', '06:20', 'IT Admin', 'teal', [t('added user to AD group NBF-BO-Checkers '), em('Omar Haddad')], 'Access', '10.10.1.2'),
      E('s7', '06:02', 'Khalid Al Dhaheri', 'dark', [t('signed in via Windows SSO '), em('Back-office Portal')], 'Auth', '10.12.4.77'),
    ];
  },
};
