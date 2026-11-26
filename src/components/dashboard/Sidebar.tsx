import { Avatar } from '../ui/Avatar';
import { ArrowRightFromLine, ClipboardCheck, CreditCard, FileText, KeyRound, LayoutGrid, Lock, PanelLeftClose, PanelLeftOpen, RefreshCw, UserCog, Workflow, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePendingCount } from '../controls/useActor';
import { Logo } from '../ui/Logo';
import type { Overview } from '../../services/dashboard';
import type { Role, Session } from '../../services/types';

type Module = 'applications' | 'controls' | 'approvals' | 'audit' | 'roles';
/** Which modules each role may open; the rest show as locked. */
export const ACCESS: Record<Role, Module[]> = {
  IT: ['applications', 'controls', 'audit', 'roles'],
  Marketing: ['applications'],
  Product: ['applications', 'audit'],
  BackOffice: ['applications', 'controls'],
  BackOfficeChecker: ['applications', 'controls', 'approvals'],
};
export const ROLE_LABEL: Record<Role, string> = { IT: 'IT', Marketing: 'Marketing', Product: 'Product', BackOffice: 'Back-office maker', BackOfficeChecker: 'Back-office checker' };

interface Item { id: Module | 'overview'; label: string; icon: LucideIcon; badge?: number; to?: string; /** Custom active test (e.g. keep a parent item active on child routes). */ match?: (path: string) => boolean }

function Group({ label, collapsed, children }: { label: string; collapsed: boolean; children: ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      {collapsed ? <div className="mx-4 mb-2 h-px bg-white/10 max-lg:hidden" /> : null}
      <p className={`mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 ${collapsed ? 'lg:hidden' : ''}`}>{label}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function NavItem({ item, locked, collapsed }: { item: Item; locked?: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const hide = collapsed ? 'lg:hidden' : '';
  const cls = (active: boolean) => `relative flex h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : locked ? 'text-white/40' : 'text-white/80 hover:bg-white/5 hover:text-white'} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`;
  const inner = (active: boolean) => (
    <>
      {active && <span aria-hidden="true" className="absolute inset-y-3 start-0 w-[3px] rounded-e bg-primary shadow-[0_0_12px_rgb(var(--primary)/0.8)]" />}
      <Icon className={`size-[18px] shrink-0 ${active ? 'text-primary' : ''}`} aria-hidden="true" />
      <span className={`flex-1 truncate text-start ${hide}`}>{item.label}</span>
      {!!item.badge && <span className={`flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white ${hide}`}>{item.badge}</span>}
      {locked && <Lock className={`size-3.5 shrink-0 ${hide}`} aria-label="Locked" />}
    </>
  );
  return (
    <li>
      {item.to && !locked ? (
        <NavLink to={item.to} title={item.label} aria-current={(item.match ? item.match(pathname) : undefined) ? 'page' : undefined} className={({ isActive }) => cls(item.match ? item.match(pathname) : isActive)}>{({ isActive }) => inner(item.match ? item.match(pathname) : isActive)}</NavLink>
      ) : (
        <button type="button" aria-disabled={locked || undefined} title={locked ? `${item.label} (not available for your role)` : `${item.label} (coming soon)`} onClick={(e) => e.preventDefault()} className={cls(false)}>{inner(false)}</button>
      )}
    </li>
  );
}

interface Props { session: Session; overview: Overview | null; collapsed: boolean; onToggle: () => void; onLogout: () => void; open: boolean; onClose: () => void }

export function Sidebar({ session, overview, collapsed, onToggle, onLogout, open, onClose }: Props) {
  const can = new Set(ACCESS[session.role]);
  const b = overview?.badges;
  const pendingCount = usePendingCount();
  const pendingUsers = usePendingCount('user');
  const pendingAccounts = usePendingCount('account');
  const item = (id: Module, label: string, icon: LucideIcon, badge?: number, to?: string) => <NavItem key={id} item={{ id, label, icon, badge, to }} locked={!can.has(id)} collapsed={collapsed} />;
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;
  const hide = collapsed ? 'lg:hidden' : '';
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside aria-label="Primary" className={`fixed inset-y-0 start-0 z-40 flex w-[272px] flex-col overflow-hidden bg-dark text-white transition-[transform,width] duration-200 motion-reduce:transition-none lg:translate-x-0 ${collapsed ? 'lg:w-[76px]' : ''} ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_0%_100%,rgb(var(--dark-600))_0%,transparent_60%)]" />
        <div className={`relative p-[11px] ${collapsed ? 'lg:flex lg:justify-center lg:px-0' : ''}`}><Logo variant="white" height={collapsed ? 32 : 40} /></div>
        <nav aria-label="Modules" className="relative mt-3 flex-1 overflow-y-auto px-3">
          <Group label="Workspace" collapsed={collapsed}>
            <NavItem item={{ id: 'overview', label: 'Overview', icon: LayoutGrid, to: '/dashboard' }} collapsed={collapsed} />
            {item('applications', 'Applications', Workflow, b?.applications, '/applications')}
          </Group>
          {can.has('controls') && (
            <Group label="Controls" collapsed={collapsed}>
              <NavItem item={{ id: 'controls', label: 'User controls', icon: UserCog, badge: pendingUsers, to: '/user-controls', match: (p) => p.startsWith('/user-controls') || (p.startsWith('/controls') && !p.startsWith('/controls/approvals')) }} collapsed={collapsed} />
              <NavItem item={{ id: 'controls', label: 'Account controls', icon: CreditCard, badge: pendingAccounts, to: '/account-controls', match: (p) => p.startsWith('/account-controls') }} collapsed={collapsed} />
              {can.has('approvals') && <NavItem item={{ id: 'approvals', label: 'Approval queue', icon: ClipboardCheck, badge: pendingCount, to: '/controls/approvals' }} collapsed={collapsed} />}
            </Group>
          )}
          <Group label="Governance" collapsed={collapsed}>
            {item('audit', 'Audit trail', FileText, undefined, '/audit-trail')}
            {item('roles', 'Access & roles', KeyRound, undefined, '/access-roles')}
          </Group>
        </nav>
        <div className="relative px-3 pb-3">
          {overview && (
            <div className={`mb-4 rounded-control border border-white/15 bg-white/[0.06] px-3 py-2.5 backdrop-blur ${hide}`}>
              <p className="flex items-center gap-2 text-xs font-medium text-white"><RefreshCw className="size-3.5 text-primary" aria-hidden="true" />AD sync {overview.sync.healthy ? 'healthy' : 'delayed'}</p>
              <p className="mt-1 text-[11px] text-white/50">{overview.sync.domain} · {overview.sync.minutesAgo} min ago</p>
            </div>
          )}
          <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'lg:flex-col lg:px-0' : ''}`}>
            <Avatar name={session.user.displayName} size="lg" className="ring-white/30" />
            <div className={`min-w-0 flex-1 ${hide}`}>
              <p className="truncate text-sm font-semibold">{session.user.displayName}</p>
              <p className="truncate text-[11px] text-white/50">{ROLE_LABEL[session.role]} · NBF\{session.user.username}</p>
            </div>
            <button type="button" onClick={onLogout} aria-label="Log out" title="Log out" className="rounded-control p-2 text-white/70 hover:bg-white/10 hover:text-white"><ArrowRightFromLine className="size-[18px]" aria-hidden="true" /></button>
          </div>
          <button type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed}
            className={`mt-1 hidden h-9 w-full items-center gap-3 rounded-control px-3 text-xs text-white/60 hover:bg-white/5 hover:text-white lg:flex ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <Toggle className="size-4 shrink-0" aria-hidden="true" /><span className={hide}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
