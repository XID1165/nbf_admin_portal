import { Avatar } from '../components/ui/Avatar';
import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { SlaChip, StageChip } from '../components/dashboard/chips';
import { applications, type Application } from '../services/applications';

type Tab = 'all' | 'progress' | 'risk' | 'closed';
const isClosed = (a: Application) => a.sla.kind === 'closed';
const isRisk = (a: Application) => a.sla.kind === 'due' || a.sla.kind === 'breached';
const FILTERS: Record<Tab, (a: Application) => boolean> = { all: () => true, progress: (a) => !isClosed(a), risk: isRisk, closed: isClosed };
const TABS: [Tab, string][] = [['all', 'All'], ['progress', 'In progress'], ['risk', 'SLA risk'], ['closed', 'Closed']];

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
function exportCsv(rows: Application[]) {
  const head = ['Application', 'Created', 'Customer', 'Product', 'Channel', 'Stage', 'SLA', 'Owner'];
  const body = rows.map((r) => [r.id, r.when, r.customer, r.product, r.channel, r.stage, r.sla.label, r.owner ?? 'Unassigned'].map(csvCell).join(','));
  const url = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'nbf-applications.csv' });
  a.click(); URL.revokeObjectURL(url);
}

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[] | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  useEffect(() => { let live = true; applications.list().then((r) => live && setRows(r)); return () => { live = false; }; }, []);
  const shown = useMemo(() => (rows ?? []).filter(FILTERS[tab]), [rows, tab]);
  const th = 'px-4 first:ps-6 last:pe-6 py-4 text-start text-[11px] font-medium uppercase tracking-[0.15em] text-muted';

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">Customer onboarding</p>
          <h1 className="mt-3 text-[28px] font-medium leading-9 text-charcoal">Application tracking</h1>
          <p className="mt-2 text-sm text-muted">Every customer application across app, web and branch.</p>
        </div>
        <button type="button" disabled={!rows} onClick={() => rows && exportCsv(shown)}
          className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-white px-4 text-sm font-medium text-charcoal shadow-[0_1px_2px_rgb(var(--dark)/0.04)] hover:bg-surface disabled:opacity-50">
          <Download className="size-4" aria-hidden="true" />Export CSV
        </button>
      </div>

      <section aria-label="Applications" className="mt-6 rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(var(--dark)/0.04),0_8px_24px_-12px_rgb(var(--dark)/0.1)]">
        <div className="p-6 pb-5">
          <div role="tablist" aria-label="Filter applications" className="inline-flex flex-wrap gap-1 rounded-card bg-surface p-1.5">
            {TABS.map(([k, label]) => {
              const on = tab === k;
              return (
                <button key={k} type="button" role="tab" aria-selected={on} onClick={() => setTab(k)}
                  className={`inline-flex h-8 items-center gap-2 rounded-control px-3 text-xs font-medium transition-colors ${on ? 'bg-white text-charcoal shadow-[0_1px_2px_rgb(var(--dark)/0.08)] ring-1 ring-line' : 'text-muted hover:text-charcoal'}`}>
                  {label}<span className={on ? 'text-muted' : 'text-muted/80'}>{rows ? rows.filter(FILTERS[k]).length : '–'}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto" role="tabpanel">
          <table className="w-full min-w-[980px] text-sm">
            <thead><tr className="border-y border-line">
              {['Application', 'Customer', 'Channel', 'Stage', 'SLA', 'Owner'].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {!rows && Array.from({ length: 5 }, (_, i) => <tr key={i} className="border-b border-line"><td colSpan={6} className="px-6 py-5"><div className="h-9 animate-pulse rounded-control bg-charcoal/5" /></td></tr>)}
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 first:ps-6 last:pe-6 py-[13px]"><p className="whitespace-nowrap font-mono text-xs font-medium text-dark">{r.id}</p><p className="mt-1 text-xs text-muted">{r.when}</p></td>
                  <td className="px-4 first:ps-6 last:pe-6 py-[13px]"><div className="flex items-center gap-3"><Avatar name={r.customer} size="lg" /><div className="min-w-0"><p className="font-medium text-charcoal">{r.customer}</p><p className="mt-1 text-xs text-muted">{r.product}</p></div></div></td>
                  <td className="whitespace-nowrap px-4 first:ps-6 last:pe-6 py-4 text-sm text-muted">{r.channel}</td>
                  <td className="px-4 first:ps-6 last:pe-6 py-[13px]"><StageChip stage={r.stage} /></td>
                  <td className="px-4 first:ps-6 last:pe-6 py-[13px]"><SlaChip sla={r.sla} /></td>
                  <td className="px-4 first:ps-6 last:pe-6 py-4 text-sm"><span className="flex items-center gap-2.5 whitespace-nowrap">{r.owner ? <><Avatar name={r.owner} size="sm" /><span className="text-charcoal">{r.owner}</span></> : <><Avatar kind="unassigned" size="sm" /><span className="text-muted">Unassigned</span></>}</span></td>
                </tr>
              ))}
              {rows && !shown.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">No applications match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
