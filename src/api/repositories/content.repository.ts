import {
  getFirestore,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore";

import { initializeFirebase } from "../../config/firebase.js";

export interface ContentListOptions {
  language?: string;
  source?: string;
  category?: string;
  tag?: string;
  search?: string;
}

export interface ContentRepositoryResult {
  items: DocumentData[];
  total: number;
}

export class ContentRepository {
  private readonly db: Firestore;

  private readonly collectionName =
    "content";

  constructor() {
    initializeFirebase();

    this.db = getFirestore();
  }

  /**
   * Retrieve a single content document by ID.
   */
  public async getById(
    id: string,
  ): Promise<DocumentData | null> {
    const document =
      await this.db
        .collection(
          this.collectionName,
        )
        .doc(id)
        .get();

    if (!document.exists) {
      return null;
    }

    return {
      id: document.id,
      ...document.data(),
    };
  }

  /**
   * List content with optional filters
   * and text search.
   */
  public async list(
    options: ContentListOptions = {},
  ): Promise<ContentRepositoryResult> {
    let query:
      FirebaseFirestore.Query =
      this.db.collection(
        this.collectionName,
      );

    if (options.language) {
      query = query.where(
        "metadata.language",
        "==",
        options.language,
      );
    }

    if (options.source) {
      query = query.where(
        "metadata.source",
        "==",
        options.source,
      );
    }

    if (options.category) {
      query = query.where(
        "metadata.category",
        "==",
        options.category,
      );
    }

    if (options.tag) {
      query = query.where(
        "metadata.tags",
        "array-contains",
        options.tag,
      );
    }

    const snapshot =
      await query.get();

    let items: DocumentData[] =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        }),
      );

    if (options.search) {
      const search =
        options.search
          .trim()
          .toLowerCase();

      if (search.length > 0) {
        items = items.filter(
          (item) =>
            this.matchesSearch(
              item,
              search,
            ),
        );
      }
    }

    return {
      items,
      total: items.length,
    };
  }

  private matchesSearch(
    item: DocumentData,
    search: string,
  ): boolean {
    const title =
      typeof item.title ===
      "string"
        ? item.title.toLowerCase()
        : "";

    const body =
      typeof item.body ===
      "string"
        ? item.body.toLowerCase()
        : "";

    return (
      title.includes(search) ||
      body.includes(search)
    );
  }
}