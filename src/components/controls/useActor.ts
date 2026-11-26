import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { controls, type Actor, type TargetKind } from '../../services/controls';

export function useActor(): Actor | null {
  const { session } = useAuth();
  return session ? { username: session.user.username, displayName: session.user.displayName, role: session.role } : null;
}
/** Live count of requests awaiting approval (updates when anything is submitted or decided). */
export function usePendingCount(kind?: TargetKind): number {
  const [n, setN] = useState(controls.pendingCount(kind));
  useEffect(() => { setN(controls.pendingCount(kind)); return controls.subscribe(() => setN(controls.pendingCount(kind))); }, [kind]);
  return n;
}
