import { CheckCircle2, CircleDot, XCircle } from 'lucide-react';
import type { ActivityEntry } from '../../services/controls';

const ICON = { success: { i: CheckCircle2, c: 'text-success' }, failure: { i: XCircle, c: 'text-danger' }, info: { i: CircleDot, c: 'text-primary-600' } } as const;
const when = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section aria-labelledby="activity-title" className="rounded-card border border-line bg-white p-6 shadow-soft">
      <h2 id="activity-title" className="text-base font-semibold text-charcoal">Activity</h2>
      <p className="mt-1 text-xs text-muted">Audit entries for this customer</p>
      {entries.length === 0 ? <p className="mt-6 text-sm text-muted">No activity recorded yet.</p> : (
        <ol className="mt-6">
          {entries.map((e, i) => {
            const { i: Icon, c } = ICON[e.outcome];
            return (
              <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
                {i < entries.length - 1 && <span aria-hidden="true" className="absolute inset-y-6 start-[9px] w-px bg-line" />}
                <Icon className={`relative z-10 mt-0.5 size-[19px] shrink-0 rounded-full bg-white ${c}`} aria-label={e.outcome === 'success' ? 'Success' : e.outcome === 'failure' ? 'Failure' : 'Info'} />
                <div className="min-w-0">
                  <p className="text-sm leading-5 text-charcoal">{e.text}</p>
                  <p className="mt-1 text-[11px] text-muted">{e.actor} · <time dateTime={e.at}>{when(e.at)}</time></p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
