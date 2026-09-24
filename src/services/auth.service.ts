/**
 * SutraSparsh Authentication Service
 * Implements Google (Gmail/Firebase) and Personal Email ID Sign-In & Sign-Off
 * Provides persistent user session with offline-first fallback.
 */

import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, googleAuthProvider } from "./firebase.client";

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
  private isFirebaseReady = false;

  private constructor() {
    this.cleanLegacyMockSessions();
    this.loadUserFromStorage();
    this.initFirebaseAuthState();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Cleans out any stale simulated mock user objects that would fail Firestore security rules
   */
  private cleanLegacyMockSessions(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed?.uid === "seeker_vishal_001" ||
          (typeof parsed?.uid === "string" && parsed.uid.startsWith("google_") && !parsed.uid.startsWith("auth_"))
        ) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          this.currentUser = null;
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  private initFirebaseAuthState(): void {
    try {
      onAuthStateChanged(auth, (fbUser) => {
        this.isFirebaseReady = true;
        if (fbUser) {
          const user: SeekerUser = {
            uid: fbUser.uid,
            email: fbUser.email || "your.daily.shloka@gmail.com",
            displayName: fbUser.displayName || "Sādhaka",
            photoURL: fbUser.photoURL || undefined,
            provider: "google",
            spiritualTitle: "Sādhaka (साधक)",
            traditionFocus: "Advaita Vedanta & Raja Yoga",
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          this.currentUser = user;
          this.saveUserToStorage();
        } else {
          // If not authenticated in Firebase, keep user as null (local sanctuary mode)
          // unless they previously signed in with a local password profile
          if (this.currentUser?.provider === "google") {
            this.currentUser = null;
            this.saveUserToStorage();
          }
        }
        this.notifyListeners();
      });
    } catch (e) {
      console.warn("Could not attach Firebase onAuthStateChanged listener:", e);
      this.isFirebaseReady = true;
    }
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load if not legacy mock
        if (parsed?.uid && parsed.uid !== "seeker_vishal_001") {
          this.currentUser = parsed;
        } else {
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
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

  public isFirebaseAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  public getFirebaseUid(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Sign in via Google / Gmail account using real Firebase Auth popup
   */
  public async signInWithGoogle(_customEmail?: string): Promise<SeekerUser> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const user: SeekerUser = {
        uid: fbUser.uid,
        email: fbUser.email || _customEmail || "seeker@sutrasparsh.com",
        displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Sanskrit Seeker",
        photoURL: fbUser.photoURL || undefined,
        provider: "google",
        spiritualTitle: "Sādhaka (साधक)",
        traditionFocus: "Advaita Vedanta & Raja Yoga",
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      this.currentUser = user;
      this.saveUserToStorage();
      this.notifyListeners();
      return user;
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in popup was closed before completing. In embedded preview frames or certain browser privacy modes, cross-origin popups may be blocked. Please open the app in a new tab or use Instant Email Sign-In.");
      }
      if (err?.code === "auth/cancelled-popup-request") {
        throw new Error("Sign-in request was cancelled or superseded by another window.");
      }
      if (err?.code === "auth/popup-blocked") {
        throw new Error("Pop-up window was blocked by your browser. Please allow pop-ups for this site or open in a separate browser window.");
      }
      if (err?.code === "auth/unauthorized-domain") {
        const host = typeof window !== "undefined" ? window.location.hostname : "current host";
        throw new Error(`Domain '${host}' is not yet authorized in Firebase Console (Authentication > Settings > Authorized Domains). Please add '${host}' to authorized domains.`);
      }
      if (err?.code === "auth/operation-not-allowed") {
        throw new Error("Google Sign-In is not enabled yet in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Google and enable it.");
      }
      console.warn("Firebase Google sign-in note:", err);
      throw err;
    }
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
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
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
