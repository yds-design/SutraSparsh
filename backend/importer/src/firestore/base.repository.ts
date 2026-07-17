import { Firestore } from "firebase-admin/firestore";
import { firestore } from "./client.js";

export abstract class BaseRepository {
  protected readonly db: Firestore;

  constructor() {
    this.db = firestore();
  }

  protected collection(name: string) {
    return this.db.collection(name);
  }
}