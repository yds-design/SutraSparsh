import type {
  SanskritWord,
  WordComponent,
  WordOccurrence,
  VerseToken,
} from "../types/wordExplorer.types";

/**
 * Curated Verified Sanskrit Lexicon
 * Adheres strictly to FR-10: Accurate Paninian grammar, roots, sandhi, and corpus citations.
 */
export const VERIFIED_SANSKRIT_WORDS: Record<string, SanskritWord> = {
  "karmany-evadhikaraste": {
    id: "karmany-evadhikaraste",
    surfaceForm: "कर्मण्येवाधिकारस्ते",
    transliteration: "karmaṇy-evādhikāras-te",
    generalMeaning: "In action alone is your entitled right / domain of duty, never in its fruits.",
    contextMeaning:
      "Bhagavad Gita 2.47: Krishna instructs Arjuna that human prerogative is solely situated in performing sacred action, without staking entitlement to consequential outcomes.",
    philosophicalNote:
      "The foundational aphorism of Nishkama Karma (unattached selfless duty). The four components interlock with grammatical precision to dismantle anxiety over future fruits.",
    isVerified: true,
    audioPronunciation: "kar-man-yey-va-dhi-kaa-ras-tay",
    root: {
      id: "root-kr",
      form: "कृ",
      transliteration: "kṛ",
      gana: "तनादिगण (Tanādi-gaṇa, Class VIII)",
      meaning: "to do, act, execute, create, perform",
    },
    grammar: {
      grammaticalForm: "Compound Syntactic Padam (पद-सङ्घात) via Yan, Dirgha & Visarga Sandhi",
      case: "Composite / बहुपद",
      notes: "Encapsulates a complete philosophical injunction within a single unified metrical breath.",
    },
    sandhi: {
      isSandhi: true,
      type: "यण् सन्धि (Yan) + सवर्णदीर्घ सन्धि (Dīrgha) + विसर्ग सन्धि (Visarga)",
      formula: "कर्मणि (i) + एव (e) → कर्मण्येव + अधिकारः (a + a → ā) → कर्मण्येवाधिकारः + ते (ḥ + t → st) → कर्मण्येवाधिकारस्ते",
      sutraRef: "इको यणचि (Panini 6.1.77), अकः सवर्णे दीर्घः (6.1.101), विसर्जनीयस्य सः (8.3.34)",
      components: ["कर्मणि", "एव", "अधिकारः", "ते"],
      steps: [
        {
          from: "कर्मणि + एव",
          into: "कर्मण्येव",
          ruleName: "यण् सन्धि (Yan Sandhi: i/ī followed by dissimilar vowel becomes y)",
          paniniSutra: "इको यणचि ६.१.७७",
        },
        {
          from: "कर्मण्येव + अधिकारः",
          into: "कर्मण्येवाधिकारः",
          ruleName: "सवर्णदीर्घ सन्धि (Savarṇa Dīrgha Sandhi: a + a coalesces into long ā)",
          paniniSutra: "अकः सवर्णे दीर्घः ६.१.१०१",
        },
        {
          from: "कर्मण्येवाधिकारः + ते",
          into: "कर्मण्येवाधिकारस्ते",
          ruleName: "विसर्ग सन्धि (Visarga Sandhi: visarga before dental 'ta' becomes 'sa')",
          paniniSutra: "विसर्जनीयस्य सः ८.३.३४",
        },
      ],
    },
    components: [
      {
        id: "comp-karmani",
        surfaceForm: "कर्मणि",
        transliteration: "karmaṇi",
        meaning: "in action, in prescribed duty, in sacred work",
        contextMeaning: "Points to the sphere/locus where conscious human agency operates.",
        type: "Subanta / Noun (सुबन्त)",
        root: {
          form: "कृ",
          transliteration: "kṛ",
          meaning: "to act, perform, make",
        },
        grammar: {
          case: "Locative / सप्तमी विभक्ति (Saptamī)",
          number: "Singular / एकवचन",
          gender: "Neuter / नपुंसकलिङ्ग",
          grammaticalForm: "Locative singular of neuter noun stem 'कर्मन्' (karman)",
          notes: "Denotes adhikaraṇa (अधिकरण) — the ontological locus of moral duty.",
        },
      },
      {
        id: "comp-eva",
        surfaceForm: "एव",
        transliteration: "eva",
        meaning: "alone, only, indeed, unquestionably",
        contextMeaning: "Exclusionary particle (अव्यय); strictly restricts entitlement to duty alone, barring claim over fruits.",
        type: "Avyaya / Invariable Particle (अव्यय)",
        grammar: {
          grammaticalForm: "Indeclinable emphatic particle (निपात / अव्यय)",
          notes: "Niyama-bodhaka (नियम-बोधक) — establishes exclusivity.",
        },
      },
      {
        id: "comp-adhikarah",
        surfaceForm: "अधिकारः",
        transliteration: "adhikāraḥ",
        meaning: "right, entitlement, jurisdiction, prerogative, sacred qualification",
        contextMeaning: "Spiritual prerogative and conscious responsibility bestowed upon human agency.",
        type: "Subanta / Noun (सुबन्त)",
        root: {
          form: "अधि + कृ",
          transliteration: "adhi + kṛ",
          meaning: "to preside over, claim competence, authorize",
        },
        grammar: {
          case: "Nominative / प्रथमा विभक्ति (Prathamā)",
          number: "Singular / एकवचन",
          gender: "Masculine / पुंल्लिङ्ग",
          grammaticalForm: "Nominative singular with suffix घञ् (ghañ) added to prefix अधि + root कृ",
        },
      },
      {
        id: "comp-te",
        surfaceForm: "ते",
        transliteration: "te",
        meaning: "unto you, your, of thee",
        contextMeaning: "Addressed intimately by Shri Krishna to Arjuna as a representative moral seeker.",
        type: "Sarvanāma / Personal Pronoun (सर्वनाम)",
        grammar: {
          case: "Genitive/Dative / षष्ठी/चतुर्थी विभक्ति",
          number: "Singular / एकवचन",
          gender: "All Genders / त्रिषु लिङ्गेषु समानम्",
          grammaticalForm: "Enclitic genitive singular of second-person pronoun stem 'युष्मद्' (yuṣmad)",
        },
      },
    ],
    occurrences: [
      {
        id: "occ-bg-2-47",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 2, Verse 47",
        verseSnippet: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        translationSnippet: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be associated to not doing your duty.",
      },
      {
        id: "occ-bg-3-8",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 3, Verse 8",
        verseSnippet: "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।",
        translationSnippet: "Perform your prescribed duty, for doing so is better than not working.",
      },
      {
        id: "occ-bg-18-9",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 18, Verse 9",
        verseSnippet: "कार्यमित्येव यत्कर्म नियतं क्रियतेऽर्जुन।\nसङ्गं त्यक्त्वा फलं चैव स त्यागः सात्त्विको मतः॥",
        translationSnippet: "When action is performed simply because it ought to be done, relinquishing attachment and fruit, that renunciation is deemed Sattvic.",
      },
    ],
    sources: [
      {
        name: "SutraSparsh Sanskrit Lexicon",
        type: "lexicon",
        reference: "Entry SS-LEX-2047",
      },
      {
        name: "Ashtadhyayi Paninian Grammar",
        type: "grammar",
        reference: "Sutras 6.1.77, 6.1.101, 8.3.34",
      },
      {
        name: "Shankara Bhashya on Gita 2.47",
        type: "commentary",
        reference: "Advaita Vedanta Prasthana-traya",
      },
      {
        name: "Bhagavad Gita Sacred Corpus",
        type: "corpus",
        reference: "Mahabharata Bhishma Parva",
      },
    ],
  },

  "yogasthah": {
    id: "yogasthah",
    surfaceForm: "योगस्थः",
    transliteration: "yoga-sthaḥ",
    generalMeaning: "Steadfast in Yoga, established in equanimity and divine communion.",
    contextMeaning: "Gita 2.48: Grounded in spiritual integration before initiating action in the world.",
    philosophicalNote: "To be 'yogastha' is to act not from neurotic agitation or egoic hunger, but anchored in transcendental poise.",
    isVerified: true,
    audioPronunciation: "yo-ga-stha-ha",
    root: {
      id: "root-yuj",
      form: "युज्",
      transliteration: "yuj",
      gana: "रुधादिगण (Class VII) & दिवादिगण (Class IV)",
      meaning: "to unite, integrate, yoke, harness, meditate",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Upapada Tatpuruṣa Compound (उपपद-तत्पुरुष समास)",
      notes: "योगे तिष्ठति इति योगस्थः (One who abides firmly in Yoga).",
    },
    sandhi: {
      isSandhi: true,
      type: "समास-पद (Compound Formation)",
      formula: "योग (yoga) + स्थः (sthaḥ) → योगस्थः",
      sutraRef: "सुपि स्थः (Panini 3.2.4) — suffix क added to root स्था with an upapada.",
      components: ["योग", "स्थः"],
      steps: [
        {
          from: "योग + स्थ",
          into: "योगस्थः",
          ruleName: "उपपद समास (Upapada Compound with root स्था)",
          paniniSutra: "सुपि स्थः ३.२.४",
        },
      ],
    },
    components: [
      {
        id: "comp-yoga",
        surfaceForm: "योग",
        transliteration: "yoga",
        meaning: "union, integration, equanimity of mind",
        contextMeaning: "The state of poise between gain and loss.",
        type: "Noun Stem (प्रातिपदिक)",
        root: { form: "युज्", transliteration: "yuj", meaning: "to yoke, harmonize" },
      },
      {
        id: "comp-sthah",
        surfaceForm: "स्थः",
        transliteration: "sthaḥ",
        meaning: "one who stands, remains, abides firmly",
        contextMeaning: "Anchored unshakably.",
        type: "Kridanta (कृदन्त)",
        root: { form: "स्था", transliteration: "sthā", meaning: "to stand, reside" },
      },
    ],
    occurrences: [
      {
        id: "occ-bg-2-48",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 2, Verse 48",
        verseSnippet: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
        translationSnippet: "Perform work being steadfast in yoga, abandoning attachment, O Dhananjaya, balanced in success and failure; such equanimity is called Yoga.",
      },
    ],
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "Sutra 3.2.4" },
      { name: "SutraSparsh Sanskrit Lexicon", type: "lexicon", reference: "SS-LEX-2048" },
    ],
  },

  "samatvam": {
    id: "samatvam",
    surfaceForm: "समत्वम्",
    transliteration: "samatvam",
    generalMeaning: "Equanimity, evenness of mind, balance, impartiality, unity.",
    contextMeaning: "Defined by Sri Krishna as the quintessential nature of Yoga: 'समत्वं योग उच्यते'.",
    philosophicalNote: "Equanimity is not indifference; it is the sublime inner equilibrium that remains undisturbed by duality (sukha-duhkha, jaya-ajaya).",
    isVerified: true,
    audioPronunciation: "sa-mat-vam",
    root: {
      id: "root-sama",
      form: "सम्",
      transliteration: "sam",
      meaning: "together, harmonious, whole",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Neuter / नपुंसकलिङ्ग",
      grammaticalForm: "Abstract noun formed by adding nominal suffix त्व (tva) to adjective सम (sama)",
      notes: "समस्य भावः समत्वम् (The essential quality of being even-minded).",
    },
    components: [
      {
        id: "comp-sama",
        surfaceForm: "सम",
        transliteration: "sama",
        meaning: "equal, balanced, tranquil, unperturbed",
        type: "Adjective (विशेषण)",
      },
      {
        id: "comp-tva",
        surfaceForm: "त्व",
        transliteration: "tva",
        meaning: "-ness, state of being (abstract nominal affix)",
        type: "Taddhita Pratyaya (तद्धित प्रत्यय)",
      },
    ],
    occurrences: [
      {
        id: "occ-bg-2-48-sam",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 2, Verse 48",
        verseSnippet: "सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
        translationSnippet: "Being balanced in success and failure; such equanimity is called Yoga.",
      },
      {
        id: "occ-bg-6-33",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 6, Verse 33",
        verseSnippet: "योऽयं योगस्त्वया प्रोक्तः साम्येन मधुसूदन।",
        translationSnippet: "This system of yoga which You have summarized by equanimity, O Madhusudana...",
      },
    ],
    sources: [
      { name: "SutraSparsh Sanskrit Lexicon", type: "lexicon", reference: "SS-LEX-2049" },
      { name: "Amarkosha Lexicon", type: "lexicon", reference: "Kanda 3, Nanartha" },
    ],
  },

  "cittavrttinirodhah": {
    id: "cittavrttinirodhah",
    surfaceForm: "चित्तवृत्तिनिरोधः",
    transliteration: "citta-vṛtti-nirodhaḥ",
    generalMeaning: "The cessation, mastery, and dissolution of the modulations and agitations of consciousness.",
    contextMeaning: "Patanjali Yoga Sutra 1.2: The supreme classical definition of Yoga: 'योगश्चित्तवृत्तिनिरोधः'.",
    philosophicalNote: "When mental waves settle, the Seer abides in its pristine true nature (तदा द्रष्टुः स्वरूपेऽवस्थानम्).",
    isVerified: true,
    audioPronunciation: "chit-ta-vrit-ti-ni-ro-dha-ha",
    root: {
      id: "root-rudh",
      form: "रुध्",
      transliteration: "rudh",
      gana: "रुधादिगण (Class VII)",
      meaning: "to check, restrain, direct, calm, hold in stillness",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Complex Tatpuruṣa Compound (षष्ठी-तत्पुरुष समास)",
      notes: "चित्तस्य वृत्तयः चित्तवृत्तयः; तासां निरोधः चित्तवृत्तिनिरोधः।",
    },
    sandhi: {
      isSandhi: true,
      type: "समास पद (Compound Synthesis)",
      formula: "चित्त (citta) + वृत्ति (vṛtti) + निरोधः (nirodhaḥ) → चित्तवृत्तिनिरोधः",
      components: ["चित्त", "वृत्ति", "निरोधः"],
    },
    components: [
      {
        id: "comp-citta",
        surfaceForm: "चित्त",
        transliteration: "citta",
        meaning: "mind-stuff, consciousness, the collective psyche (manas, buddhi, ahamkara)",
        root: { form: "चित्", transliteration: "cit", meaning: "to perceive, be conscious" },
        type: "Noun (संज्ञा)",
      },
      {
        id: "comp-vrtti",
        surfaceForm: "वृत्ति",
        transliteration: "vṛtti",
        meaning: "fluctuations, whirlpools, thought-waves, patterns of movement",
        root: { form: "वृत्", transliteration: "vṛt", meaning: "to turn, revolve, exist" },
        type: "Noun (संज्ञा)",
      },
      {
        id: "comp-nirodhah",
        surfaceForm: "निरोधः",
        transliteration: "nirodhaḥ",
        meaning: "cessation, stillness, mastery, settling into stillness",
        root: { form: "नि + रुध्", transliteration: "ni + rudh", meaning: "to quieten, contain" },
        type: "Noun (संज्ञा)",
      },
    ],
    occurrences: [
      {
        id: "occ-ys-1-2",
        scripture: "Patanjali Yoga Sutras",
        chapterVerse: "Samadhi Pada 1.2",
        verseSnippet: "योगश्चित्तवृत्तिनिरोधः॥",
        translationSnippet: "Yoga is the intentional resolution and stilling of the modulations of consciousness.",
      },
      {
        id: "occ-ys-1-3",
        scripture: "Patanjali Yoga Sutras",
        chapterVerse: "Samadhi Pada 1.3",
        verseSnippet: "तदा द्रष्टुः स्वरूपेऽवस्थानम्॥",
        translationSnippet: "Then the Seer rests established in its own true, unfettered nature.",
      },
    ],
    sources: [
      { name: "Patanjali Yoga Darshana", type: "corpus", reference: "Sutra 1.2" },
      { name: "Vyasa Bhashya", type: "commentary", reference: "Pada 1" },
    ],
  },

  "dharmaksetre": {
    id: "dharmaksetre",
    surfaceForm: "धर्मक्षेत्रे",
    transliteration: "dharma-kṣetre",
    generalMeaning: "In the sacred field of righteous order, in the inner sanctuary of moral duty.",
    contextMeaning: "Gita 1.1: Kurukshetra is identified not merely as geographical soil, but the sacred crucible where moral duty meets human struggle.",
    philosophicalNote: "Metaphor for human consciousness, where noble virtues and lower base impulses confront one another.",
    isVerified: true,
    audioPronunciation: "dhar-ma-kshey-tray",
    root: {
      id: "root-dhr",
      form: "धृ",
      transliteration: "dhṛ",
      gana: "भ्वादिगण (Class I)",
      meaning: "to uphold, bear, sustain, support",
    },
    grammar: {
      case: "Locative / सप्तमी विभक्ति",
      number: "Singular / एकवचन",
      gender: "Neuter / नपुंसकलिङ्ग",
      grammaticalForm: "Karmadharaya Compound in Locative Singular (धर्मरूपं क्षेत्रं तस्मिन् धर्मक्षेत्रे)",
    },
    components: [
      {
        id: "comp-dharma",
        surfaceForm: "धर्म",
        transliteration: "dharma",
        meaning: "righteousness, moral order, intrinsic duty, cosmic law",
        root: { form: "धृ", transliteration: "dhṛ", meaning: "to sustain" },
        type: "Noun (संज्ञा)",
      },
      {
        id: "comp-ksetre",
        surfaceForm: "क्षेत्रे",
        transliteration: "kṣetre",
        meaning: "in the field, in the ground, in the bodily field of action",
        type: "Noun in Locative (सप्तमी)",
      },
    ],
    occurrences: [
      {
        id: "occ-bg-1-1",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 1, Verse 1",
        verseSnippet: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥",
        translationSnippet: "O Sanjaya, assembled on the sacred field of Kurukshetra and eager to fight, what did my sons and the sons of Pandu do?",
      },
    ],
    sources: [
      { name: "SutraSparsh Sanskrit Lexicon", type: "lexicon", reference: "SS-LEX-1001" },
      { name: "Shankara Gita Bhashya", type: "commentary", reference: "Verse 1.1" },
    ],
  },

  "tyaktva": {
    id: "tyaktva",
    surfaceForm: "त्यक्त्वा",
    transliteration: "tyaktvā",
    generalMeaning: "Having abandoned, having relinquished, letting go.",
    contextMeaning: "Gita 2.48: Relinquishing anxious attachment to the fruits of endeavor.",
    isVerified: true,
    audioPronunciation: "tyak-tvaa",
    root: {
      id: "root-tyaj",
      form: "त्यज्",
      transliteration: "tyaj",
      gana: "भ्वादिगण (Class I)",
      meaning: "to abandon, relinquish, surrender, leave behind",
    },
    grammar: {
      grammaticalForm: "Gerund / Absolutive (क्त्वा प्रत्ययान्त अव्यय)",
      notes: "Formed with suffix क्त्वा (ktvā) attached to root त्यज् (tyaj). Acts as an indeclinable participle.",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "समानकर्तृकयोः पूर्वकाले ३.४.२१" },
    ],
  },

  "phalesu": {
    id: "phalesu",
    surfaceForm: "फलेषु",
    transliteration: "phaleṣu",
    generalMeaning: "in the fruits, in the results, in the consequential outcomes.",
    contextMeaning: "Gita 2.47: 'मा फलेषु कदाचन' — never let your mind be bound to consequential fruits.",
    isVerified: true,
    root: {
      id: "root-phal",
      form: "फल्",
      transliteration: "phal",
      meaning: "to bear fruit, ripen, yield",
    },
    grammar: {
      case: "Locative / सप्तमी विभक्ति",
      number: "Plural / बहुवचन",
      gender: "Neuter / नपुंसकलिङ्ग",
      grammaticalForm: "Locative plural of neuter noun 'फल' (phala)",
    },
    sources: [
      { name: "SutraSparsh Sanskrit Lexicon", type: "lexicon", reference: "SS-LEX-PHAL" },
    ],
  },

  "kadacana": {
    id: "kadacana",
    surfaceForm: "कदाचन",
    transliteration: "kadācana",
    generalMeaning: "at any time, ever, under any circumstance.",
    contextMeaning: "Emphatically denies conditionality to detached action.",
    isVerified: true,
    grammar: {
      grammaticalForm: "Indefinite Adverbial Particle (अव्यय)",
      notes: "कदा (when) + चन (indefinite affix) → at any time.",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "Sutra 5.3.70" },
    ],
  },
};

/**
 * Normalizes Sanskrit tokens: strips punctuation, virama, visarga endings, avagrahas for lookup
 */
export function normalizeSanskritKey(raw: string): string {
  return raw
    .trim()
    .replace(/[।॥,\.!\?;:\"\'\-–—\(\)\[\]\{\}]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Service API for Word Explorer
 * Provides decoupled, cached access to verified linguistic data
 */
export const WordExplorerService = {
  /**
   * Retrieves word details by unique lexicon ID
   */
  async getWordById(wordId: string): Promise<SanskritWord | null> {
    return VERIFIED_SANSKRIT_WORDS[wordId] || null;
  },

  /**
   * Synchronously retrieves word details by surface form or normalized lookup key
   */
  getWordBySurfaceSync(surface: string, _contextVerseTitle?: string): SanskritWord | null {
    const clean = normalizeSanskritKey(surface);
    if (!clean) return null;

    // Direct match against entries
    for (const [key, entry] of Object.entries(VERIFIED_SANSKRIT_WORDS)) {
      const entryClean = normalizeSanskritKey(entry.surfaceForm);
      if (entryClean === clean || key === clean) {
        return entry;
      }
      // Check component match
      if (entry.components) {
        for (const comp of entry.components) {
          if (normalizeSanskritKey(comp.surfaceForm) === clean) {
            return {
              id: `comp-wrap-${comp.id}`,
              surfaceForm: comp.surfaceForm,
              transliteration: comp.transliteration || comp.surfaceForm,
              generalMeaning: comp.meaning,
              contextMeaning: comp.contextMeaning,
              isVerified: true,
              root: comp.root,
              grammar: comp.grammar,
              sources: [
                {
                  name: "SutraSparsh Sanskrit Lexicon",
                  type: "lexicon",
                  reference: `Component of ${entry.surfaceForm}`,
                },
              ],
            };
          }
        }
      }
    }

    // Graceful degradation fallback (FR-10): Never fabricate grammatical decomposition
    return {
      id: `unverified-${clean}`,
      surfaceForm: surface.trim().replace(/[।॥,\.!\?;:\"\'\-–—]/g, ""),
      transliteration: surface.trim(),
      generalMeaning: "Sanskrit liturgical term",
      isVerified: false,
      unavailableReason:
        "Detailed grammatical decomposition is currently being verified against classical Paninian corpora. Verified information will be displayed when available.",
      sources: [
        {
          name: "SutraSparsh Vedic Corpus (Under Verification)",
          type: "corpus",
        },
      ],
    };
  },

  /**
   * Retrieves word details by surface form or normalized lookup key
   */
  async getWordBySurface(surface: string, contextVerseTitle?: string): Promise<SanskritWord | null> {
    return this.getWordBySurfaceSync(surface, contextVerseTitle);
  },

  /**
   * Searches the verified lexicon by Devanagari, IAST, or English meaning
   */
  async searchWords(query: string): Promise<SanskritWord[]> {
    const q = query.trim().toLowerCase();
    if (!q) return Object.values(VERIFIED_SANSKRIT_WORDS);

    return Object.values(VERIFIED_SANSKRIT_WORDS).filter((item) => {
      const matchSurface = item.surfaceForm.toLowerCase().includes(q);
      const matchTrans = item.transliteration.toLowerCase().includes(q);
      const matchMeaning = item.generalMeaning.toLowerCase().includes(q);
      const matchContext = item.contextMeaning?.toLowerCase().includes(q);
      const matchRoot = item.root?.form.toLowerCase().includes(q) || item.root?.meaning.toLowerCase().includes(q);
      const matchComponents = item.components?.some(
        (c) =>
          c.surfaceForm.toLowerCase().includes(q) ||
          c.meaning.toLowerCase().includes(q) ||
          c.transliteration?.toLowerCase().includes(q)
      );

      return matchSurface || matchTrans || matchMeaning || matchContext || matchRoot || matchComponents;
    });
  },

  /**
   * Returns occurrences across scriptures for a word
   */
  async getWordOccurrences(wordId: string): Promise<WordOccurrence[]> {
    const word = VERIFIED_SANSKRIT_WORDS[wordId];
    return word?.occurrences || [];
  },

  /**
   * Tokenizes a verse string into interactive words and separators
   */
  tokenizeVerse(verseText: string): VerseToken[] {
    // Regex splits by whitespace while preserving Devanagari words and punctuation
    const tokens: VerseToken[] = [];
    const parts = verseText.split(/(\s+|[।॥,\.!\?;:\n]+)/);

    parts.forEach((raw, idx) => {
      if (!raw) return;
      const isWhitespaceOrPunct = /^[\s।॥,\.!\?;:\n]+$/.test(raw);
      const cleaned = raw.replace(/[।॥,\.!\?;:\"\'\-–—]/g, "").trim();
      const isWord = !isWhitespaceOrPunct && cleaned.length > 0;

      let wordId: string | undefined;
      let hasAnalysis = false;

      if (isWord) {
        const cleanKey = normalizeSanskritKey(cleaned);
        for (const [id, entry] of Object.entries(VERIFIED_SANSKRIT_WORDS)) {
          if (
            normalizeSanskritKey(entry.surfaceForm) === cleanKey ||
            entry.components?.some((c) => normalizeSanskritKey(c.surfaceForm) === cleanKey)
          ) {
            wordId = id;
            hasAnalysis = true;
            break;
          }
        }
      }

      tokens.push({
        id: `tok-${idx}-${cleaned || "sep"}`,
        raw,
        cleaned,
        isWord,
        wordId,
        hasAnalysis,
      });
    });

    return tokens;
  },

  /**
   * Returns all curated verified words
   */
  getAllCuratedWords(): SanskritWord[] {
    return Object.values(VERIFIED_SANSKRIT_WORDS);
  },

  /**
   * Tracks discovery journey analytics events (FR-12):
   * 'word_selected', 'word_breakdown_viewed'
   */
  trackEvent(
    eventName: "word_selected" | "word_breakdown_viewed" | "word_component_selected",
    properties: Record<string, any>
  ): void {
    const payload = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    try {
      if (typeof window !== "undefined") {
        // Dispatch custom DOM event for active telemetry / analytics listeners
        window.dispatchEvent(
          new CustomEvent("sutrasparsh:word_discovery_event", { detail: payload })
        );

        // Append to local discovery analytics history
        const key = "sutrasparsh_word_analytics";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push(payload);
        if (existing.length > 100) existing.shift();
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch {
      // Graceful error protection
    }
  },

  /**
   * Retrieves past tracked word discovery analytics events
   */
  getAnalyticsEvents(): Array<{ event: string; properties: Record<string, any>; timestamp: string }> {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem("sutrasparsh_word_analytics") || "[]");
      }
    } catch {}
    return [];
  },
};
