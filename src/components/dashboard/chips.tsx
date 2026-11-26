import { Clock } from 'lucide-react';
import type { RecentApp, StageName } from '../../services/dashboard';

const STAGE: Record<StageName, string> = {
  'Credit check': 'bg-gold/10 text-warning ring-gold/30',
  'KYC review': 'bg-primary/10 text-primary-600 ring-primary/25',
  Approved: 'bg-success-50 text-success ring-success/25',
  Activated: 'bg-dark text-white ring-dark',
  Submitted: 'bg-charcoal/5 text-charcoal/70 ring-charcoal/12',
  Rejected: 'bg-rose/10 text-danger ring-rose/30',
};
export function StageChip({ stage }: { stage: StageName }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STAGE[stage]}`}>{stage}</span>;
}

export function SlaChip({ sla }: { sla: RecentApp['sla'] }) {
  if (sla.kind === 'closed') return <span className="text-xs text-muted">{sla.label}</span>;
  if (sla.kind === 'ok') return <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Clock className="size-3.5" aria-hidden="true" />{sla.label}</span>;
  const due = sla.kind === 'due';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${due ? 'bg-gold/10 text-warning ring-gold/30' : 'bg-rose/10 text-danger ring-rose/30'}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${due ? 'bg-gold' : 'bg-rose'}`} />{sla.label}
    </span>
  );
}
