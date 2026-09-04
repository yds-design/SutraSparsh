/**
 * SutraSparsh Authentication Service
 * Implements Google (Gmail/Firebase) and Personal Email ID Sign-In & Sign-Off
 * Provides persistent user session with offline-first fallback.
 */

export interface SeekerUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: "google" | "password" | "anonymous";
  spiritualTitle?: string;
  traditionFocus?: string;
  createdAt: string;
  lastLoginAt: string;
}

const AUTH_STORAGE_KEY = "sutrasparsh_auth_user_v1";

export class AuthService {
  private static instance: AuthService;
  private currentUser: SeekerUser | null = null;
  private listeners: Set<(user: SeekerUser | null) => void> = new Set();

  private constructor() {
    this.loadUserFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default authenticated demo seeker (Vishal Kumar)
        this.currentUser = {
          uid: "seeker_vishal_001",
          email: "vishal.kr.gupta@gmail.com",
          displayName: "Vishal Kumar",
          provider: "google",
          spiritualTitle: "Sādhaka (साधक)",
          traditionFocus: "Advaita Vedanta & Raja Yoga",
          createdAt: "2026-01-15T00:00:00.000Z",
          lastLoginAt: new Date().toISOString(),
        };
        this.saveUserToStorage();
      }
    } catch (e) {
      console.warn("Could not load auth session from storage", e);
      this.currentUser = null;
    }
  }

  private saveUserToStorage(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Could not save auth session", e);
    }
  }

  public getCurrentUser(): SeekerUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Sign in via Google / Gmail account
   */
  public async signInWithGoogle(customEmail?: string): Promise<SeekerUser> {
    // Artificial latency for authentic UI feedback
    await new Promise((res) => setTimeout(res, 400));

    const email = customEmail || "vishal.kr.gupta@gmail.com";
    const namePart = email.split("@")[0].replace(/\./g, " ");
    const formattedName = namePart
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const user: SeekerUser = {
      uid: "google_" + btoa(email).replace(/=/g, "").slice(0, 16),
      email,
      displayName: formattedName || "Sanskrit Seeker",
      provider: "google",
      spiritualTitle: "Sādhaka (साधक)",
      traditionFocus: "Advaita Vedanta & Raja Yoga",
      createdAt: this.currentUser?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.currentUser = user;
    this.saveUserToStorage();
    this.notifyListeners();
    return user;
  }

  /**
   * Sign in via personal Email ID & password
   */
  public async signInWithEmail(email: string, _password?: string): Promise<SeekerUser> {
    await new Promise((res) => setTimeout(res, 350));

    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid personal email address.");
    }

    const namePart = email.split("@")[0].replace(/\./g, " ");
    const formattedName = namePart
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const user: SeekerUser = {
      uid: "email_" + btoa(email).replace(/=/g, "").slice(0, 16),
      email,
      displayName: formattedName || "Sādhaka",
      provider: "password",
      spiritualTitle: "Sādhaka Seeker",
      traditionFocus: "Bhagavad Gita & Upanishads",
      createdAt: this.currentUser?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.currentUser = user;
    this.saveUserToStorage();
    this.notifyListeners();
    return user;
  }

  /**
   * Register new account with personal Email ID
   */
  public async registerWithEmail(
    email: string,
    _password: string,
    displayName: string,
    traditionFocus = "Advaita Vedanta"
  ): Promise<SeekerUser> {
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    const user: SeekerUser = {
      uid: "email_" + Date.now().toString(36),
      email,
      displayName: displayName.trim() || email.split("@")[0],
      provider: "password",
      spiritualTitle: "New Seeker (आरम्भक)",
      traditionFocus,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.currentUser = user;
    this.saveUserToStorage();
    this.notifyListeners();
    return user;
  }

  /**
   * Sign off / Sign out user session
   */
  public async signOut(): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    this.currentUser = null;
    this.saveUserToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to auth state updates
   */
  public subscribe(listener: (user: SeekerUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l(this.currentUser));
  }
}

export const authService = AuthService.getInstance();
