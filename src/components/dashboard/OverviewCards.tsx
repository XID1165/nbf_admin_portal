import { Avatar } from '../ui/Avatar';
import { useId, type ReactNode } from 'react';
import { ArrowRight, Check, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroCardArt } from './HeroCardArt';
import { SlaChip, StageChip } from './chips';
import type { Approval, AuditItem, ChannelDay, Kpi, Overview, PipelineStage, RecentApp } from '../../services/dashboard';

const CARD = 'rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(var(--dark)/0.04),0_8px_24px_-12px_rgb(var(--dark)/0.1)]';

export function Hero({ firstName, workspace, stats, approvals, controlsHref }: { firstName: string; workspace: string; stats: Overview['stats']; approvals: number; controlsHref?: string }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const tiles: [string, string][] = [['In pipeline', String(stats.inPipeline)], ['Approval rate', `${stats.approvalRate}%`], ['SLA met', `${stats.slaMet}%`]];
  const b = 'font-semibold text-white';
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-card bg-dark p-6 text-white sm:p-8 lg:min-h-[362px]">
      <HeroCardArt className="pointer-events-none absolute inset-0 size-full" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{workspace} workspace</p>
        <h1 id="hero-title" className="mt-3 text-[32px] font-semibold leading-10">{greeting}, {firstName}.</h1>
        <p className="mt-3 max-w-[470px] text-sm leading-6 text-white/80">
          <span className={b}>{approvals} {approvals === 1 ? 'approval is' : 'approvals are'}</span> waiting on you, and <span className={b}>{stats.nearSla} applications</span> are close to or past SLA.
        </p>
        <dl className="mt-8 grid max-w-[576px] grid-cols-1 gap-3 sm:grid-cols-3">
          {tiles.map(([k, v]) => (
            <div key={k} className="rounded-card border border-white/15 bg-white/[0.06] px-4 py-3.5 backdrop-blur-sm">
              <dt className="text-xs text-white/60">{k}</dt><dd className="mt-1 text-[22px] font-semibold leading-7">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgb(var(--primary)/0.7)] hover:bg-primary-600">Review applications<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></button>
          {controlsHref && <Link to={controlsHref} className="inline-flex h-10 items-center rounded-control border border-white/25 px-4 text-sm font-medium text-white hover:bg-white/10">User controls</Link>}
        </div>
      </div>
    </section>
  );
}

interface ApprovalsProps {
  items: Approval[]; onDecide: (id: string, ok: boolean) => void;
  title?: string; subtitle?: string; badge?: boolean; empty?: string;
  /** Maker-checker: return false when the signed-in user may not approve this request (e.g. their own). */
  canApprove?: (a: Approval) => boolean;
  /** Hide the Approve / Reject buttons (viewers who can't decide). */
  readOnly?: boolean;
}
export function Approvals({ items, onDecide, title = 'Awaiting your approval', subtitle = 'Maker-checker requests', badge = true, empty = 'You\u2019re all caught up. No requests are waiting.', canApprove, readOnly }: ApprovalsProps) {
  return (
    <section aria-labelledby="appr-title" className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between p-6 pb-[18px]">
        <div><h2 id="appr-title" className="text-base font-semibold text-charcoal">{title}</h2><p className="mt-1 text-xs text-muted">{subtitle}</p></div>
        {badge && <span aria-label={`${items.length} pending`} className="flex size-[22px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{items.length}</span>}
      </div>
      <ul className="flex-1 border-t border-line" aria-live="polite">
        {items.map((a) => (
          <li key={a.id} className="relative border-b border-line px-6 py-[18px] last:border-b-0">
            <span aria-hidden="true" className="absolute start-6 top-[27px] size-2 rounded-full bg-success" />
            <div className="ps-5">
              <p className="text-sm font-medium text-charcoal">{a.title}</p>
              <p className="mt-1 text-xs text-muted">&ldquo;{a.reason}&rdquo;</p>
              <p className="mt-2 flex items-center gap-2 text-[11px] text-muted"><Avatar name={a.maker} size="xs" /><span>Maker: {a.maker} · {a.minutesAgo} min ago</span></p>
              {!readOnly && <div className="mt-3 flex items-center gap-3">
                <button type="button" onClick={() => onDecide(a.id, true)} disabled={canApprove ? !canApprove(a) : false} title={canApprove && !canApprove(a) ? 'Needs a different approver (maker-checker)' : undefined} className="inline-flex h-8 items-center gap-1.5 rounded-control bg-primary px-3 text-xs font-semibold text-white hover:bg-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"><Check className="size-3.5" aria-hidden="true" />Approve</button>
                <button type="button" onClick={() => onDecide(a.id, false)} className="inline-flex h-8 items-center gap-1.5 rounded-control px-2 text-xs font-medium text-muted hover:bg-surface hover:text-charcoal"><X className="size-3.5" aria-hidden="true" />Reject</button>
              </div>}
            </div>
          </li>
        ))}
        {!items.length && <li className="px-6 py-10 text-center text-sm text-muted">{empty}</li>}
      </ul>
    </section>
  );
}

const STROKE = { primary: 'stroke-primary', dark: 'stroke-dark', gold: 'stroke-gold', rose: 'stroke-rose' } as const;
const STOP = { primary: 'text-primary', dark: 'text-dark', gold: 'text-gold', rose: 'text-rose' } as const;

function Sparkline({ series, color }: { series: number[]; color: Kpi['color'] }) {
  const id = useId();
  const W = 120, H = 40, min = Math.min(...series), max = Math.max(...series);
  const pts = series.map((v, i) => [(i / (series.length - 1)) * (W - 4) + 2, H - 4 - ((v - min) / (max - min || 1)) * (H - 10)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className={`h-10 w-[120px] shrink-0 ${STOP[color]}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="currentColor" stopOpacity="0.22" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${W - 2} ${H} L2 ${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={STROKE[color]} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" className={`fill-current ${STOP[color]}`} />
    </svg>
  );
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
  return (
    <div className={`${CARD} min-h-[145px] p-6`}>
      <p className="text-xs text-muted">{kpi.label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[28px] font-semibold leading-9 text-charcoal">{kpi.value}</p>
          <p className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${kpi.tone === 'success' ? 'text-success' : 'text-gold'}`}><Icon className="size-3" aria-hidden="true" />{kpi.delta}</p>
        </div>
        <Sparkline series={kpi.series} color={kpi.color} />
      </div>
    </div>
  );
}

const TICKS = [160, 120, 80, 40, 0];
export function ChannelChart({ days }: { days: ChannelDay[] }) {
  const legend: [string, string][] = [['NBF Direct App', 'bg-primary'], ['Web', 'bg-dark'], ['Branch', 'bg-sky']];
  return (
    <section aria-labelledby="ch-title" className={`${CARD} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 id="ch-title" className="text-base font-semibold text-charcoal">Applications by channel</h2><p className="mt-1 text-xs text-muted">Last 7 days</p></div>
        <ul className="flex items-center gap-4 text-xs text-muted">{legend.map(([l, c]) => <li key={l} className="flex items-center gap-1.5"><span aria-hidden="true" className={`size-2 rounded-full ${c}`} />{l}</li>)}</ul>
      </div>
      <div className="mt-6 flex" role="img" aria-label={`Stacked bars of applications per day by channel: ${days.map((d) => `${d.label} ${d.app + d.web + d.branch}`).join(', ')}`}>
        <div aria-hidden="true" className="relative h-[322px] w-10 shrink-0 text-xs text-muted">
          {TICKS.map((t) => <span key={t} className="absolute start-0 -translate-y-1/2" style={{ top: `${100 - (t / 160) * 100}%` }}>{t}</span>)}
        </div>
        <div className="relative h-[322px] flex-1">
          {TICKS.map((t) => <div key={t} aria-hidden="true" className={`absolute inset-x-0 ${t ? 'border-t border-dashed border-line' : 'border-t border-line'}`} style={{ top: `${100 - (t / 160) * 100}%` }} />)}
          <div className="absolute inset-0 flex items-end justify-around px-2">
            {days.map((d) => (
              <div key={d.label} className="group flex h-full w-[6%] min-w-6 max-w-[41px] flex-col justify-end" title={`${d.label}: ${d.app} app · ${d.web} web · ${d.branch} branch`}>
                <div className="rounded-t-[6px] bg-primary transition-opacity group-hover:opacity-80" style={{ height: `${(d.app / 160) * 100}%` }} />
                <div className="bg-dark" style={{ height: `${(d.web / 160) * 100}%` }} />
                <div className="bg-sky" style={{ height: `${(d.branch / 160) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="ms-10 mt-3 flex justify-around px-2 text-xs text-muted">{days.map((d) => <span key={d.label} className={`w-[6%] min-w-6 text-center ${d.label === 'Today' ? 'font-medium text-charcoal' : ''}`}>{d.label}</span>)}</div>
    </section>
  );
}

const BAR = [
  'from-dark to-teal', 'from-dark/90 to-teal', 'from-dark/75 to-teal/80', 'from-dark/65 to-primary/60', 'from-dark/55 to-primary/70',
];
export function Pipeline({ stages, activation }: { stages: PipelineStage[]; activation: Overview['activation'] }): ReactNode {
  const top = stages[0].count;
  return (
    <section aria-labelledby="pl-title" className={`${CARD} flex flex-col p-6`}>
      <h2 id="pl-title" className="text-base font-semibold text-charcoal">Onboarding pipeline</h2>
      <p className="mt-1 text-xs text-muted">This week · conversion by stage</p>
      <ul className="mt-7 space-y-5">
        {stages.map((s, i) => (
          <li key={s.label}>
            <div className="flex items-baseline justify-between text-sm text-charcoal">
              <span>{s.label}</span>
              <span className="flex items-baseline gap-3">{s.conversion !== undefined && <span className="text-[11px] text-muted">{s.conversion}%</span>}<span className="font-semibold text-dark">{s.count}</span></span>
            </div>
            <div className="mt-2 h-5 rounded-control bg-surface" role="progressbar" aria-label={`${s.label}: ${s.count} of ${top}`} aria-valuemin={0} aria-valuemax={top} aria-valuenow={s.count}>
              <div className={`h-full rounded-control bg-gradient-to-r ${BAR[Math.min(i, BAR.length - 1)]} motion-safe:transition-[width] motion-safe:duration-700`} style={{ width: `${(s.count / top) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-6 text-xs text-muted"><span className="font-semibold text-primary-600">{activation.rate}%</span> end-to-end activation · up {activation.deltaPts} pts vs last week</p>
    </section>
  );
}

export function RecentApplications({ rows }: { rows: RecentApp[] }) {
  const th = 'px-6 py-3 text-start text-[11px] font-medium uppercase tracking-[0.15em] text-muted';
  return (
    <section aria-labelledby="ra-title" className={`${CARD} overflow-hidden`}>
      <div className="flex items-start justify-between p-6 pb-5">
        <div><h2 id="ra-title" className="text-base font-semibold text-charcoal">Recent applications</h2><p className="mt-1 text-xs text-muted">Live from the onboarding pipeline</p></div>
        <a href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 underline-offset-2 hover:text-dark hover:underline">View all<ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /></a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-y border-line"><th scope="col" className={th}>Application</th><th scope="col" className={th}>Customer</th><th scope="col" className={th}>Stage</th><th scope="col" className={th}>SLA</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                <td className="px-6 py-4"><p className="whitespace-nowrap font-mono text-xs font-medium text-dark">{r.id}</p><p className="mt-1 text-xs text-muted">{r.when}</p></td>
                <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar name={r.customer} size="lg" /><div className="min-w-0"><p className="font-medium text-charcoal">{r.customer}</p><p className="mt-1 text-xs text-muted">{r.product}</p></div></div></td>
                <td className="px-6 py-4"><StageChip stage={r.stage} /></td>
                <td className="px-6 py-4"><SlaChip sla={r.sla} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const MOD = { Applications: 'bg-primary', Accounts: 'bg-rose', Users: 'bg-gold' } as const;
export function AuditTrail({ items }: { items: AuditItem[] }) {
  return (
    <section aria-labelledby="au-title" className={`${CARD} p-6`}>
      <div className="flex items-start justify-between">
        <div><h2 id="au-title" className="text-base font-semibold text-charcoal">Audit trail</h2><p className="mt-1 text-xs text-muted">Latest recorded actions</p></div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-success"><span aria-hidden="true" className="size-2 rounded-full bg-success motion-safe:animate-pulse" />Live</span>
      </div>
      <ol className="mt-6">
        {items.map((a, i) => (
          <li key={a.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < items.length - 1 && <span aria-hidden="true" className="absolute inset-y-8 start-4 -ms-px w-px bg-line" />}
            <Avatar name={a.parts[0].t} size="md" className="z-10" />
            <div className="min-w-0">
              <p className="text-sm leading-5 text-charcoal">{a.parts.map((p, n) => <span key={n} className={p.em === 'name' ? 'font-semibold' : p.em === 'ref' ? 'font-semibold text-dark' : p.em === 'link' ? 'font-semibold text-primary-600' : ''}>{p.t}</span>)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted"><span aria-hidden="true" className={`size-1.5 rounded-full ${MOD[a.module]}`} />{a.module}<span aria-hidden="true">·</span><time>{a.time}</time></p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
