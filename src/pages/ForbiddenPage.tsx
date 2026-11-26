import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function ForbiddenPage({ what = 'Customer Controls' }: { what?: string }) {
  return (
    <div role="alert" className="mx-auto mt-10 max-w-[480px] rounded-card border border-line bg-white p-8 text-center shadow-soft sm:mt-20">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-50 text-danger"><ShieldOff className="size-7" aria-hidden="true" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Error 403</p>
      <h1 className="mt-2 text-2xl font-medium text-charcoal">Access denied</h1>
      <p className="mt-3 text-sm text-muted">You don&rsquo;t have access to {what}. Contact your administrator.</p>
      <Link to="/dashboard" className="mt-6 inline-flex h-10 items-center rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-dark">Back to overview</Link>
    </div>
  );
}
