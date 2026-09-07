import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase.client";
import type { JournalEntry } from "../types";

export type SyncState = "synced" | "syncing" | "offline" | "error";

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: string | null;
  pendingWrites: number;
  error: string | null;
}

export interface FirestoreBookmarkDoc {
  id: string;
  userId: string;
  verseId: string;
  verseTitle?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FirestoreJournalDoc {
  id: string;
  userId: string;
  verseId: string;
  verseTitle?: string;
  note: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CloudBackupSnapshot {
  id: string;
  userId: string;
  totalReflections: number;
  totalBookmarks: number;
  bookmarksList: string[];
  reflectionsList: JournalEntry[];
  exportedAt: string;
  platform: string;
  clientVersion: string;
}

const LOCAL_STORAGE_LAST_SYNC_KEY = "sutrasparsh_firestore_last_synced_at";

// Helper to sanitize IDs to ensure strict adherence to ^[a-zA-Z0-9_\-]+$
function sanitizeDocId(id: string): string {
  const sanitized = id.replace(/[^a-zA-Z0-9_\-]/g, "_");
  return sanitized.length > 0 ? sanitized.slice(0, 100) : `doc_${Date.now()}`;
}

export class FirestoreSyncService {
  private static instance: FirestoreSyncService;

  private status: SyncStatus = {
    state: auth.currentUser ? "synced" : "offline",
    lastSyncedAt: (() => {
      try {
        return localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY);
      } catch {
        return null;
      }
    })(),
    pendingWrites: 0,
    error: null,
  };

  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private activeUnsubscribers: Map<string, Unsubscribe> = new Map();

  private constructor() {
    // Monitor online/offline events for network awareness
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (auth.currentUser) {
          this.updateStatus({ state: "synced", error: null });
        } else {
          this.updateStatus({ state: "offline", error: null });
        }
      });
      window.addEventListener("offline", () => {
        this.updateStatus({ state: "offline", error: "Offline - working from local sanctuary cache" });
      });
    }
  }

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  /**
   * Check whether Firebase Auth user is currently active and matches requested userId
   */
  public isAuthorizedForUser(userId?: string): boolean {
    if (!auth.currentUser) return false;
    if (!userId) return true;
    const cleanUserId = sanitizeDocId(userId);
    return auth.currentUser.uid === cleanUserId;
  }

  public isCloudConnected(): boolean {
    return !!auth.currentUser && navigator.onLine;
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private updateStatus(patch: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...patch };
    if (patch.lastSyncedAt) {
      try {
        localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, patch.lastSyncedAt);
      } catch {}
    }
    this.statusListeners.forEach((l) => l(this.getStatus()));
  }

  /**
   * Subscribe to real-time Bookmarks updates from Firestore for a given user.
   * Only attaches listener if auth is ready and user is authenticated (SKILL.md rule).
   */
  public subscribeBookmarks(
    userId: string,
    onUpdated: (bookmarks: string[]) => void
  ): () => void {
    const cleanUserId = sanitizeDocId(userId);

    // Guard: Only attach onSnapshot listeners if auth is ready and user is authenticated
    if (!this.isAuthorizedForUser(cleanUserId)) {
      this.updateStatus({ state: "offline", error: null });
      return () => {};
    }

    const colPath = `users/${cleanUserId}/bookmarks`;
    const key = `bm_${cleanUserId}`;

    // Clear any previous listener for this user
    const existing = this.activeUnsubscribers.get(key);
    if (existing) {
      existing();
      this.activeUnsubscribers.delete(key);
    }

    try {
      this.updateStatus({ state: "syncing" });
      const colRef = collection(db, "users", cleanUserId, "bookmarks");
      const q = query(colRef);

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const ids: string[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as FirestoreBookmarkDoc;
            if (data && data.verseId) {
              ids.push(data.verseId);
            }
          });
          this.updateStatus({
            state: "synced",
            lastSyncedAt: new Date().toISOString(),
            error: null,
          });
          onUpdated(ids);
        },
        (error) => {
          this.updateStatus({
            state: "error",
            error: error.message || "Failed to sync bookmarks from cloud",
          });
          try {
            handleFirestoreError(error, OperationType.GET, colPath);
          } catch (e) {
            console.warn("Firestore bookmarks subscription notice:", e);
          }
        }
      );

      this.activeUnsubscribers.set(key, unsub);
      return () => {
        unsub();
        this.activeUnsubscribers.delete(key);
      };
    } catch (err) {
      this.updateStatus({
        state: "error",
        error: "Could not initialize Firestore bookmarks sync",
      });
      return () => {};
    }
  }

  /**
   * Subscribe to real-time Journal Reflections updates from Firestore for a given user.
   * Only attaches listener if auth is ready and user is authenticated (SKILL.md rule).
   */
  public subscribeJournals(
    userId: string,
    onUpdated: (journals: JournalEntry[]) => void
  ): () => void {
    const cleanUserId = sanitizeDocId(userId);

    // Guard: Only attach onSnapshot listeners if auth is ready and user is authenticated
    if (!this.isAuthorizedForUser(cleanUserId)) {
      this.updateStatus({ state: "offline", error: null });
      return () => {};
    }

    const colPath = `users/${cleanUserId}/journals`;
    const key = `jn_${cleanUserId}`;

    const existing = this.activeUnsubscribers.get(key);
    if (existing) {
      existing();
      this.activeUnsubscribers.delete(key);
    }

    try {
      this.updateStatus({ state: "syncing" });
      const colRef = collection(db, "users", cleanUserId, "journals");
      const q = query(colRef);

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const entries: JournalEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as FirestoreJournalDoc;
            if (data && data.id && data.verseId) {
              entries.push({
                id: data.id,
                verseId: data.verseId,
                verseTitle: data.verseTitle || "Sacred Verse",
                note: data.note || "",
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt,
              });
            }
          });

          // Sort reflections newest first
          entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          this.updateStatus({
            state: "synced",
            lastSyncedAt: new Date().toISOString(),
            error: null,
          });
          onUpdated(entries);
        },
        (error) => {
          this.updateStatus({
            state: "error",
            error: error.message || "Failed to sync reflections from cloud",
          });
          try {
            handleFirestoreError(error, OperationType.GET, colPath);
          } catch (e) {
            console.warn("Firestore journals subscription notice:", e);
          }
        }
      );

      this.activeUnsubscribers.set(key, unsub);
      return () => {
        unsub();
        this.activeUnsubscribers.delete(key);
      };
    } catch (err) {
      this.updateStatus({
        state: "error",
        error: "Could not initialize Firestore journals sync",
      });
      return () => {};
    }
  }

  /**
   * Save or toggle a bookmark in Firestore
   */
  public async setBookmark(
    userId: string,
    verseId: string,
    verseTitle?: string
  ): Promise<void> {
    const cleanUserId = sanitizeDocId(userId);
    if (!this.isAuthorizedForUser(cleanUserId)) return;

    const bookmarkDocId = sanitizeDocId(`bm_${verseId}`);
    const docPath = `users/${cleanUserId}/bookmarks/${bookmarkDocId}`;

    const payload: FirestoreBookmarkDoc = {
      id: bookmarkDocId,
      userId: cleanUserId,
      verseId: sanitizeDocId(verseId),
      verseTitle: (verseTitle || verseId).slice(0, 300),
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      this.updateStatus({ state: "syncing", pendingWrites: this.status.pendingWrites + 1 });
      const docRef = doc(db, "users", cleanUserId, "bookmarks", bookmarkDocId);
      await setDoc(docRef, payload, { merge: true });
      this.updateStatus({
        state: "synced",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      this.updateStatus({
        state: "error",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        error: "Failed to persist bookmark to cloud",
      });
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Remove a bookmark from Firestore
   */
  public async removeBookmark(userId: string, verseId: string): Promise<void> {
    const cleanUserId = sanitizeDocId(userId);
    if (!this.isAuthorizedForUser(cleanUserId)) return;

    const bookmarkDocId = sanitizeDocId(`bm_${verseId}`);
    const docPath = `users/${cleanUserId}/bookmarks/${bookmarkDocId}`;

    try {
      this.updateStatus({ state: "syncing", pendingWrites: this.status.pendingWrites + 1 });
      const docRef = doc(db, "users", cleanUserId, "bookmarks", bookmarkDocId);
      await deleteDoc(docRef);
      this.updateStatus({
        state: "synced",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      this.updateStatus({
        state: "error",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        error: "Failed to remove bookmark from cloud",
      });
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  /**
   * Upsert a Journal Reflection in Firestore
   */
  public async saveJournalEntry(
    userId: string,
    entry: JournalEntry
  ): Promise<void> {
    const cleanUserId = sanitizeDocId(userId);
    if (!this.isAuthorizedForUser(cleanUserId)) return;

    const cleanEntryId = sanitizeDocId(entry.id);
    const docPath = `users/${cleanUserId}/journals/${cleanEntryId}`;

    const payload: FirestoreJournalDoc = {
      id: cleanEntryId,
      userId: cleanUserId,
      verseId: sanitizeDocId(entry.verseId),
      verseTitle: (entry.verseTitle || "Sacred Scripture").slice(0, 300),
      note: entry.note.slice(0, 10000),
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      this.updateStatus({ state: "syncing", pendingWrites: this.status.pendingWrites + 1 });
      const docRef = doc(db, "users", cleanUserId, "journals", cleanEntryId);
      await setDoc(docRef, payload, { merge: true });
      this.updateStatus({
        state: "synced",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      this.updateStatus({
        state: "error",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        error: "Failed to sync reflection to cloud",
      });
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Delete a Journal Reflection from Firestore
   */
  public async deleteJournalEntry(
    userId: string,
    entryId: string
  ): Promise<void> {
    const cleanUserId = sanitizeDocId(userId);
    if (!this.isAuthorizedForUser(cleanUserId)) return;

    const cleanEntryId = sanitizeDocId(entryId);
    const docPath = `users/${cleanUserId}/journals/${cleanEntryId}`;

    try {
      this.updateStatus({ state: "syncing", pendingWrites: this.status.pendingWrites + 1 });
      const docRef = doc(db, "users", cleanUserId, "journals", cleanEntryId);
      await deleteDoc(docRef);
      this.updateStatus({
        state: "synced",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      this.updateStatus({
        state: "error",
        pendingWrites: Math.max(0, this.status.pendingWrites - 1),
        error: "Failed to delete reflection from cloud",
      });
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  /**
   * Trigger full two-way reconciliation between local storage and Firestore
   */
  public async reconcileData(
    userId: string,
    localBookmarks: string[],
    localJournals: JournalEntry[]
  ): Promise<{ bookmarks: string[]; journals: JournalEntry[] }> {
    const cleanUserId = sanitizeDocId(userId);

    // Guard: Do not attempt Firestore getDocs without active authentication
    if (!this.isAuthorizedForUser(cleanUserId)) {
      this.updateStatus({ state: "offline", error: null });
      return { bookmarks: localBookmarks, journals: localJournals };
    }

    this.updateStatus({ state: "syncing" });

    try {
      // 1. Fetch cloud bookmarks
      const bmCol = collection(db, "users", cleanUserId, "bookmarks");
      const bmSnap = await getDocs(bmCol);
      const cloudBmSet = new Set<string>();
      bmSnap.forEach((d) => {
        const data = d.data() as FirestoreBookmarkDoc;
        if (data && data.verseId) {
          cloudBmSet.add(data.verseId);
        }
      });

      // Push local-only bookmarks to cloud
      for (const localBm of localBookmarks) {
        if (!cloudBmSet.has(localBm)) {
          await this.setBookmark(cleanUserId, localBm, localBm);
          cloudBmSet.add(localBm);
        }
      }

      // 2. Fetch cloud journals
      const jnCol = collection(db, "users", cleanUserId, "journals");
      const jnSnap = await getDocs(jnCol);
      const cloudJournalsMap = new Map<string, JournalEntry>();
      jnSnap.forEach((d) => {
        const data = d.data() as FirestoreJournalDoc;
        if (data && data.id) {
          cloudJournalsMap.set(data.id, {
            id: data.id,
            verseId: data.verseId,
            verseTitle: data.verseTitle || "Sacred Scripture",
            note: data.note,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });

      // Push local-only journals to cloud
      for (const localJn of localJournals) {
        if (!cloudJournalsMap.has(localJn.id)) {
          await this.saveJournalEntry(cleanUserId, localJn);
          cloudJournalsMap.set(localJn.id, localJn);
        }
      }

      const mergedBookmarks = Array.from(cloudBmSet);
      const mergedJournals = Array.from(cloudJournalsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      this.updateStatus({
        state: "synced",
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });

      return {
        bookmarks: mergedBookmarks,
        journals: mergedJournals,
      };
    } catch (error) {
      console.warn("Reconciliation notice (falling back to local items):", error);
      this.updateStatus({
        state: "offline",
        error: "Operating in offline local cache",
      });
      return {
        bookmarks: localBookmarks,
        journals: localJournals,
      };
    }
  }

  /**
   * Save an aggregated multi-device Cloud Backup Snapshot document
   */
  public async createCloudBackupSnapshot(
    userId: string,
    bookmarks: string[],
    journals: JournalEntry[]
  ): Promise<CloudBackupSnapshot> {
    const cleanUserId = sanitizeDocId(userId);
    const docPath = `users/${cleanUserId}/preferences/cloud_snapshot`;

    const snapshot: CloudBackupSnapshot = {
      id: `backup_${Date.now()}`,
      userId: cleanUserId,
      totalReflections: journals.length,
      totalBookmarks: bookmarks.length,
      bookmarksList: bookmarks,
      reflectionsList: journals,
      exportedAt: new Date().toISOString(),
      platform: "web",
      clientVersion: "1.0.0",
    };

    if (!this.isAuthorizedForUser(cleanUserId)) {
      return snapshot;
    }

    try {
      this.updateStatus({ state: "syncing" });
      const docRef = doc(db, "users", cleanUserId, "preferences", "cloud_snapshot");
      await setDoc(docRef, {
        userId: cleanUserId,
        tanpuraDroneEnabled: true,
        dronePitch: "C#",
        devanagariFontScale: "medium",
        theme: "dark-sacred",
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      this.updateStatus({
        state: "synced",
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
      return snapshot;
    } catch (error) {
      this.updateStatus({ state: "error", error: "Failed to persist cloud snapshot" });
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  public cleanup(): void {
    this.activeUnsubscribers.forEach((unsub) => unsub());
    this.activeUnsubscribers.clear();
  }
}

export const firestoreSyncService = FirestoreSyncService.getInstance();
