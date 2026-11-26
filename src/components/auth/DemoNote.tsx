import { useState } from 'react';
import { ChevronUp, FlaskConical } from 'lucide-react';
import { DEMO_ACCOUNTS, DEMO_OTP, DEMO_PASSWORD } from '../../services/auth';

const CUSTOMERS: [string, string][] = [
  ['100001', 'Happy path · active user, 3 active accounts'],
  ['100002', 'Blocked user (customer request)'],
  ['100003', 'Locked user (failed attempts)'],
  ['100004', 'Compliance-blocked + closed account'],
  ['100005', 'Pending requests already exist'],
  ['100006', 'Submit → core banking timeout'],
  ['100007', 'Submit → concurrent-change conflict'],
  ['100008', 'Dormant user'],
];

/** Dev-only helper (stripped from production builds). Floats outside the card so it never affects the login layout or scroll. */
export function DemoNote() {
  const [open, setOpen] = useState(false);
  if (!import.meta.env.DEV) return null;
  return (
    <div className="fixed bottom-4 start-4 z-20 max-w-[calc(100vw-2rem)]">
      {open && (
        <div id="demo-note" className="mb-2 max-h-[70vh] w-[360px] max-w-full overflow-y-auto rounded-card border border-line bg-white p-4 text-xs text-charcoal shadow-card">
          <p className="font-semibold">Sign in (dev only)</p>
          <p className="mt-1 text-muted">Password <code className="font-mono text-charcoal">{DEMO_PASSWORD}</code> · OTP <code className="font-mono text-charcoal">{DEMO_OTP}</code></p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((a) => <li key={a.username} className="flex justify-between gap-3"><code className="font-mono">{a.username}</code><span className="text-end text-muted">{a.note}</span></li>)}
          </ul>
          <p className="mt-4 font-semibold">Customers (search by CIF)</p>
          <ul className="mt-2 space-y-1">
            {CUSTOMERS.map(([cif, note]) => <li key={cif} className="flex gap-3"><code className="font-mono">{cif}</code><span className="text-muted">{note}</span></li>)}
          </ul>
          <p className="mt-3 text-muted">Search for <code className="font-mono text-charcoal">error</code> to see the search service error.</p>
        </div>
      )}
      <button type="button" aria-expanded={open} aria-controls="demo-note" onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-ink/70 px-4 text-xs font-medium text-white backdrop-blur hover:bg-ink">
        <FlaskConical className="size-4" aria-hidden="true" />Demo accounts<ChevronUp className={`size-4 transition-transform ${open ? '' : 'rotate-180'}`} aria-hidden="true" />
      </button>
    </div>
  );
}
