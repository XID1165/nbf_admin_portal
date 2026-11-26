import { Avatar } from '../components/ui/Avatar';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACCESS } from '../components/dashboard/Sidebar';
import { auditTrail, type AuditEvent, type AuditModule } from '../services/auditTrail';

type Tab = 'all' | AuditModule;
const TABS: [Tab, string][] = [['all', 'All'], ['Auth', 'Auth'], ['Applications', 'Applications'], ['Users', 'Users'], ['Accounts', 'Accounts'], ['Access', 'Access']];
const DOT: Record<AuditModule, string> = { Applications: 'bg-primary', Accounts: 'bg-rose', Users: 'bg-gold', Access: 'bg-dark', Auth: 'bg-muted' };

const text = (e: AuditEvent) => e.parts.map((p) => p.t).join('');
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
function exportCsv(rows: AuditEvent[]) {
  const body = rows.map((r) => [r.time, r.actor.name, text(r), r.module, r.ip ?? ''].map(csvCell).join(','));
  const url = URL.createObjectURL(new Blob([['Time,Actor,Action,Module,Source IP', ...body].join('\n')], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: 'nbf-audit-trail.csv' }).click(); URL.revokeObjectURL(url);
}

export default function AuditTrailPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<AuditEvent[] | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const user = session?.user;
  useEffect(() => { if (!user) return; let live = true; auditTrail.load(user).then((r) => live && setRows(r)); return () => { live = false; }; }, [user]);
  if (!session) return null;
  if (!ACCESS[session.role].includes('audit')) return <Navigate to="/dashboard" replace />;

  const count = (k: Tab) => (rows ?? []).filter((r) => k === 'all' || r.module === k).length;
  const shown = (rows ?? []).filter((r) => tab === 'all' || r.module === tab);
  const th = 'px-6 py-4 text-start text-[11px] font-medium uppercase tracking-[0.15em] text-muted';

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">Governance</p>
          <h1 className="mt-3 text-[28px] font-medium leading-9 text-charcoal">Audit trail</h1>
          <p className="mt-2 text-sm text-muted">Immutable record of every portal action. Retained for 7 years.</p>
        </div>
        <button type="button" disabled={!rows} onClick={() => exportCsv(shown)}
          className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-white px-4 text-sm font-medium text-charcoal shadow-[0_1px_2px_rgb(var(--dark)/0.04)] hover:bg-surface disabled:opacity-50">
          <Download className="size-4" aria-hidden="true" />Export CSV
        </button>
      </div>

      <section aria-label="Audit events" className="mt-6 rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(var(--dark)/0.04),0_8px_24px_-12px_rgb(var(--dark)/0.1)]">
        <div className="p-6 pb-5">
          <div role="tablist" aria-label="Filter by module" className="inline-flex flex-wrap gap-1 rounded-card bg-surface p-1.5">
            {TABS.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`inline-flex h-8 items-center gap-2 rounded-control px-3 text-xs font-medium transition-colors ${tab === k ? 'bg-white text-charcoal shadow-[0_1px_2px_rgb(var(--dark)/0.08)] ring-1 ring-line' : 'text-muted hover:text-charcoal'}`}>
                {label}<span className="text-muted">{rows ? count(k) : '–'}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto" role="tabpanel">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-y border-line">{['Time', 'Actor', 'Action', 'Module', 'Source IP'].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
            <tbody>
              {!rows && Array.from({ length: 5 }, (_, i) => <tr key={i} className="border-b border-line"><td colSpan={5} className="px-6 py-4"><div className="h-8 animate-pulse rounded-control bg-charcoal/5" /></td></tr>)}
              {shown.map((r) => (
                <tr key={r.id} className="h-[55px] border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="whitespace-nowrap px-6 font-mono text-xs text-muted">{r.time}</td>
                  <td className="px-6"><span className="flex items-center gap-2.5 whitespace-nowrap text-charcoal">
                    <Avatar name={r.actor.name} size="sm" />{r.actor.name}
                  </span></td>
                  <td className="px-6 text-charcoal">{r.parts.map((p, i) => <span key={i} className={p.em ? 'font-medium text-dark' : ''}>{p.t}</span>)}</td>
                  <td className="px-6"><span className="flex items-center gap-2 whitespace-nowrap text-xs text-charcoal"><span aria-hidden="true" className={`size-1.5 rounded-full ${DOT[r.module]}`} />{r.module}</span></td>
                  <td className="whitespace-nowrap px-6 font-mono text-xs text-muted">{r.ip ?? '—'}</td>
                </tr>
              ))}
              {rows && !shown.length && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">No events match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
