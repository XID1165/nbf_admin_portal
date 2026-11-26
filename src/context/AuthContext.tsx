import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../services/auth';
import { auditLog } from '../services/auditLog';
import type { Challenge, Session } from '../services/types';

interface Ctx {
  session: Session | null;
  signIn: (username: string, password: string) => Promise<Challenge>;
  verifyOtp: (challengeId: string, code: string) => Promise<void>;
  resendOtp: (challengeId: string) => Promise<void>;
  signInWithSso: () => Promise<void>;
  logout: () => void;
}
const AuthCtx = createContext<Ctx | null>(null);

/** Session lives in memory only (never localStorage); a refresh signs the user out. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const verifyOtp = useCallback(async (id: string, code: string) => setSession(await auth.verifyOtp(id, code)), []);
  const signInWithSso = useCallback(async () => setSession(await auth.signInWithSso()), []);
  const logout = useCallback(() => {
    if (session) auditLog.record({ user: session.user.username, action: 'LOGOUT', result: 'SUCCESS' });
    setSession(null);
  }, [session]);
  const value = useMemo<Ctx>(() => ({
    session, signIn: auth.signIn, verifyOtp, resendOtp: auth.resendOtp, signInWithSso, logout,
  }), [session, verifyOtp, signInWithSso, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
