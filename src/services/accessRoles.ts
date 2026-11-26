import type { Role } from './types';
import { delay } from './controls';

export type Level = 'full' | 'read' | 'none';
export interface MatrixRow { module: string; levels: Record<Role, Level> }
export interface AdGroup { name: string; maps: string; members: number }
export interface AccessRolesData { roles: { role: Role; label: string }[]; matrix: MatrixRow[]; groups: AdGroup[]; domain: string }
export interface AccessRolesService { load(): Promise<AccessRolesData> }

const L = (IT: Level, Marketing: Level, Product: Level, BackOffice: Level, BackOfficeChecker: Level): Record<Role, Level> => ({ IT, Marketing, Product, BackOffice, BackOfficeChecker });

/** In-memory mock (read-only: roles are managed in Active Directory). Keep in step with ACCESS in Sidebar.tsx. */
export const accessRoles: AccessRolesService = {
  async load() {
    await delay();
    return {
      domain: 'corp.nbf.ae',
      roles: [{ role: 'IT', label: 'IT' }, { role: 'Marketing', label: 'Marketing' }, { role: 'Product', label: 'Product' }, { role: 'BackOffice', label: 'Maker' }, { role: 'BackOfficeChecker', label: 'Checker' }],
      matrix: [
        { module: 'Application tracking', levels: L('full', 'read', 'read', 'full', 'full') },
        { module: 'Customer controls · search & view', levels: L('read', 'none', 'none', 'full', 'read') },
        { module: 'Customer controls · initiate', levels: L('none', 'none', 'none', 'full', 'none') },
        { module: 'Approval queue', levels: L('none', 'none', 'none', 'none', 'full') },
        { module: 'Audit trail', levels: L('full', 'read', 'read', 'none', 'none') },
        { module: 'Access & roles', levels: L('full', 'none', 'none', 'none', 'none') },
      ],
      groups: [
        { name: 'NBF-BO-IT-Admins', maps: 'Maps to IT', members: 14 },
        { name: 'NBF-BO-Marketing', maps: 'Maps to Marketing', members: 22 },
        { name: 'NBF-BO-Product', maps: 'Maps to Product', members: 18 },
        { name: 'NBF-BO-Operations', maps: 'Maps to Back-office maker', members: 63 },
        { name: 'NBF-BO-Checkers', maps: 'Maps to Back-office checker', members: 11 },
      ],
    };
  },
};
