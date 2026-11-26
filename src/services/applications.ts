import type { RecentApp, StageName } from './dashboard';

export type Channel = 'NBF Direct App' | 'Web' | 'Branch';
export interface Application { id: string; when: string; customer: string; product: string; channel: Channel; stage: StageName; sla: RecentApp['sla']; owner: string | null }
export interface ApplicationsService { list(): Promise<Application[]> }

const A = (id: string, when: string, customer: string, product: string, channel: Channel, stage: StageName, sla: Application['sla'], owner: string | null): Application =>
  ({ id: `APP-26-11-${id}`, when: `Today, ${when}`, customer, product, channel, stage, sla, owner });
const due = (label: string) => ({ kind: 'due' as const, label });
const ok = (label: string) => ({ kind: 'ok' as const, label });
const closed = { kind: 'closed' as const, label: 'Closed' };

/** In-memory mock; swap for an API-backed implementation behind the same interface. */
export const applications: ApplicationsService = {
  async list() {
    await new Promise((r) => setTimeout(r, 250));
    return [
      A('0482', '08:42', 'Ahmed Al Shamsi', 'Personal Loan · AED 180,000', 'NBF Direct App', 'Credit check', due('3h left'), 'Rashid K.'),
      A('0481', '08:31', 'Fatima Al Nuaimi', 'Current Account', 'Web', 'KYC review', ok('6h left'), 'Mariam Z.'),
      A('0479', '08:05', 'Gulf Horizon Trading LLC', 'Business Account', 'Branch', 'KYC review', { kind: 'breached', label: 'Breached' }, 'Omar H.'),
      A('0477', '07:58', 'Priya Nair', 'Credit Card · AED 35,000', 'NBF Direct App', 'Approved', closed, 'Rashid K.'),
      A('0474', '07:40', 'Khalid Al Dhaheri', 'Fixed Deposit · AED 500,000', 'Web', 'Activated', closed, 'Noura M.'),
      A('0470', '07:22', 'Mariam Al Zaabi', 'Credit Card · AED 20,000', 'NBF Direct App', 'Submitted', ok('9h left'), null),
      A('0466', '07:10', 'Desert Rose Logistics', 'Trade Finance · AED 2.4M', 'Branch', 'Credit check', due('1h left'), 'Omar H.'),
      A('0461', '06:54', 'Yousef Haddad', 'Personal Loan · AED 95,000', 'Web', 'Rejected', closed, 'Mariam Z.'),
      A('0457', '06:31', 'Hessa Al Kaabi', 'Current Account', 'NBF Direct App', 'Approved', closed, 'Noura M.'),
    ];
  },
};
