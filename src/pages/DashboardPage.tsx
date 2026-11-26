import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACCESS, ROLE_LABEL } from '../components/dashboard/Sidebar';
import { controls } from '../services/controls';
import { useShell } from '../components/dashboard/AppShell';
import { Approvals, AuditTrail, ChannelChart, Hero, KpiCard, Pipeline, RecentApplications } from '../components/dashboard/OverviewCards';
import type { Approval } from '../services/dashboard';

export default function DashboardPage() {
  const { session } = useAuth();
  const { overview: data } = useShell();
  const nav = useNavigate();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const canDecide = !!session && ACCESS[session.role].includes('approvals');
  /** Checkers see the live approval queue; everyone else has nothing waiting on them. */
  useEffect(() => {
    if (!canDecide) { setApprovals([]); return; }
    const pull = () => controls.listPending().then((r) => setApprovals(r.map((x) => ({ id: x.id, title: `${x.target.kind === 'user' ? 'Digital user' : x.target.label} \u00b7 ${x.customerName}`, reason: `${x.reason}`, maker: x.makerName, minutesAgo: Math.max(1, Math.round((Date.now() - new Date(x.createdAt).getTime()) / 60000)) }))));
    pull();
    return controls.subscribe(pull);
  }, [canDecide]);
  if (!session) return null;

  const decide = (id: string) => nav(`/controls/approvals?open=${id}`);
  const first = session.user.displayName.split(/\s+/)[0];
  return (
    <>
      {!data ? (
            <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <span className="sr-only">Loading overview…</span>
              <div className="h-[362px] animate-pulse rounded-card bg-charcoal/5" /><div className="h-[362px] animate-pulse rounded-card bg-charcoal/5" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,856fr)_minmax(0,416fr)]">
                <Hero firstName={first} workspace={ROLE_LABEL[session.role]} stats={data.stats} approvals={approvals.length} controlsHref={ACCESS[session.role].includes('controls') ? '/user-controls' : undefined} />
                <Approvals items={approvals} onDecide={decide} title={canDecide ? 'Awaiting your approval' : 'Approvals'} subtitle={canDecide ? 'Maker-checker requests' : 'Only checkers see the approval queue'} />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{data.kpis.map((k) => <KpiCard key={k.key} kpi={k} />)}</div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,856fr)_minmax(0,416fr)]">
                <ChannelChart days={data.channels} />
                <Pipeline stages={data.pipeline} activation={data.activation} />
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,856fr)_minmax(0,416fr)]">
                <RecentApplications rows={data.recent} />
                <AuditTrail items={data.audit} />
              </div>
            </div>
          )}
    </>
  );
}
