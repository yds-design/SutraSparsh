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
    meaning: "Now, the sacred exposition and ongoing discipline of Yoga begins.",
    commentary: "Sage Patanjali begins with 'Atha' (Now) — signifying the readiness of the sincere seeker who has explored worldly pursuits and is now ripe for supreme self-realization.",
    metadata: {
      language: "sa",
      source: "json",
      author: "Patanjali",
      category: "Raja Yoga",
      chapter: 1,
      verse: 1,
      tags: ["yoga", "sutra", "patanjali", "discipline", "beginning"]
    }
  },
  {
    id: "yoga-sutra-1-2",
    title: "Yoga Sutra 1.2",
    subtitle: "The Core Definition of Yoga",
    body: "योगश्चित्तवृत्तिनिरोधः॥",
    transliteration: "yogaś citta-vṛtti-nirodhaḥ ||",
    meaning: "Yoga is the intentional stilling of the fluctuating modifications of the mind-stuff (consciousness).",
    commentary: "When the turbulent waves of thoughts, memories, cravings, and projections subside, consciousness returns to its pristine, mirror-like clarity.",
    metadata: {
      language: "sa",
      source: "json",
      author: "Patanjali",
      category: "Raja Yoga",
      chapter: 1,
      verse: 2,
      tags: ["yoga", "sutra", "mind", "consciousness", "meditation"]
    }
  },
  {
    id: "yoga-sutra-1-3",
    title: "Yoga Sutra 1.3",
    subtitle: "Abiding in One's True Nature",
    body: "तदा द्रष्टुः स्वरूपेऽवस्थानम्॥",
    transliteration: "tadā draṣṭuḥ svarūpe 'vasthānam ||",
    meaning: "Then the Seer (pure awareness) abides in its own true, radiant nature.",
    commentary: "Once the restless mind is stilled, you realize you are not the transient emotions or thoughts, but the eternal, luminous Witness (Drashta).",
    metadata: {
      language: "sa",
      source: "json",
      author: "Patanjali",
      category: "Raja Yoga",
      chapter: 1,
      verse: 3,
      tags: ["self-realization", "awareness", "patanjali", "yoga"]
    }
  },
  {
    id: "isha-upanishad-1",
    title: "Isha Upanishad 1",
    subtitle: "Divine All-Pervasiveness",
    body: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥",
    transliteration: "īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||",
    meaning: "All this — whatever exists in this changing universe — is enveloped by the Divine. Therefore, enjoy with renunciation; covet not anyone's wealth.",
    commentary: "Recognizing the sacred essence permeating all creation allows one to engage with the world gracefully, enjoying its gifts without greed or possessiveness.",
    metadata: {
      language: "sa",
      source: "production",
      author: "Upanishads",
      category: "Jnana / Vedanta",
      tags: ["upanishad", "vedanta", "divine", "wisdom", "renunciation"]
    }
  },
  {
    id: "katha-upanishad-1-3-14",
    title: "Katha Upanishad 1.3.14",
    subtitle: "The Call to Spiritual Awakening",
    body: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।\nक्षुरस्य धारा निशिता दुरत्यया दुर्गं पथस्तत्कवयो वदन्ति॥",
    transliteration: "uttiṣṭhata jāgrata prāpya varān nibodhata |\nkṣurasya dhārā niśitā duratyayā durgaṁ pathas tat kavayo vadanti ||",
    meaning: "Arise! Awake! Approach the enlightened masters and realize the Truth! The wise say this path is as difficult to tread as the sharp edge of a razor.",
    commentary: "The famous rallying cry immortalized by Swami Vivekananda — urging all seekers to awaken from the slumber of ignorance and pursue the highest wisdom with courageous discipline.",
    metadata: {
      language: "sa",
      source: "production",
      author: "Upanishads",
      category: "Jnana / Vedanta",
      tags: ["upanishad", "awakening", "courage", "wisdom"]
    }
  },
  {
    id: "gayatri-mantra",
    title: "Rigveda Gayatri Mantra",
    subtitle: "The Universal Prayer for Illumination",
    body: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "oṁ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṁ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ||",
    meaning: "We meditate upon the supreme effulgence of that Divine Sun, the source of all existence. May That Divine Light enlighten and guide our intellects.",
    commentary: "The venerable mother of all Vedic mantras, invoking illumination of intellect, clarity of perception, and universal harmony.",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg",
    metadata: {
      language: "sa",
      source: "json",
      author: "Vedas",
      category: "Vedic Chants",
      tags: ["mantra", "vedas", "gayatri", "chant", "light"]
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
  }

  /**
   * Retrieve a single content document by ID.
   */
  public async getById(
    id: string,
  ): Promise<DocumentData | null> {
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
  }

  /**
   * List content with optional filters
   * and text search.
   */
  public async list(
    options: ContentListOptions = {},
  ): Promise<ContentRepositoryResult> {
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
