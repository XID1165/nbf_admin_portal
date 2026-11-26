/** BackOffice = maker (initiates block/unblock); BackOfficeChecker = approves or rejects. */
export type Role = 'IT' | 'Marketing' | 'Product' | 'BackOffice' | 'BackOfficeChecker';
export interface UserProfile { id: string; username: string; displayName: string; email: string; role: Role; }
export interface Session { user: UserProfile; role: Role; signedInAt: string; }
export interface Challenge { challengeId: string; maskedEmail: string; }

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_DISABLED' | 'NETWORK' | 'INVALID_OTP' | 'OTP_EXPIRED';
export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) { super(message); this.name = 'AuthError'; }
}

/** Real AD / SSO / MFA backend implementations must satisfy this contract. */
export interface AuthService {
  signIn(username: string, password: string): Promise<Challenge>;
  verifyOtp(challengeId: string, code: string): Promise<Session>;
  resendOtp(challengeId: string): Promise<void>;
  signInWithSso(): Promise<Session>;
}

export interface AuditEntry { user: string; action: string; result: string; timestamp: string; /** Customer CIF the action relates to. */ target?: string; detail?: string; actorName?: string; }
export interface AuditLog { record(e: Omit<AuditEntry, 'timestamp'> & { timestamp?: string }): void; list(): AuditEntry[]; }
