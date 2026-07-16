import { Firestore, getFirestore } from "firebase-admin/firestore";
import { initializeFirebase } from "../config/firebase.js";

let db: Firestore;

export function firestore(): Firestore {
  if (db) {
    return db;
  }

  initializeFirebase();

  db = getFirestore();

  return db;
}