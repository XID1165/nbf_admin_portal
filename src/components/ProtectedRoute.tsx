import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../services/types';

/** `roles` is optional; hook for future RBAC. */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
