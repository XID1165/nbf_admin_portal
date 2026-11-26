import type { Role } from './types';

export interface Approval { id: string; title: string; reason: string; maker: string; minutesAgo: number }
export interface Kpi { key: string; label: string; value: string; delta: string; trend: 'up' | 'down'; tone: 'success' | 'gold'; color: 'primary' | 'dark' | 'gold' | 'rose'; series: number[] }
export interface ChannelDay { label: string; branch: number; web: number; app: number }
export interface PipelineStage { label: string; count: number; conversion?: number }
export type StageName = 'Submitted' | 'KYC review' | 'Credit check' | 'Approved' | 'Activated' | 'Rejected';
export interface RecentApp { id: string; when: string; customer: string; product: string; stage: StageName; sla: { kind: 'due' | 'ok' | 'breached' | 'closed'; label: string } }
export interface AuditItem { id: string; initials: string; tone: 'slate' | 'dark' | 'teal'; parts: { t: string; em?: 'name' | 'ref' | 'link' }[]; module: 'Applications' | 'Accounts' | 'Users'; time: string }
export interface Overview {
  stats: { inPipeline: number; approvalRate: number; slaMet: number; nearSla: number };
  approvals: Approval[];
  kpis: Kpi[];
  channels: ChannelDay[];
  pipeline: PipelineStage[];
  activation: { rate: number; deltaPts: number };
  recent: RecentApp[];
  audit: AuditItem[];
  sync: { healthy: boolean; domain: string; minutesAgo: number };
  badges: { applications: number; users: number; accounts: number };
}
export interface DashboardService { getOverview(role: Role): Promise<Overview> }

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** In-memory mock; swap for an API-backed implementation behind the same interface. */
export const dashboard: DashboardService = {
  async getOverview() {
    await new Promise((r) => setTimeout(r, 250));
    const seg: [number, number, number][] = [[13, 28, 62], [8, 22, 48], [6, 19, 42], [17, 31, 71], [20, 35, 85], [18, 33, 78], [22, 38, 92]];
    const channels = seg.map(([branch, web, app], i) => {
      const dt = new Date(); dt.setDate(dt.getDate() - (6 - i));
      return { label: i === 6 ? 'Today' : DAY[dt.getDay()], branch, web, app };
    });
    return {
      stats: { inPipeline: 342, approvalRate: 73, slaMet: 96.8, nearSla: 3 },
      approvals: [
        { id: 'a1', title: 'Unblock account · Mariam Al Zaabi · •••• 4419', reason: 'Court order lifted', maker: 'Omar Haddad', minutesAgo: 12 },
        { id: 'a2', title: 'Unblock user · Layla Al Suwaidi', reason: 'Identity re-verified at branch', maker: 'Noura Al Mazrouei', minutesAgo: 26 },
      ],
      kpis: [
        { key: 'apps', label: 'Applications today', value: '214', delta: '+12.4%', trend: 'up', tone: 'success', color: 'primary', series: [18, 22, 20, 26, 28, 31, 36, 40] },
        { key: 'tat', label: 'Avg. turnaround', value: '4h 12m', delta: '−18 min', trend: 'up', tone: 'success', color: 'dark', series: [40, 38, 36, 30, 28, 22, 20, 18] },
        { key: 'users', label: 'Blocked users', value: '40', delta: '+3 this week', trend: 'down', tone: 'gold', color: 'gold', series: [10, 14, 12, 18, 20, 20, 24, 28] },
        { key: 'accts', label: 'Blocked accounts', value: '23', delta: '−2 this week', trend: 'up', tone: 'success', color: 'rose', series: [30, 30, 24, 20, 26, 20, 18, 18] },
      ],
      channels,
      pipeline: [
        { label: 'Submitted', count: 128 },
        { label: 'KYC review', count: 94, conversion: 73 },
        { label: 'Credit check', count: 61, conversion: 65 },
        { label: 'Approved', count: 47, conversion: 77 },
        { label: 'Activated', count: 39, conversion: 83 },
      ],
      activation: { rate: 30.5, deltaPts: 2.1 },
      recent: [
        { id: 'APP-26-11-0482', when: 'Today, 08:42', customer: 'Ahmed Al Shamsi', product: 'Personal Loan · AED 180,000', stage: 'Credit check', sla: { kind: 'due', label: '3h left' } },
        { id: 'APP-26-11-0481', when: 'Today, 08:31', customer: 'Fatima Al Nuaimi', product: 'Current Account', stage: 'KYC review', sla: { kind: 'ok', label: '6h left' } },
        { id: 'APP-26-11-0479', when: 'Today, 08:05', customer: 'Gulf Horizon Trading LLC', product: 'Business Account', stage: 'KYC review', sla: { kind: 'breached', label: 'Breached' } },
        { id: 'APP-26-11-0477', when: 'Today, 07:58', customer: 'Priya Nair', product: 'Credit Card · AED 35,000', stage: 'Approved', sla: { kind: 'closed', label: 'Closed' } },
        { id: 'APP-26-11-0474', when: 'Today, 07:40', customer: 'Khalid Al Dhaheri', product: 'Fixed Deposit · AED 500,000', stage: 'Activated', sla: { kind: 'closed', label: 'Closed' } },
        { id: 'APP-26-11-0470', when: 'Today, 07:22', customer: 'Mariam Al Zaabi', product: 'Credit Card · AED 20,000', stage: 'Submitted', sla: { kind: 'ok', label: '9h left' } },
      ],
      audit: [
        { id: 'u1', initials: 'RK', tone: 'slate', parts: [{ t: 'Rashid Al Ketbi', em: 'name' }, { t: ' moved application to Credit check ' }, { t: 'APP-26-11-0482', em: 'ref' }], module: 'Applications', time: '08:51' },
        { id: 'u2', initials: 'OH', tone: 'dark', parts: [{ t: 'Omar Haddad', em: 'name' }, { t: ' requested unblock of account •••• 4419' }], module: 'Accounts', time: '08:44' },
        { id: 'u3', initials: 'NM', tone: 'teal', parts: [{ t: 'Noura Al Mazrouei', em: 'name' }, { t: ' requested unblock of user ' }, { t: 'Layla Al Suwaidi', em: 'link' }], module: 'Users', time: '08:30' },
        { id: 'u4', initials: 'S', tone: 'slate', parts: [{ t: 'System', em: 'name' }, { t: ' auto-blocked user after 5 failed OTPs ' }, { t: 'Layla Al Suwaidi', em: 'link' }], module: 'Users', time: '07:12' },
        { id: 'u5', initials: 'MZ', tone: 'slate', parts: [{ t: 'Mariam Al Zaabi', em: 'name' }, { t: ' approved KYC documents ' }, { t: 'APP-26-11-0457', em: 'ref' }], module: 'Applications', time: '06:58' },
      ],
      sync: { healthy: true, domain: 'corp.nbf.ae', minutesAgo: 2 },
      badges: { applications: 3, users: 1, accounts: 1 },
    };
  },
};
