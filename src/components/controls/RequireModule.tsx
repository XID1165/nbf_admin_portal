import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ACCESS } from '../dashboard/Sidebar';
import ForbiddenPage from '../../pages/ForbiddenPage';

/** Route guard: renders a 403 page (not a redirect) when the role lacks the module. */
export function RequireModule({ module, what }: { module: 'controls' | 'approvals'; what?: string }) {
  const { session } = useAuth();
  if (!session) return null;
  return ACCESS[session.role].includes(module) ? <Outlet /> : <ForbiddenPage what={what} />;
}
