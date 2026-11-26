import { Avatar } from '../components/ui/Avatar';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACCESS } from '../components/dashboard/Sidebar';
import { accessRoles, type AccessRolesData, type Level } from '../services/accessRoles';

const CARD = 'rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(var(--dark)/0.04),0_8px_24px_-12px_rgb(var(--dark)/0.1)]';

function Cell({ level }: { level: Level }) {
  if (level === 'full') return <span role="img" aria-label="Full access" className="mx-auto flex size-7 items-center justify-center rounded-full bg-primary text-white"><Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" /></span>;
  if (level === 'read') return <span className="mx-auto flex w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary-600">Read</span>;
  return <span role="img" aria-label="No access" className="mx-auto block h-px w-3.5 bg-line" />;
}

export default function AccessRolesPage() {
  const { session } = useAuth();
  const [data, setData] = useState<AccessRolesData | null>(null);
  useEffect(() => { let live = true; accessRoles.load().then((d) => live && setData(d)); return () => { live = false; }; }, []);
  if (!session) return null;
  if (!ACCESS[session.role].includes('roles')) return <Navigate to="/dashboard" replace />;
  const th = 'py-4 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-muted';

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">Governance</p>
      <h1 className="mt-3 text-[28px] font-medium leading-9 text-charcoal">Access &amp; roles</h1>
      <p className="mt-2 text-sm text-muted">Roles are inherited from Active Directory security groups. Changes are made in AD, not here.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,745fr)_minmax(0,524fr)] lg:items-start">
        <section aria-labelledby="pm-title" className={CARD}>
          <div className="p-6 pb-5"><h2 id="pm-title" className="text-base font-semibold text-charcoal">Permission matrix</h2><p className="mt-1 text-xs text-muted">What each role can do in the portal</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr>
                <th scope="col" className="ps-6 py-4 text-start text-[11px] font-medium uppercase tracking-[0.15em] text-muted">Module</th>
                {(data?.roles ?? []).map((r) => <th key={r.role} scope="col" className={th}>{r.label}</th>)}
              </tr></thead>
              <tbody>
                {!data && Array.from({ length: 5 }, (_, i) => <tr key={i} className="border-t border-line"><td colSpan={6} className="px-6 py-4"><div className="h-7 animate-pulse rounded-control bg-charcoal/5" /></td></tr>)}
                {data?.matrix.map((m) => (
                  <tr key={m.module} className="h-[61px] border-t border-line">
                    <th scope="row" className="ps-6 text-start font-normal text-charcoal">{m.module}</th>
                    {data.roles.map((r) => <td key={r.role} className="px-2"><Cell level={m.levels[r.role]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="ad-title" className={CARD}>
          <div className="p-6 pb-4"><h2 id="ad-title" className="text-base font-semibold text-charcoal">AD security groups</h2><p className="mt-1 text-xs text-muted">Synced from {data?.domain ?? 'corp.nbf.ae'}</p></div>
          <ul>
            {!data && Array.from({ length: 4 }, (_, i) => <li key={i} className="border-t border-line px-6 py-4"><div className="h-9 animate-pulse rounded-control bg-charcoal/5" /></li>)}
            {data?.groups.map((g) => (
              <li key={g.name} className="flex items-center justify-between gap-4 border-t border-line px-6 py-[17px]">
                <div className="flex min-w-0 items-center gap-3"><Avatar kind="group" size="xl" /><div className="min-w-0"><p className="truncate font-mono text-xs font-medium text-dark">{g.name}</p><p className="mt-1 text-xs text-muted">{g.maps}</p></div></div>
                <p className="shrink-0 text-end"><span className="block text-sm font-semibold text-charcoal">{g.members}</span><span className="block text-[11px] text-muted">members</span></p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
