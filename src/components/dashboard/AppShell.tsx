import { useEffect, useState } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { dashboard, type Overview } from '../../services/dashboard';

const TITLES: Record<string, string> = { '/dashboard': 'Overview', '/applications': 'Applications', '/user-controls': 'User controls', '/account-controls': 'Account controls', '/controls/approvals': 'Approval queue', '/access-roles': 'Access & roles', '/audit-trail': 'Audit trail' };
const titleFor = (p: string) => TITLES[p] ?? (p.startsWith('/controls/') || p.startsWith('/user-controls/') || p.startsWith('/account-controls/') ? 'Customer profile' : 'Overview');
export interface ShellContext { overview: Overview | null }
export const useShell = () => useOutletContext<ShellContext>();

/** Signed-in layout shared by every portal screen: sidebar, top bar and the logged-in user. */
export function AppShell() {
  const { session, logout } = useAuth();
  const { pathname } = useLocation();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!session) return;
    let live = true;
    dashboard.getOverview(session.role).then((o) => { if (live) setOverview(o); });
    return () => { live = false; };
  }, [session]);
  useEffect(() => setMenu(false), [pathname]);
  if (!session) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar session={session} overview={overview} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onLogout={logout} open={menu} onClose={() => setMenu(false)} />
      <div className={`transition-[padding] duration-200 motion-reduce:transition-none ${collapsed ? 'lg:ps-[76px]' : 'lg:ps-[272px]'}`}>
        <Topbar role={session.role} title={titleFor(pathname)} onMenu={() => setMenu(true)} />
        <main className="px-4 py-8 sm:px-8 xl:px-20"><Outlet context={{ overview } satisfies ShellContext} /></main>
      </div>
    </div>
  );
}
