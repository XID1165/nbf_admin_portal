import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, RotateCw } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { AccountsTab } from '../components/controls/AccountsTab';
import { ActionModal, type ActionTarget } from '../components/controls/ActionModal';
import { ActivityTimeline } from '../components/controls/ActivityTimeline';
import { UserControlsTab } from '../components/controls/UserControlsTab';
import { InlineBanner, useMessages } from '../components/messages/MessageProvider';
import { useAuth } from '../context/AuthContext';
import { ACTION_LABEL, capsFor, controls, loadCustomerFor, maskEid, maskMobile, type ActionKind, type ControlRequest, type CustomerView } from '../services/controls';

type Tab = 'user' | 'accounts';
const TABS: [Tab, string][] = [['user', 'Digital User'], ['accounts', 'Accounts']];

export default function CustomerProfilePage() {
  const { cif = '' } = useParams();
  const { pathname } = useLocation();
  /** The journey starts on User controls or Account controls; the profile keeps the user in that section. */
  const section = pathname.startsWith('/account-controls') ? { path: '/account-controls', label: 'Account controls', tab: 'accounts' as Tab } : { path: '/user-controls', label: 'User controls', tab: 'user' as Tab };
  const { session } = useAuth();
  const { toast } = useMessages();
  const [view, setView] = useState<CustomerView | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [tab, setTab] = useState<Tab>('user');
  const [modal, setModal] = useState<{ target: ActionTarget; action: ActionKind } | null>(null);
  const seq = useRef(0);
  const username = session?.user.username ?? '';

  const load = useCallback((opts: { fresh?: boolean; silent?: boolean } = {}) => {
    const id = ++seq.current;
    if (!opts.silent) { setView(null); setError(null); }
    return loadCustomerFor(cif, username, opts.fresh).then(
      (v) => { if (id === seq.current) { setView(v); setError(null); } },
      (e: { code?: string; message: string }) => { if (id === seq.current) setError({ code: e.code ?? 'SERVICE_UNAVAILABLE', message: e.message }); },
    );
  }, [cif, username]);
  useEffect(() => { setTab(section.tab); setModal(null); load(); }, [load, section.tab]);

  if (!session) return null;
  const caps = capsFor(session.role);

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-[480px] rounded-card border border-line bg-white p-8 text-center shadow-soft">
        <AlertCircle className="mx-auto size-8 text-danger" aria-hidden="true" />
        <h1 className="mt-3 text-lg font-semibold text-charcoal">{error.code === 'NOT_FOUND' ? 'Customer not found' : 'Couldn’t load this customer'}</h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to={section.path} className="inline-flex h-10 items-center rounded-control border border-line px-4 text-sm font-medium text-charcoal hover:bg-surface">Back to {section.label}</Link>
          {error.code !== 'NOT_FOUND' && <button type="button" onClick={() => load()} className="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-dark"><RotateCw className="size-4" aria-hidden="true" />Retry</button>}
        </div>
      </div>
    );
  }
  if (!view) {
    return (
      <div role="status" className="space-y-4"><span className="sr-only">Loading customer…</span>
        <div className="h-28 animate-pulse rounded-card bg-charcoal/5" /><div className="h-72 animate-pulse rounded-card bg-charcoal/5" />
      </div>
    );
  }

  const { customer, pending, rejected, activity } = view;
  const userPending = pending.some((r) => r.target.kind === 'user');
  const accountPending = new Set(pending.filter((r) => r.target.kind === 'account').map((r) => r.target.id));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const next: Tab = tab === 'user' ? 'accounts' : 'user'; setTab(next); document.getElementById(`tab-${next}`)?.focus(); }
  };
  const submitted = (r: ControlRequest) => {
    setModal(null);
    toast(`${ACTION_LABEL[r.action]} request submitted for approval. Reference REQ-${r.id}.`);
    load({ silent: true });
  };
  const refresh = () => { setModal(null); load({ fresh: true, silent: true }); };

  return (
    <div>
      <Link to={section.path} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-dark hover:underline"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />Back to {section.label}</Link>

      <header className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-card border border-line bg-white p-6 shadow-soft">
        <Avatar name={customer.name} size="xl" className="!size-14" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] font-medium leading-8 text-charcoal">{customer.name}</h1>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-600">{customer.segment}</span>
            {!caps.initiate && <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/5 px-2.5 py-1 text-[11px] font-medium text-charcoal/70"><Eye className="size-3.5" aria-hidden="true" />View only</span>}
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {([['CIF', customer.cif], ['Emirates ID', maskEid(customer.emiratesId)], ['Mobile', maskMobile(customer.mobile)]] as const).map(([k, v]) => (
              <div key={k} className="flex gap-2"><dt className="text-muted">{k}</dt><dd className="font-medium text-charcoal">{v}</dd></div>
            ))}
          </dl>
        </div>
      </header>

      {(pending.length > 0 || rejected.length > 0) && (
        <div className="mt-4 space-y-3">
          {rejected.map((r) => (
            <InlineBanner key={r.id} id={`rejected-${r.id}`} kind="warning" onDismiss={() => controls.acknowledge(r.id)}>Request REQ-{r.id} was rejected by {r.checkerName}: {r.comment}</InlineBanner>
          ))}
          {pending.map((r) => (
            <InlineBanner key={r.id} id={`pending-${r.id}`} kind="info">A {ACTION_LABEL[r.action].toLowerCase()} request is awaiting checker approval. No further changes can be made until it&rsquo;s resolved. <span className="text-muted">({r.target.label} · REQ-{r.id})</span></InlineBanner>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="rounded-card border border-line bg-white shadow-soft">
          <div role="tablist" aria-label="Customer controls" onKeyDown={onKey} className="flex gap-1 border-b border-line px-4 pt-3">
            {TABS.map(([k, label]) => {
              const on = tab === k;
              return (
                <button key={k} id={`tab-${k}`} type="button" role="tab" aria-selected={on} aria-controls={`panel-${k}`} tabIndex={on ? 0 : -1} onClick={() => setTab(k)}
                  className={`-mb-px h-10 border-b-2 px-4 text-sm font-medium transition-colors ${on ? 'border-primary text-charcoal' : 'border-transparent text-muted hover:text-charcoal'}`}>
                  {label}{k === 'accounts' && <span className="ms-2 text-xs text-muted">{customer.accounts.length}</span>}
                </button>
              );
            })}
          </div>
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={tab === 'user' ? 'p-6' : 'p-4 md:p-0'}>
            {tab === 'user'
              ? <UserControlsTab customer={customer} pending={userPending} canInitiate={caps.initiate} onAction={(a) => setModal({ target: { kind: 'user', id: 'user' }, action: a })} />
              : <AccountsTab customer={customer} pendingIds={accountPending} canInitiate={caps.initiate} onAction={(id, a) => setModal({ target: { kind: 'account', id }, action: a })} />}
          </div>
        </section>
        <ActivityTimeline entries={activity} />
      </div>

      {modal && <ActionModal key={`${modal.target.id}-${modal.action}`} customer={customer} target={modal.target} action={modal.action} onClose={() => setModal(null)} onSubmitted={submitted} onRefresh={refresh} />}
    </div>
  );
}
