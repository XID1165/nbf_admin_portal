import { auditLog } from './auditLog';
import type { Role } from './types';

/* ------------------------------------------------------------------ shared helpers */
export type Tone = 'slate' | 'success' | 'dark' | 'teal' | 'gold';
export const initialsOf = (name: string) => name.split(' ').filter((w) => w !== 'Al').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
/** Mock core-banking latency: 600–1200 ms. */
const latency = () => delay(600 + Math.random() * 600);

/* ------------------------------------------------------------------ model */
export type SearchType = 'cif' | 'account' | 'eid' | 'mobile' | 'username';
export const SEARCH_TYPES: { value: SearchType; label: string; placeholder: string }[] = [
  { value: 'cif', label: 'CIF', placeholder: 'e.g. 100001' },
  { value: 'account', label: 'Account no.', placeholder: 'e.g. 0380 0000 1000 0112 233' },
  { value: 'eid', label: 'Emirates ID', placeholder: 'e.g. 784-1988-4521096-3' },
  { value: 'mobile', label: 'Mobile', placeholder: 'e.g. +971 50 123 4567' },
  { value: 'username', label: 'Username', placeholder: 'e.g. fatima.nuaimi' },
];

export type UserStatus = 'active' | 'blocked' | 'locked' | 'dormant';
export type AccountStatus = 'active' | 'full_block' | 'debit_block' | 'credit_block' | 'closed';
export type ActionKind = 'block' | 'unblock' | 'full_block' | 'debit_block' | 'credit_block';
export type TargetKind = 'user' | 'account';

/** Reasons offered in the action modal (block reasons follow the "Block account" design). */
export const BLOCK_REASONS = ['Suspected fraud', 'Customer request', 'Lost or stolen device', 'Regulatory / court order', 'Failed verification', 'Other'] as const;
export const UNBLOCK_REASONS = ['Customer request', 'Identity re-verified', 'Investigation cleared', 'Court order lifted', 'Other'] as const;

export interface BlockInfo { reason: string; date: string; by: string }
export interface DigitalUser { username: string; status: UserStatus; lastLogin: string; devices: number; failedAttempts: number; block?: BlockInfo }
export interface Account { id: string; type: string; number: string; currency: 'AED' | 'USD'; balance: number; status: AccountStatus; complianceHold?: boolean; block?: BlockInfo }
export interface Customer { cif: string; name: string; segment: string; emiratesId: string; mobile: string; user: DigitalUser; accounts: Account[] }
export interface CustomerSummary { cif: string; name: string; userStatus: UserStatus | 'pending'; accounts: number }

export interface ControlRequest {
  id: string;
  cif: string; customerName: string;
  target: { kind: TargetKind; id: string; label: string };
  action: ActionKind; from: string; to: string;
  reason: string; remarks: string;
  maker: string; makerName: string; createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  checkerName?: string; decidedAt?: string; comment?: string;
  /** Maker has dismissed the rejection banner. */
  acknowledged?: boolean;
}
export interface ActivityEntry { id: string; at: string; actor: string; text: string; outcome: 'success' | 'failure' | 'info' }
export interface CustomerView { customer: Customer; pending: ControlRequest[]; rejected: ControlRequest[]; activity: ActivityEntry[] }
export interface Actor { username: string; displayName: string; role: Role }
export interface SubmitInput { cif: string; target: { kind: TargetKind; id: string }; action: ActionKind; reason: string; remarks: string }

export type ControlsErrorCode = 'SERVICE_UNAVAILABLE' | 'CORE_TIMEOUT' | 'CONCURRENT_CHANGE' | 'COMPLIANCE_HOLD' | 'ALREADY_IN_STATE' | 'PENDING_EXISTS' | 'SELF_APPROVAL' | 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID';
export class ControlsError extends Error {
  constructor(public code: ControlsErrorCode, message: string) { super(message); this.name = 'ControlsError'; }
}

export interface ControlsService {
  search(type: SearchType, query: string): Promise<CustomerSummary[]>;
  /** Every customer plus all pending requests; feeds the User controls and Account controls lists. */
  listAll(): Promise<{ customers: Customer[]; pending: ControlRequest[] }>;
  getCustomer(cif: string): Promise<CustomerView>;
  /** Clears a concurrent-change conflict and returns the latest record. */
  refresh(cif: string): Promise<CustomerView>;
  submit(input: SubmitInput, actor: Actor): Promise<ControlRequest>;
  listPending(): Promise<ControlRequest[]>;
  approve(id: string, actor: Actor): Promise<ControlRequest>;
  reject(id: string, comment: string, actor: Actor): Promise<ControlRequest>;
  acknowledge(id: string): void;
  pendingCount(kind?: TargetKind): number;
  subscribe(fn: () => void): () => void;
}

/* ------------------------------------------------------------------ permissions */
export interface Caps { view: boolean; initiate: boolean; decide: boolean }
/** BackOffice maker initiates, checker decides, IT is view-only; Marketing/Product have no access. */
export function capsFor(role: Role): Caps {
  switch (role) {
    case 'BackOffice': return { view: true, initiate: true, decide: false };
    case 'BackOfficeChecker': return { view: true, initiate: false, decide: true };
    case 'IT': return { view: true, initiate: false, decide: false };
    default: return { view: false, initiate: false, decide: false };
  }
}

/* ------------------------------------------------------------------ labels / helpers */
export const USER_STATUS_LABEL: Record<UserStatus, string> = { active: 'Active', blocked: 'Blocked', locked: 'Locked – failed attempts', dormant: 'Dormant' };
export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = { active: 'Active', full_block: 'Full block', debit_block: 'Debit block', credit_block: 'Credit block', closed: 'Closed' };
export const ACTION_LABEL: Record<ActionKind, string> = { block: 'Block', unblock: 'Unblock', full_block: 'Full block', debit_block: 'Debit block', credit_block: 'Credit block' };
export const isBlockAction = (a: ActionKind) => a !== 'unblock';

export const maskAccount = (n: string) => `•••• ${n.replace(/\D/g, '').slice(-4)}`;
export const maskEid = (id: string) => { const [a, , c, d] = id.split('-'); return `${a}-••••-•••••${c.slice(-2)}-${d}`; };
export const maskMobile = (m: string) => `${m.slice(0, 4)} •• ••• ${m.replace(/\D/g, '').slice(-4)}`;

/** Actions that make sense for the current state of a user. */
export function userActions(u: DigitalUser): ActionKind[] {
  return u.status === 'blocked' || u.status === 'locked' ? ['unblock'] : ['block'];
}
/** Actions that make sense for an account; closed accounts allow none. */
export function accountActions(a: Account): ActionKind[] {
  switch (a.status) {
    case 'active': return ['full_block', 'debit_block', 'credit_block'];
    case 'debit_block': case 'credit_block': return ['full_block', 'unblock'];
    case 'full_block': return ['unblock'];
    default: return [];
  }
}

/* ------------------------------------------------------------------ seed data */
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
const acc = (id: string, type: string, number: string, currency: Account['currency'], balance: number, status: AccountStatus = 'active', extra: Partial<Account> = {}): Account =>
  ({ id, type, number, currency, balance, status, ...extra });
const usr = (username: string, status: UserStatus, lastLogin: string, devices: number, extra: Partial<DigitalUser> = {}): DigitalUser =>
  ({ username, status, lastLogin, devices, failedAttempts: 0, ...extra });

function seedCustomers(): Customer[] {
  return [
    { cif: '100001', name: 'Fatima Al Nuaimi', segment: 'Premier', emiratesId: '784-1988-4521096-3', mobile: '+971 50 123 4567',
      user: usr('fatima.nuaimi', 'active', 'Today, 08:12', 2),
      accounts: [acc('a1', 'Current account', '0380 0000 1000 0112 233', 'AED', 48250.75), acc('a2', 'Savings account', '0380 0000 1000 0245 871', 'AED', 120400), acc('a3', 'USD account', '0380 0000 1000 0390 104', 'USD', 5120.4)] },
    { cif: '100002', name: 'Khalid Al Dhaheri', segment: 'Retail', emiratesId: '784-1991-7782340-1', mobile: '+971 55 442 9081',
      user: usr('khalid.dhaheri', 'blocked', 'Yesterday, 22:47', 1, { block: { reason: 'Customer request', date: daysAgo(6), by: 'Sara Nasser' } }),
      accounts: [acc('a1', 'Current account', '0380 0000 1000 0553 077', 'AED', 92410), acc('a2', 'Savings account', '0380 0000 1000 0553 612', 'AED', 15800.5)] },
    { cif: '100003', name: 'Mariam Al Zaabi', segment: 'Premier', emiratesId: '784-1985-3310872-9', mobile: '+971 52 908 7712',
      user: usr('mariam.zaabi', 'locked', '3 days ago', 1, { failedAttempts: 5 }),
      accounts: [acc('a1', 'Current account', '0380 0000 1000 0441 912', 'AED', 7215), acc('a2', 'Savings account', '0380 0000 1000 0441 930', 'AED', 64000)] },
    { cif: '100004', name: 'Gulf Horizon Trading LLC', segment: 'Business', emiratesId: '784-1979-1122334-5', mobile: '+971 4 331 2200',
      user: usr('ghtl.admin', 'active', 'Today, 07:40', 4),
      accounts: [
        acc('a1', 'Business current', '0380 0000 1000 0802 211', 'AED', 1284560),
        acc('a2', 'Business current', '0380 0000 1000 0802 902', 'AED', 310000, 'full_block', { complianceHold: true, block: { reason: 'Regulatory / court order', date: daysAgo(12), by: 'Compliance' } }),
        acc('a3', 'Savings account', '0380 0000 1000 0802 455', 'AED', 0, 'closed'),
      ] },
    { cif: '100005', name: 'Priya Nair', segment: 'Retail', emiratesId: '784-1993-5567812-4', mobile: '+971 56 710 3345',
      user: usr('priya.nair', 'active', 'Today, 07:55', 2),
      accounts: [
        acc('a1', 'Current account', '0380 0000 1000 0661 118', 'AED', 35200, 'debit_block', { block: { reason: 'Suspected fraud', date: daysAgo(1), by: 'Noura Al Mazrouei' } }),
        acc('a2', 'Savings account', '0380 0000 1000 0661 340', 'AED', 88900),
      ] },
    { cif: '100006', name: 'Hessa Al Kaabi', segment: 'Retail', emiratesId: '784-1990-2209981-2', mobile: '+971 50 884 1290',
      user: usr('hessa.kaabi', 'active', 'Today, 06:40', 1),
      accounts: [acc('a1', 'Current account', '0380 0000 1000 0701 551', 'AED', 26930)] },
    { cif: '100007', name: 'Yousef Haddad', segment: 'Retail', emiratesId: '784-1987-6643120-7', mobile: '+971 54 227 0918',
      user: usr('yousef.haddad', 'active', 'Last week', 2),
      accounts: [acc('a1', 'Current account', '0380 0000 1000 0715 204', 'AED', 12400), acc('a2', 'Savings account', '0380 0000 1000 0715 877', 'AED', 52000)] },
    { cif: '100008', name: 'Saeed Al Marri', segment: 'Retail', emiratesId: '784-1982-9034471-6', mobile: '+971 55 301 6654',
      user: usr('saeed.marri', 'dormant', '8 months ago', 0),
      accounts: [acc('a1', 'Savings account', '0380 0000 1000 0933 062', 'AED', 14880)] },
  ];
}

const req = (id: string, c: { cif: string; name: string }, target: ControlRequest['target'], action: ActionKind, from: string, to: string, reason: string, remarks: string, maker: string, makerName: string, mins: number): ControlRequest =>
  ({ id, cif: c.cif, customerName: c.name, target, action, from, to, reason, remarks, maker, makerName, createdAt: minsAgo(mins), status: 'pending' });

function seedRequests(): ControlRequest[] {
  return [
    req('1001', { cif: '100008', name: 'Saeed Al Marri' }, { kind: 'user', id: 'user', label: 'Digital user' }, 'block', 'Dormant', 'Blocked', 'Suspected fraud', 'Dormant profile reactivation attempt from a new device in another country.', 'noura.m', 'Noura Al Mazrouei', 26),
    req('1002', { cif: '100005', name: 'Priya Nair' }, { kind: 'account', id: 'a2', label: `Savings account ${maskAccount('0380 0000 1000 0661 340')}` }, 'debit_block', 'Active', 'Debit block', 'Customer request', 'Customer reported a suspicious card-not-present charge and asked to stop debits.', 'bo.checker', 'Hamad Al Ketbi', 12),
    req('1003', { cif: '100005', name: 'Priya Nair' }, { kind: 'account', id: 'a1', label: `Current account ${maskAccount('0380 0000 1000 0661 118')}` }, 'debit_block', 'Active', 'Debit block', 'Suspected fraud', 'Duplicate of an earlier request raised from the branch queue.', 'noura.m', 'Noura Al Mazrouei', 45),
  ];
}

const seedActivity: Record<string, ActivityEntry[]> = {
  '100002': [{ id: 's-100002-1', at: minsAgo(60 * 24 * 6), actor: 'Sara Nasser', text: 'Block request REQ-0987 approved · Digital user · Customer request', outcome: 'success' }],
  '100003': [{ id: 's-100003-1', at: minsAgo(60 * 24 * 3), actor: 'System', text: 'User locked after 5 failed login attempts', outcome: 'info' }],
  '100004': [{ id: 's-100004-1', at: minsAgo(60 * 24 * 12), actor: 'Compliance', text: 'Full block applied · Business current •••• 2902 · Regulatory / court order', outcome: 'info' }],
  '100005': [{ id: 's-100005-1', at: minsAgo(60 * 24), actor: 'Noura Al Mazrouei', text: 'Debit block request REQ-0991 approved · Current account •••• 1118 · Suspected fraud', outcome: 'success' }],
};

/* ------------------------------------------------------------------ in-memory mock */
let customers = seedCustomers();
let requests = seedRequests();
let nextId = 1004;
const conflictCleared = new Set<string>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const clone = <T,>(v: T): T => structuredClone(v);

const find = (cif: string) => { const c = customers.find((x) => x.cif === cif); if (!c) throw new ControlsError('NOT_FOUND', `No customer found for CIF ${cif}.`); return c; };
const pendingFor = (cif: string) => requests.filter((r) => r.cif === cif && r.status === 'pending');
const digits = (s: string) => s.replace(/\D/g, '');

function effectiveUserStatus(c: Customer): CustomerSummary['userStatus'] {
  return pendingFor(c.cif).some((r) => r.target.kind === 'user') ? 'pending' : c.user.status;
}

function activityFor(cif: string): ActivityEntry[] {
  const live = auditLog.list().filter((e) => e.target === cif).map((e, i): ActivityEntry => ({
    id: `l-${cif}-${i}`, at: e.timestamp, actor: e.actorName ?? e.user, text: e.detail ?? e.action,
    outcome: e.result === 'SUCCESS' ? 'success' : 'failure',
  }));
  return [...live, ...(seedActivity[cif] ?? [])].sort((a, b) => b.at.localeCompare(a.at));
}

function view(cif: string, viewer?: string): CustomerView {
  const c = find(cif);
  const rejected = requests.filter((r) => r.cif === cif && r.status === 'rejected' && !r.acknowledged && (!viewer || r.maker === viewer));
  return clone({ customer: c, pending: pendingFor(cif), rejected, activity: activityFor(cif) });
}

const targetOf = (c: Customer, t: { kind: TargetKind; id: string }) => {
  if (t.kind === 'user') return { kind: 'user' as const, label: 'Digital user', status: c.user.status, user: c.user };
  const a = c.accounts.find((x) => x.id === t.id);
  if (!a) throw new ControlsError('NOT_FOUND', 'That account no longer exists.');
  return { kind: 'account' as const, label: `${a.type} ${maskAccount(a.number)}`, status: a.status, account: a };
};

/** Throws when the requested change can't be applied to the target's current state. */
function assertApplicable(c: Customer, t: { kind: TargetKind; id: string }, action: ActionKind) {
  const tg = targetOf(c, t);
  if (tg.kind === 'account') {
    const a = tg.account!;
    if (a.status === 'closed') throw new ControlsError('INVALID', 'Closed accounts can’t be modified.');
    if (a.complianceHold && action === 'unblock') throw new ControlsError('COMPLIANCE_HOLD', 'This account has a compliance block. Only Compliance can remove it.');
    const to = action === 'unblock' ? 'active' : action;
    const phrase: Record<AccountStatus, string> = { active: 'active', full_block: 'fully blocked', debit_block: 'debit-blocked', credit_block: 'credit-blocked', closed: 'closed' };
    if (a.status === to) throw new ControlsError('ALREADY_IN_STATE', `This account is already ${phrase[a.status]}. No change was made.`);
    if (action === 'unblock' && a.status === 'active') throw new ControlsError('ALREADY_IN_STATE', 'This account is already active. No change was made.');
  } else {
    const u = tg.user!;
    if (action === 'block' && u.status === 'blocked') throw new ControlsError('ALREADY_IN_STATE', 'This user is already blocked. No change was made.');
    if (action === 'unblock' && (u.status === 'active' || u.status === 'dormant')) throw new ControlsError('ALREADY_IN_STATE', `This user is already ${u.status}. No change was made.`);
  }
  return tg;
}

const statusLabelFor = (kind: TargetKind, action: ActionKind) => (action === 'unblock' ? 'Active' : kind === 'user' ? 'Blocked' : ACTION_LABEL[action]);

function record(actor: Actor, action: string, result: string, cif: string, detail: string) {
  auditLog.record({ user: actor.username, actorName: actor.displayName, action, result, target: cif, detail });
}

export const controls: ControlsService = {
  async search(type, query) {
    await latency();
    const q = query.trim();
    if (q.toLowerCase() === 'error') throw new ControlsError('SERVICE_UNAVAILABLE', 'We couldn’t complete the search. Try again in a moment.');
    const hit = (c: Customer) => {
      switch (type) {
        case 'cif': return c.cif.includes(q);
        case 'account': return c.accounts.some((a) => digits(a.number).includes(digits(q)) && digits(q).length > 0);
        case 'eid': return digits(c.emiratesId).includes(digits(q)) && digits(q).length > 0;
        case 'mobile': return digits(c.mobile).includes(digits(q)) && digits(q).length > 0;
        case 'username': return c.user.username.toLowerCase().includes(q.toLowerCase());
      }
    };
    return customers.filter(hit).map((c) => ({ cif: c.cif, name: c.name, userStatus: effectiveUserStatus(c), accounts: c.accounts.length }));
  },

  async listAll() {
    await latency();
    return clone({ customers, pending: requests.filter((r) => r.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  },

  async getCustomer(cif) { await latency(); return view(cif); },

  async refresh(cif) {
    await latency();
    if (cif === '100007' && !conflictCleared.has(cif)) {
      conflictCleared.add(cif);
      const c = find(cif); c.user.lastLogin = 'Today, 09:41'; c.user.devices = 3; // "someone else" updated the record
    }
    return view(cif);
  },

  async submit(input, actor) {
    await latency();
    const caps = capsFor(actor.role);
    const c = find(input.cif);
    const tg = targetOf(c, input.target);
    const labelFor = `${ACTION_LABEL[input.action]} request`;
    const fail = (e: ControlsError): never => {
      record(actor, 'CONTROL_REQUEST_FAILED', `FAILURE:${e.code}`, c.cif, `${labelFor} for ${tg.label} failed · ${e.message}`);
      throw e;
    };
    if (!caps.initiate) fail(new ControlsError('FORBIDDEN', 'You don’t have permission to initiate this action.'));
    if (c.cif === '100006') fail(new ControlsError('CORE_TIMEOUT', 'We couldn’t reach the core banking system. Your request wasn’t submitted. Try again.'));
    if (c.cif === '100007' && !conflictCleared.has(c.cif)) fail(new ControlsError('CONCURRENT_CHANGE', 'This record was updated by someone else. Refresh to see the latest status.'));
    if (requests.some((r) => r.cif === c.cif && r.status === 'pending' && r.target.kind === input.target.kind && r.target.id === input.target.id)) {
      fail(new ControlsError('PENDING_EXISTS', 'A request is already awaiting approval for this record.'));
    }
    try { assertApplicable(c, input.target, input.action); } catch (e) { return fail(e as ControlsError); }

    const r: ControlRequest = {
      id: String(nextId++), cif: c.cif, customerName: c.name,
      target: { kind: input.target.kind, id: input.target.id, label: tg.label },
      action: input.action, from: tg.kind === 'user' ? USER_STATUS_LABEL[tg.status as UserStatus] : ACCOUNT_STATUS_LABEL[tg.status as AccountStatus],
      to: statusLabelFor(tg.kind, input.action), reason: input.reason, remarks: input.remarks,
      maker: actor.username, makerName: actor.displayName, createdAt: new Date().toISOString(), status: 'pending',
    };
    requests = [r, ...requests];
    record(actor, 'CONTROL_REQUEST_SUBMITTED', 'SUCCESS', c.cif, `${labelFor} REQ-${r.id} submitted · ${tg.label} · ${input.reason}`);
    notify();
    return clone(r);
  },

  async listPending() {
    await latency();
    return clone(requests.filter((r) => r.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async approve(id, actor) {
    await latency();
    const r = requests.find((x) => x.id === id);
    if (!r || r.status !== 'pending') throw new ControlsError('NOT_FOUND', 'This request has already been resolved.');
    const fail = (e: ControlsError): never => {
      record(actor, 'CONTROL_REQUEST_FAILED', `FAILURE:${e.code}`, r.cif, `Approval of REQ-${r.id} failed · ${e.message}`);
      throw e;
    };
    if (!capsFor(actor.role).decide) fail(new ControlsError('FORBIDDEN', 'You don’t have permission to approve requests.'));
    if (r.maker === actor.username) fail(new ControlsError('SELF_APPROVAL', 'You can’t approve a request you initiated.'));
    const c = find(r.cif);
    let tg: ReturnType<typeof assertApplicable>;
    try { tg = assertApplicable(c, r.target, r.action); } catch (e) { return fail(e as ControlsError); }

    const now = new Date().toISOString().slice(0, 10);
    if (tg.kind === 'user') {
      const u = c.user;
      if (r.action === 'unblock') { u.status = 'active'; u.failedAttempts = 0; u.block = undefined; }
      else { u.status = 'blocked'; u.block = { reason: r.reason, date: now, by: r.makerName }; }
    } else {
      const a = tg.account!;
      if (r.action === 'unblock') { a.status = 'active'; a.block = undefined; }
      else { a.status = r.action as AccountStatus; a.block = { reason: r.reason, date: now, by: r.makerName }; }
    }
    r.status = 'approved'; r.checkerName = actor.displayName; r.decidedAt = new Date().toISOString();
    record(actor, 'CONTROL_REQUEST_APPROVED', 'SUCCESS', r.cif, `${ACTION_LABEL[r.action]} request REQ-${r.id} approved · ${r.target.label} · ${r.reason}`);
    notify();
    return clone(r);
  },

  async reject(id, comment, actor) {
    await latency();
    const r = requests.find((x) => x.id === id);
    if (!r || r.status !== 'pending') throw new ControlsError('NOT_FOUND', 'This request has already been resolved.');
    if (!capsFor(actor.role).decide) throw new ControlsError('FORBIDDEN', 'You don’t have permission to reject requests.');
    if (r.maker === actor.username) throw new ControlsError('SELF_APPROVAL', 'You can’t approve a request you initiated.');
    if (!comment.trim()) throw new ControlsError('INVALID', 'Enter a comment explaining the rejection.');
    r.status = 'rejected'; r.checkerName = actor.displayName; r.decidedAt = new Date().toISOString(); r.comment = comment.trim();
    record(actor, 'CONTROL_REQUEST_REJECTED', 'SUCCESS', r.cif, `${ACTION_LABEL[r.action]} request REQ-${r.id} rejected · ${r.target.label} · ${comment.trim()}`);
    notify();
    return clone(r);
  },

  acknowledge(id) { const r = requests.find((x) => x.id === id); if (r) r.acknowledged = true; },
  pendingCount: (kind) => requests.filter((r) => r.status === 'pending' && (!kind || r.target.kind === kind)).length,
  subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};

/** View of a customer scoped to the signed-in user (rejection banners go to the maker who raised them). */
export async function loadCustomerFor(cif: string, viewer: string, fresh = false): Promise<CustomerView> {
  const v = await (fresh ? controls.refresh(cif) : controls.getCustomer(cif));
  v.rejected = v.rejected.filter((r) => r.maker === viewer);
  return v;
}
