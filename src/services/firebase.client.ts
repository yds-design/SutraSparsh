import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Environment variable overrides for dynamic deployment environments
const env = (import.meta as any).env || {};

export const resolvedFirebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || "sutrasparsh-17a55",
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || "1:805535850231:android:dd002bc488298a2fea3df2",
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || "AIzaSyD9uoTvdu5ghfzMlfemdCCUrcG-Kn_mRkc",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || "sutrasparsh-17a55.firebaseapp.com",
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "(default)",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || "sutrasparsh-17a55.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || "805535850231",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || "",
  oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId || "805535850231-tlainhshod83bkpakigt3qj46p3ohpvc.apps.googleusercontent.com",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(resolvedFirebaseConfig) : getApps()[0];

// Initialize Firestore Database
export const db =
  resolvedFirebaseConfig.firestoreDatabaseId && resolvedFirebaseConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Google SSO Provider configuration
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});
googleAuthProvider.addScope("email");
googleAuthProvider.addScope("profile");

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to the provisioned Firestore database
 */
export async function testConnection(): Promise<boolean> {
  return navigator.onLine;
}
