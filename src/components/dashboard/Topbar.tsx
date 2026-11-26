import { Bell, Menu, Search } from 'lucide-react';
import { ROLE_LABEL } from './Sidebar';
import type { Role } from '../../services/types';

export function Topbar({ role, title, onMenu }: { role: Role; title: string; onMenu: () => void }) {
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-8 xl:px-20">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-control p-2 text-charcoal hover:bg-charcoal/5 lg:hidden"><Menu className="size-5" aria-hidden="true" /></button>
      <nav aria-label="Breadcrumb" className="text-sm"><ol className="flex items-center gap-2"><li className="text-muted">{ROLE_LABEL[role]}</li><li aria-hidden="true" className="text-line">/</li><li aria-current="page" className="font-medium text-charcoal">{title}</li></ol></nav>
      <div className="ms-auto flex items-center gap-4">
        <label className="relative hidden md:block">
          <span className="sr-only">Search customers, CIF, application ID</span>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" aria-hidden="true" />
          <input type="search" placeholder="Search customers, CIF, application ID…" className="h-10 w-[340px] rounded-control border border-line bg-white ps-10 pe-12 text-sm text-charcoal placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" />
          <kbd className="pointer-events-none absolute inset-y-0 end-3 my-auto hidden h-5 items-center rounded bg-surface px-1.5 text-[10px] text-muted lg:flex">⌘K</kbd>
        </label>
        <span className="hidden text-xs text-muted xl:block">{date}</span>
        <span className="rounded-full bg-dark px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Prod</span>
        <button type="button" aria-label="Notifications (1 unread)" className="relative flex size-10 items-center justify-center rounded-control border border-line bg-white text-charcoal hover:bg-surface">
          <Bell className="size-[18px]" aria-hidden="true" /><span aria-hidden="true" className="absolute end-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
