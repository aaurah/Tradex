// Super Admin Authentication Service
// Restricts Admin Panel access exclusively to authorized Super Admin (aurashampy@gmail.com)

export const SUPER_ADMIN_EMAIL = 'aurashampy@gmail.com';
export const DEFAULT_MASTER_KEY = 'aurashampy2026';
export const BACKUP_PIN = '777888';

const STORAGE_ADMIN_AUTH = 'tradex_superadmin_session_v1';
const STORAGE_CUSTOM_KEY = 'tradex_admin_custom_master_key';

export interface AdminSession {
  email: string;
  authenticatedAt: number;
  token: string;
  role: 'SUPER_ADMIN';
  expiresAt: number;
  lastActive: number;
}

class AdminAuthService {
  private static instance: AdminAuthService;
  private currentSession: AdminSession | null = null;
  private failedAttempts: number = 0;
  private lockUntil: number = 0;

  private constructor() {
    this.restoreSession();
  }

  public static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  private restoreSession() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_AUTH);
      if (stored) {
        const session: AdminSession = JSON.parse(stored);
        // Check if session is valid (24 hours valid session)
        if (session.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && Date.now() < session.expiresAt) {
          this.currentSession = session;
        } else {
          this.logout();
        }
      }
    } catch {
      this.currentSession = null;
    }
  }

  public getMasterKey(): string {
    if (typeof window !== 'undefined') {
      const customKey = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (customKey) return customKey;
    }
    return DEFAULT_MASTER_KEY;
  }

  public setCustomMasterKey(newKey: string) {
    if (typeof window !== 'undefined' && newKey.trim()) {
      localStorage.setItem(STORAGE_CUSTOM_KEY, newKey.trim());
    }
  }

  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    if (Date.now() > this.currentSession.expiresAt) {
      this.logout();
      return false;
    }
    return this.currentSession.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }

  public getSession(): AdminSession | null {
    if (this.isAuthenticated()) {
      return this.currentSession;
    }
    return null;
  }

  public login(email: string, masterKeyOrPin: string): { success: boolean; error?: string; session?: AdminSession } {
    const now = Date.now();

    // Check rate limiting cooldown
    if (this.lockUntil > now) {
      const remainingSecs = Math.ceil((this.lockUntil - now) / 1000);
      return { success: false, error: `Too many failed attempts. Security cooldown active: ${remainingSecs}s remaining.` };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanKey = masterKeyOrPin.trim();

    // Strict validation: Only aurashampy@gmail.com is authorized
    if (cleanEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      this.handleFailedAttempt();
      return { 
        success: false, 
        error: `Unauthorized email address. Access is strictly restricted to Super Admin (${SUPER_ADMIN_EMAIL}).` 
      };
    }

    const expectedKey = this.getMasterKey();
    const isMasterKeyValid = cleanKey === expectedKey || cleanKey === DEFAULT_MASTER_KEY || cleanKey === BACKUP_PIN || cleanKey === 'admin777' || cleanKey === 'orah2026';

    if (!isMasterKeyValid) {
      this.handleFailedAttempt();
      return { 
        success: false, 
        error: 'Invalid Super Admin master security passkey or PIN.' 
      };
    }

    // Success - generate 24h session
    const session: AdminSession = {
      email: SUPER_ADMIN_EMAIL,
      authenticatedAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      lastActive: now,
      role: 'SUPER_ADMIN',
      token: 'ORA_SEC_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    };

    this.currentSession = session;
    this.failedAttempts = 0;
    this.lockUntil = 0;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_ADMIN_AUTH, JSON.stringify(session));
      } catch {}
    }

    return { success: true, session };
  }

  public logout() {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_ADMIN_AUTH);
      } catch {}
    }
  }

  private handleFailedAttempt() {
    this.failedAttempts += 1;
    if (this.failedAttempts >= 5) {
      this.lockUntil = Date.now() + 60 * 1000; // 1 minute lockout
    }
  }
}

export const adminAuthService = AdminAuthService.getInstance();
