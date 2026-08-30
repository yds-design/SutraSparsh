import {
  getFirestore,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore";

import { initializeFirebase } from "../../config/firebase.js";
import { searchEngine } from "../../services/search-engine.service.js";
import { globalCache } from "../../services/cache.service.js";
import type { ContentItem } from "../../types.js";

export interface ContentListOptions {
  language?: string;
  source?: string;
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContentRepositoryResult {
  items: DocumentData[];
  total: number;
}

const DEFAULT_SPIRITUAL_CONTENT: DocumentData[] = [
  {
    id: "gita-2-47",
    title: "Bhagavad Gita 2.47",
    subtitle: "The Law of Selfless Action (Nishkama Karma)",
    body: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stvakarmaṇi ||",
    meaning: "You have a right only to perform your prescribed duties, but you are never entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to inaction.",
    commentary: "Lord Krishna counsels Arjuna that true freedom and peace of mind arise from dedicating oneself wholeheartedly to righteous duty without anxiety or craving for outcomes.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Bhagavad Gita",
      category: "Karma Yoga",
      chapter: 2,
      verse: 47,
      tags: ["karma", "gita", "duty", "wisdom", "detachment"]
    }
  },
  {
    id: "gita-2-48",
    title: "Bhagavad Gita 2.48",
    subtitle: "Equanimity is Yoga (Samatvam Yoga Ucyate)",
    body: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    transliteration: "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya |\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate ||",
    meaning: "Perform your duty with an even mind, O Arjuna, abandoning all attachment to success or failure. Such equanimity of mind is called Yoga.",
    commentary: "Yoga is not merely physical posture; it is an unshakeable poise in the midst of life's dualities — joy and sorrow, triumph and defeat.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Bhagavad Gita",
      category: "Karma Yoga",
      chapter: 2,
      verse: 48,
      tags: ["yoga", "equanimity", "gita", "peace"]
    }
  },
  {
    id: "gita-2-62",
    title: "Bhagavad Gita 2.62",
    subtitle: "The Genesis of Desire and Mental Turmoil",
    body: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    transliteration: "dhyāyato viṣayān puṁsaḥ saṅgas teṣūpajāyate |\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho 'bhijāyate ||",
    meaning: "While contemplating the objects of the senses, a person develops attachment for them; from attachment desire arises, and from desire anger is born.",
    commentary: "Krishna analyzes the subtle psychological chain reaction: dwelling on sense objects leads to craving, and unfulfilled craving inevitably spawns anger.",
    metadata: {
      language: "sa",
      source: "production",
      author: "Bhagavad Gita",
      category: "Mind & Meditation",
      chapter: 2,
      verse: 62,
      tags: ["mind", "desire", "psychology", "gita"]
    }
  },
  {
    id: "gita-6-5",
    title: "Bhagavad Gita 6.5",
    subtitle: "Self-Mastery and Inner Upliftment",
    body: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    transliteration: "uddhared ātmanātmānaṁ nātmānam avasādayet |\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ ||",
    meaning: "Let a person elevate themselves by their own mind, and not degrade themselves. For the mind is the friend of the conditioned soul, and the mind is indeed the enemy.",
    commentary: "Your greatest ally or your fiercest opponent resides within your own psyche. A disciplined mind elevates; an undisciplined mind drags you down.",
    metadata: {
      language: "sa",
      source: "production",
      author: "Bhagavad Gita",
      category: "Dhyana Yoga",
      chapter: 6,
      verse: 5,
      tags: ["self-mastery", "meditation", "mind", "strength"]
    }
  },
  {
    id: "yoga-sutra-1-1",
    title: "Yoga Sutra 1.1",
    subtitle: "The Auspicious Commencement",
    body: "अथ योगानुशासनम्॥",
    transliteration: "atha yogānuśāsanam ||",
    meaning: "Now, the sacred exposition and discipline of Yoga commences.",
    commentary: "Patanjali begins the monumental Yoga Sutras with the word 'Atha' (Now), signaling readiness for supreme inner transformation.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Patanjali",
      category: "Raja Yoga",
      chapter: 1,
      verse: 1,
      tags: ["patanjali", "yoga", "sutra", "discipline", "mind"]
    }
  },
  {
    id: "yoga-sutra-1-2",
    title: "Yoga Sutra 1.2",
    subtitle: "The Definition of Yoga",
    body: "योगश्चित्तवृत्तिनिरोधः॥",
    transliteration: "yogaś citta-vṛtti-nirodhaḥ ||",
    meaning: "Yoga is the intentional stilling and mastery of the whirlpools of the mind (fluctuations of consciousness).",
    commentary: "The ultimate purpose of Yoga is not mere physical exercise, but cultivating the profound stillness wherein the true Self (Purusha) shines undisturbed.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Patanjali",
      category: "Mind & Meditation",
      chapter: 1,
      verse: 2,
      tags: ["yoga", "citta", "mind", "meditation", "patanjali"]
    }
  },
  {
    id: "upanishad-isa-1",
    title: "Isha Upanishad 1",
    subtitle: "All this is Enveloped by the Divine",
    body: "ईशा वास्यमिदँ सर्वं यत्किञ्च जगत्यां जगत्।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥",
    transliteration: "īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||",
    meaning: "All this — whatsoever exists in this transient universe — is enveloped by the Divine. Enjoy life through renunciation and detachment; do not covet anyone's wealth.",
    commentary: "The foundational verse of the Isha Upanishad teaches that everything belongs to Brahman; live in gratitude without greed or possessiveness.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Upanishads",
      category: "Jnana / Vedanta",
      chapter: 1,
      verse: 1,
      tags: ["upanishad", "vedanta", "detachment", "brahman", "ishavasya"]
    }
  },
  {
    id: "upanishad-mandukya-om",
    title: "Mandukya Upanishad 1.1",
    subtitle: "The Sacred Syllable OM",
    body: "ओमित्येतदक्षरमिदँ सर्वं तस्योपव्याख्यानं भूतं भवद् भविष्यदिति सर्वमोङ्कार एव।\nयच्चान्यत् त्रिकालातीतं तदप्योङ्कार एव॥",
    transliteration: "om ity etad akṣaram idaṁ sarvaṁ tasyopavyākhyānaṁ bhūtaṁ bhavad bhaviṣyad iti sarvam oṅkāra eva |\nyac cānyat trikālātītaṁ tad apy oṅkāra eva ||",
    meaning: "OM, this eternal syllable, is all that exists. All that was, all that is, and all that shall be is indeed OM. Whatever transcends the three divisions of time is also OM.",
    commentary: "The Mandukya Upanishad explores the four states of consciousness (Waking, Dreaming, Deep Sleep, and Turiya - Pure Awareness) through the vibration of Pranava OM.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Upanishads",
      category: "Jnana / Vedanta",
      tags: ["om", "mandukya", "consciousness", "vedanta", "meditation"]
    }
  },
  {
    id: "gayatri-mantra",
    title: "Gayatri Mantra (Rigveda 3.62.10)",
    subtitle: "The Solar Invocation of Divine Illumination",
    body: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "oṁ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṁ\nbhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ||",
    meaning: "We meditate upon the supreme, radiant splendor of the Divine Solar Illuminator (Savitur). May that Divine Light awaken and inspire our intellect and inner vision.",
    commentary: "The supreme Vedic mantra invoking illumination, wisdom, and spiritual awakening across the three planes of existence.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Vedas",
      category: "Vedic Chants",
      tags: ["mantra", "vedas", "rigveda", "gayatri", "light", "wisdom"]
    }
  },
  {
    id: "maha-mrityunjaya",
    title: "Maha Mrityunjaya Mantra",
    subtitle: "The Great Death-Conquering & Healing Mantra",
    body: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥",
    transliteration: "oṁ tryambakaṁ yajāmahe sugandhiṁ puṣṭi-vardhanam |\nurvārukam iva bandhanān mṛtyor mukṣīya māmṛtāt ||",
    meaning: "We worship the Three-Eyed Lord (Shiva), the fragrant nourisher of all beings. As a ripe cucumber is severed from its stalk effortlessly, so may we be liberated from the bondage of death and mortality into Immortality.",
    commentary: "A profound healing chant for inner rejuvenation, liberation from fear, and transcendence of mortal limitations.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Vedas",
      category: "Vedic Chants",
      tags: ["mantra", "vedas", "healing", "shiva", "liberation"]
    }
  }
];

export class ContentRepository {
  private readonly db: Firestore | null = null;
  private readonly collectionName = "content";
  private inMemoryStore: DocumentData[] = [...DEFAULT_SPIRITUAL_CONTENT];

  constructor() {
    try {
      const app = initializeFirebase();
      if (app) {
        this.db = getFirestore(app);
      }
    } catch (e) {
      console.warn("Firestore not available in ContentRepository; using in-memory spiritual catalog.");
    }

    // Initialize search engine index
    searchEngine.indexAll(this.inMemoryStore as unknown as ContentItem[]);
  }

  /**
   * Retrieve all content items.
   */
  public async findAll(): Promise<ContentItem[]> {
    const result = await this.list({ limit: 1000 });
    return result.items as unknown as ContentItem[];
  }

  /**
   * Retrieve a single content document by ID with caching.
   */
  public async getById(
    id: string,
  ): Promise<DocumentData | null> {
    const cacheKey = `content:${id}`;
    return globalCache.getOrCompute(cacheKey, async () => {
      if (this.db) {
        try {
          const document = await this.db
            .collection(this.collectionName)
            .doc(id)
            .get();

          if (document.exists) {
            return {
              id: document.id,
              ...document.data(),
            };
          }
        } catch (err) {
          console.warn("Firestore getById query failed, checking in-memory store:", err);
        }
      }

      const item = this.inMemoryStore.find((doc) => doc.id === id);
      return item ? { ...item } : null;
    }, 60 * 1000);
  }

  /**
   * List content with optional filters, high-performance search engine, and pagination.
   */
  public async list(
    options: ContentListOptions = {},
  ): Promise<ContentRepositoryResult> {
    // If search term is present and no complex database filters, use high-speed inverted index
    if (options.search && options.search.trim().length > 0 && !this.db) {
      const searchRes = searchEngine.search(options.search, 100);
      let items = searchRes.items as unknown as DocumentData[];

      if (options.category) {
        const cat = options.category.toLowerCase();
        items = items.filter((item) =>
          item.metadata?.category?.toLowerCase() === cat
        );
      }

      if (options.language) {
        const lang = options.language.toLowerCase();
        items = items.filter((item) =>
          item.metadata?.language?.toLowerCase() === lang
        );
      }

      return {
        items,
        total: items.length,
      };
    }

    if (this.db) {
      try {
        let query: FirebaseFirestore.Query = this.db.collection(this.collectionName);

        if (options.language) {
          query = query.where("metadata.language", "==", options.language);
        }

        if (options.source) {
          query = query.where("metadata.source", "==", options.source);
        }

        if (options.category) {
          query = query.where("metadata.category", "==", options.category);
        }

        if (options.tag) {
          query = query.where("metadata.tags", "array-contains", options.tag);
        }

        const snapshot = await query.get();

        if (!snapshot.empty) {
          let items: DocumentData[] = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          if (options.search) {
            const search = options.search.trim().toLowerCase();
            if (search.length > 0) {
              items = items.filter((item) => this.matchesSearch(item, search));
            }
          }

          return {
            items,
            total: items.length,
          };
        }
      } catch (err) {
        console.warn("Firestore list query failed, using in-memory store:", err);
      }
    }

    // Fallback in-memory querying
    let items = [...this.inMemoryStore];

    if (options.language) {
      const lang = options.language.toLowerCase();
      items = items.filter((item) =>
        item.metadata?.language?.toLowerCase() === lang
      );
    }

    if (options.source) {
      const src = options.source.toLowerCase();
      items = items.filter((item) =>
        item.metadata?.source?.toLowerCase() === src
      );
    }

    if (options.category) {
      const cat = options.category.toLowerCase();
      items = items.filter((item) =>
        item.metadata?.category?.toLowerCase() === cat
      );
    }

    if (options.tag) {
      const tag = options.tag.toLowerCase();
      items = items.filter((item) =>
        Array.isArray(item.metadata?.tags) &&
        item.metadata.tags.some((t: string) => t.toLowerCase() === tag)
      );
    }

    if (options.search) {
      const search = options.search.trim().toLowerCase();
      if (search.length > 0) {
        items = items.filter((item) => this.matchesSearch(item, search));
      }
    }

    return {
      items,
      total: items.length,
    };
  }

  /**
   * Create a new spiritual scripture / verse.
   */
  public async create(data: DocumentData): Promise<DocumentData> {
    const id = data.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: DocumentData = {
      ...data,
      id,
      metadata: {
        language: "sa",
        source: "admin-publisher",
        category: "General",
        tags: [],
        ...(data.metadata || {}),
        createdAt: new Date().toISOString(),
      },
    };

    if (this.db) {
      try {
        await this.db.collection(this.collectionName).doc(id).set(newItem);
      } catch (err) {
        console.warn("Firestore create failed, saving to in-memory store:", err);
      }
    }

    // Insert at beginning of in-memory store
    this.inMemoryStore.unshift(newItem);
    searchEngine.indexItem(newItem as unknown as ContentItem);
    globalCache.invalidate("content");

    return newItem;
  }

  /**
   * Update an existing scripture / verse by ID.
   */
  public async update(
    id: string,
    updates: Partial<DocumentData>
  ): Promise<DocumentData | null> {
    let existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const updatedItem: DocumentData = {
      ...existing,
      ...updates,
      id,
      metadata: {
        ...(existing.metadata || {}),
        ...(updates.metadata || {}),
        updatedAt: new Date().toISOString(),
      },
    };

    if (this.db) {
      try {
        await this.db.collection(this.collectionName).doc(id).set(updatedItem, { merge: true });
      } catch (err) {
        console.warn("Firestore update failed, updating in-memory store:", err);
      }
    }

    const idx = this.inMemoryStore.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.inMemoryStore[idx] = updatedItem;
    } else {
      this.inMemoryStore.unshift(updatedItem);
    }

    searchEngine.indexAll(this.inMemoryStore as unknown as ContentItem[]);
    globalCache.invalidate("content");

    return updatedItem;
  }

  /**
   * Delete a scripture / verse by ID.
   */
  public async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) {
      return false;
    }

    if (this.db) {
      try {
        await this.db.collection(this.collectionName).doc(id).delete();
      } catch (err) {
        console.warn("Firestore delete failed:", err);
      }
    }

    this.inMemoryStore = this.inMemoryStore.filter((i) => i.id !== id);
    searchEngine.indexAll(this.inMemoryStore as unknown as ContentItem[]);
    globalCache.invalidate("content");
    return true;
  }

  /**
   * Get complete corpus for export.
   */
  public async getAll(): Promise<DocumentData[]> {
    if (this.db) {
      try {
        const snapshot = await this.db.collection(this.collectionName).get();
        if (!snapshot.empty) {
          return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn("Firestore getAll failed, returning in-memory store:", err);
      }
    }

    return [...this.inMemoryStore];
  }

  private matchesSearch(
    item: DocumentData,
    search: string,
  ): boolean {
    const title = typeof item.title === "string" ? item.title.toLowerCase() : "";
    const subtitle = typeof item.subtitle === "string" ? item.subtitle.toLowerCase() : "";
    const body = typeof item.body === "string" ? item.body.toLowerCase() : "";
    const meaning = typeof item.meaning === "string" ? item.meaning.toLowerCase() : "";
    const transliteration = typeof item.transliteration === "string" ? item.transliteration.toLowerCase() : "";
    const author = typeof item.metadata?.author === "string" ? item.metadata.author.toLowerCase() : "";
    const category = typeof item.metadata?.category === "string" ? item.metadata.category.toLowerCase() : "";

    return (
      title.includes(search) ||
      subtitle.includes(search) ||
      body.includes(search) ||
      meaning.includes(search) ||
      transliteration.includes(search) ||
      author.includes(search) ||
      category.includes(search)
    );
  }
}
