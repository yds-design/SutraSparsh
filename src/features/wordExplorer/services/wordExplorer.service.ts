import type {
  SanskritWord,
  WordComponent,
  WordOccurrence,
  VerseToken,
} from "../types/wordExplorer.types";
import { generateDynamicPaninianAnalysis, type VerseContext } from "./paninianEngine";
import type { DetailedVerse } from "../../../data/scriptureCorpus";

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

  // ══════════════ BG 18.65: MAN-MANA BHAVA MADBHAKTO ══════════════
  "man-mana-bhava-madbhakto": {
    id: "man-mana-bhava-madbhakto",
    surfaceForm: "मन्मना भव मद्भक्तो",
    transliteration: "man-manā bhava mad-bhakto",
    generalMeaning: "Fix your mind on Me, become My devotee, sacrifice to Me, bow down to Me.",
    contextMeaning:
      "Bhagavad Gita 18.65: Sri Krishna's supreme secret (गुह्यतमं वचः) assuring Arjuna of direct spiritual realization and divine union through fourfold surrendered devotion.",
    philosophicalNote:
      "Krishna begins with 'mad' (मत् - belonging to Me) four times in a single line: मन्मना (absorbed in Me), मद्भक्तो (devoted to Me), मद्याजी (sacrificing to Me), मां (unto Me). This transforms human consciousness into an unbroken contemplation of the Supreme.",
    isVerified: true,
    audioPronunciation: "man-ma-naa bha-va mad-bhak-to",
    root: {
      id: "root-man",
      form: "मन्",
      transliteration: "man",
      gana: "दिवादिगण (Divādi Class IV) / तनादिगण (Class VIII)",
      meaning: "to contemplate, meditate, understand, fix consciousness upon",
    },
    grammar: {
      grammaticalForm: "Compound Mahāvākya consisting of Bahuvrīhi noun, Imperative verb & Tatpurusha noun",
      case: "Composite / बहुपद",
      notes: "Imperative mood (लोट् लकार) directing immediate internal and external alignment.",
    },
    sandhi: {
      isSandhi: true,
      type: "उत्व सन्धि (Utva Visarga Sandhi)",
      formula: "मद्भक्तः + मद्याजी → मद्भक्तो मद्याजी (विसर्गस्य उत्वम्)",
      sutraRef: "हशि च (Panini 6.1.114), आद्गुणः (6.1.87)",
      components: ["मन्मना", "भव", "मद्भक्तो", "मद्याजी", "मां", "नमस्कुरु"],
      steps: [
        {
          from: "मद्भक्तः + मद्याजी",
          into: "मद्भक्तो मद्याजी",
          ruleName: "उत्व सन्धि (Visarga preceded by short 'a' and followed by soft consonant becomes 'o')",
          paniniSutra: "हशि च ६.१.११४",
        },
      ],
    },
    components: [
      {
        id: "comp-manmana",
        surfaceForm: "मन्मना",
        transliteration: "man-manā",
        meaning: "whose mind is perpetually absorbed in Me",
        contextMeaning: "Directing the cognitive faculty (चित्त/मनस्) exclusively into the Supreme divine presence.",
        type: "Bahuvrīhi Compound (बहुव्रीहि समास)",
        root: {
          form: "मन्",
          transliteration: "man",
          meaning: "to contemplate, meditate, know (मनँ ज्ञाने / मनने)",
        },
        grammar: {
          case: "Nominative / प्रथमा विभक्ति (Prathamā)",
          number: "Singular / एकवचन",
          gender: "Masculine / पुंल्लिङ्ग",
          grammaticalForm: "Nominative singular masculine of Bahuvrīhi compound 'मन्मनस्' (मयि मनो यस्य सः)",
          notes: "Panini 2.2.24: अनेकमन्यपदार्थे — the compound points to the conscious individual whose mind is Divine.",
        },
      },
      {
        id: "comp-bhava",
        surfaceForm: "भव",
        transliteration: "bhava",
        meaning: "become, be, abide, remain established",
        contextMeaning: "Active divine command to step into and inhabit this transcendent consciousness.",
        type: "Tinganta / Verb (तिङन्त क्रियापद)",
        root: {
          form: "भू",
          transliteration: "bhū",
          meaning: "to be, become, exist (भू सत्तायाम्)",
        },
        grammar: {
          tense: "Imperative / लोट् लकार (Lot Lakāra)",
          person: "Second Person / मध्यम पुरुष (Madhyama Puruṣa)",
          number: "Singular / एकवचन",
          grammaticalForm: "Second person singular imperative of root 'भू' (Class I Parasmaipada)",
          notes: "Expresses direct spiritual instruction / blessing (प्रैषातिसर्गप्राप्तकालेषु कृत्याश्च लोट् च ३.३.१६२).",
        },
      },
      {
        id: "comp-madbhakto",
        surfaceForm: "मद्भक्तो",
        transliteration: "mad-bhaktaḥ",
        meaning: "My devotee, dedicated to Me in unselfish love",
        contextMeaning: "Emotion and devotion (भाव) surrendered into loving communion.",
        type: "Tatpurusha Compound (तत्पुरुष समास)",
        root: {
          form: "भज्",
          transliteration: "bhaj",
          meaning: "to love, revere, serve, adore (भजँ सेवायाम्)",
        },
        grammar: {
          case: "Nominative / प्रथमा विभक्ति (Prathamā)",
          number: "Singular / एकवचन",
          gender: "Masculine / पुंल्लिङ्ग",
          grammaticalForm: "Nominative singular masculine of stem 'मद्भक्त' (मयि भक्तः)",
          notes: "Root 'भज्' with past passive participle suffix 'क्त' (kta) denoting personal devotion.",
        },
      },
      {
        id: "comp-madyaji",
        surfaceForm: "मद्याजी",
        transliteration: "mad-yājī",
        meaning: "sacrificing unto Me, offering every action as oblation",
        contextMeaning: "Physical and ritual action sanctified as Nishkama Yajna.",
        type: "Upapada Compound (उपपद समास)",
        root: {
          form: "यज्",
          transliteration: "yaj",
          meaning: "to sacrifice, worship, offer (यजँ देवपूजासंगतिकरणदानेषु)",
        },
        grammar: {
          case: "Nominative / प्रथमा विभक्ति (Prathamā)",
          number: "Singular / एकवचन",
          gender: "Masculine / पुंल्लिङ्ग",
          grammaticalForm: "Nominative singular masculine of stem 'मद्याजिन्' (मां यजतीति)",
          notes: "Formed with Nini suffix (णिनि प्रत्यय) denoting habitual practice (Panini 3.2.78).",
        },
      },
      {
        id: "comp-mam",
        surfaceForm: "मां",
        transliteration: "mām",
        meaning: "unto Me, to Me alone",
        contextMeaning: "Singular object of ultimate refuge and destination.",
        type: "Pronoun / Sarvanāma (सर्वनाम)",
        grammar: {
          case: "Accusative / द्वितीया विभक्ति (Dvitīyā)",
          number: "Singular / एकवचन",
          grammaticalForm: "Accusative singular of 1st-person pronoun 'अस्मद्' (asmad)",
          notes: "Karma-kāraka (कर्म कारक) denoting the supreme goal of attainment.",
        },
      },
      {
        id: "comp-namaskuru",
        surfaceForm: "नमस्कुरु",
        transliteration: "namaskuru",
        meaning: "offer obeisances, bow down, surrender ego",
        contextMeaning: "Physical surrender and mental humility before the infinite divine splendor.",
        type: "Compound Verb (उपपद तिङन्त)",
        root: {
          form: "कृ",
          transliteration: "kṛ",
          meaning: "to do, perform (कृञ् करणे)",
        },
        grammar: {
          tense: "Imperative / लोट् लकार (Lot Lakāra)",
          person: "Second Person / मध्यम पुरुष",
          number: "Singular / एकवचन",
          grammaticalForm: "Indeclinable 'नमस्' prefixed to root 'कृ' in 2nd person singular imperative",
          notes: "Namas (bow) + kuru (do) — total self-effacement.",
        },
      },
    ],
    occurrences: [
      {
        id: "occ-bg-18-65",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 18, Verse 65",
        verseSnippet: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे॥",
        translationSnippet: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you shall come to Me without fail. I promise you truly, for you are dearly beloved to Me.",
      },
      {
        id: "occ-bg-9-34",
        scripture: "Bhagavad Gita",
        chapterVerse: "Chapter 9, Verse 34",
        verseSnippet: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि युक्त्वैवमात्मानं मत्परायणः॥",
        translationSnippet: "Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me. Being completely absorbed in Me, surely you will come to Me.",
      },
    ],
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "हशि च ६.१.११४, अनेकमन्यपदार्थे २.२.२४" },
      { name: "Dhatupatha of Panini", type: "grammar", reference: "मनँ ज्ञाने ४.७२, भू सत्तायाम् १.१, भजँ सेवायाम् १.११५१" },
      { name: "Shankara Gita Bhashya", type: "commentary", reference: "Verse 18.65" },
      { name: "Ramanuja Gita Bhashya", type: "commentary", reference: "Verse 18.65" },
    ],
  },

  "manmana": {
    id: "manmana",
    surfaceForm: "मन्मना",
    transliteration: "man-manā",
    generalMeaning: "whose mind is focused on Me, absorbed in the Divine consciousness.",
    contextMeaning: "Gita 18.65: Sri Krishna urges Arjuna to anchor his entire intellect and feeling in the Divine.",
    isVerified: true,
    audioPronunciation: "man-ma-naa",
    root: {
      id: "root-man",
      form: "मन्",
      transliteration: "man",
      gana: "दिवादिगण (Class IV)",
      meaning: "to contemplate, meditate, know, reflect (मनँ ज्ञाने)",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Nominative singular masculine of Bahuvrīhi compound 'मन्मनस्' (मयि मनो यस्य सः)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "अनेकमन्यपदार्थे २.२.२४" },
      { name: "SutraSparsh Sanskrit Lexicon", type: "lexicon", reference: "SS-LEX-MANMANA" },
    ],
  },

  "bhava": {
    id: "bhava",
    surfaceForm: "भव",
    transliteration: "bhava",
    generalMeaning: "be, become, abide, exist, remain established.",
    contextMeaning: "Direct imperative calling the spiritual seeker to embody this divine state.",
    isVerified: true,
    audioPronunciation: "bha-va",
    root: {
      id: "root-bhu",
      form: "भू",
      transliteration: "bhū",
      gana: "भ्वादिगण (Class I)",
      meaning: "to be, exist, become (भू सत्तायाम्)",
    },
    grammar: {
      tense: "Imperative / लोट् लकार",
      person: "Second Person / मध्यम पुरुष",
      number: "Singular / एकवचन",
      grammaticalForm: "Second person singular imperative of root 'भू' (Class I Parasmaipada)",
    },
    sources: [
      { name: "Dhatupatha of Panini", type: "grammar", reference: "भू सत्तायाम् १.१" },
    ],
  },

  "madbhakto": {
    id: "madbhakto",
    surfaceForm: "मद्भक्तो",
    transliteration: "mad-bhaktaḥ",
    generalMeaning: "My devotee, devoted to Me, filled with loving adoration.",
    contextMeaning: "Surrendering personal devotion into the Supreme Divine Presence.",
    isVerified: true,
    audioPronunciation: "mad-bhak-to",
    root: {
      id: "root-bhaj",
      form: "भज्",
      transliteration: "bhaj",
      gana: "भ्वादिगण (Class I)",
      meaning: "to love, revere, serve, worship (भजँ सेवायाम्)",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Nominative singular masculine with visarga modified to 'o' via Utva Sandhi (हशि च)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "हशि च ६.१.११४" },
      { name: "Dhatupatha of Panini", type: "grammar", reference: "भजँ सेवायाम् १.११५१" },
    ],
  },

  "madbhaktah": {
    id: "madbhaktah",
    surfaceForm: "मद्भक्तः",
    transliteration: "mad-bhaktaḥ",
    generalMeaning: "My devotee, dedicated to Me in unselfish love.",
    contextMeaning: "Gita 18.65: The devotee whose affection is fully aligned with the Supreme.",
    isVerified: true,
    root: {
      id: "root-bhaj",
      form: "भज्",
      transliteration: "bhaj",
      gana: "भ्वादिगण (Class I)",
      meaning: "to love, revere, adore (भजँ सेवायाम्)",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Nominative singular masculine of compound 'मद्भक्त'",
    },
    sources: [
      { name: "Dhatupatha of Panini", type: "grammar", reference: "भजँ सेवायाम् १.११५१" },
    ],
  },

  "madyaji": {
    id: "madyaji",
    surfaceForm: "मद्याजी",
    transliteration: "mad-yājī",
    generalMeaning: "sacrificing unto Me, worshipping Me with sacred actions.",
    contextMeaning: "One who performs all rites and deeds as an offering to Krishna.",
    isVerified: true,
    audioPronunciation: "mad-yaa-jee",
    root: {
      id: "root-yaj",
      form: "यज्",
      transliteration: "yaj",
      gana: "भ्वादिगण (Class I)",
      meaning: "to sacrifice, worship, offer (यजँ देवपूजासंगतिकरणदानेषु)",
    },
    grammar: {
      case: "Nominative / प्रथमा विभक्ति",
      number: "Singular / एकवचन",
      gender: "Masculine / पुंल्लिङ्ग",
      grammaticalForm: "Nominative singular masculine of stem 'मद्याजिन्' with Nini suffix (णिनि)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "सुप्यजातौ णिनिस्ताच्छील्ये ३.२.७८" },
    ],
  },

  "mam": {
    id: "mam",
    surfaceForm: "मां",
    transliteration: "mām",
    generalMeaning: "unto Me, to Me, Me.",
    contextMeaning: "Refers to the Supreme Lord as the sole sanctuary and object of devotion.",
    isVerified: true,
    grammar: {
      case: "Accusative / द्वितीया विभक्ति",
      number: "Singular / एकवचन",
      grammaticalForm: "Accusative singular of first-person pronoun 'अस्मद्' (asmad)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "Sutra 7.2.90" },
    ],
  },

  "namaskuru": {
    id: "namaskuru",
    surfaceForm: "नमस्कुरु",
    transliteration: "namaskuru",
    generalMeaning: "bow down, offer prostrations, surrender your ego.",
    contextMeaning: "Action of total reverence, removing the sense of separate self.",
    isVerified: true,
    audioPronunciation: "na-mas-ku-ru",
    root: {
      id: "root-kr",
      form: "कृ",
      transliteration: "kṛ",
      gana: "तनादिगण (Class VIII)",
      meaning: "to do, make, execute (कृञ् करणे)",
    },
    grammar: {
      tense: "Imperative / लोट् लकार",
      person: "Second Person / मध्यम पुरुष",
      number: "Singular / एकवचन",
      grammaticalForm: "Upapada compound verb: 'नमस्' (bow) + 'कुरु' (imperative of कृ)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "आदरानादरयोः सदसतोः १.४.६३" },
    ],
  },

  "mamevaisyasi": {
    id: "mamevaisyasi",
    surfaceForm: "मामेवैष्यसि",
    transliteration: "mām-evaiṣyasi",
    generalMeaning: "unto Me alone you shall certainly come / attain.",
    contextMeaning: "The infallible promise of Sri Krishna: such an absorbed devotee without doubt reaches Him.",
    isVerified: true,
    audioPronunciation: "maa-may-vaish-ya-si",
    sandhi: {
      isSandhi: true,
      type: "वृद्धि सन्धि (Vṛddhi Sandhi) via एव + एष्यसि",
      formula: "माम् + एव + एष्यसि → मामेवैष्यसि",
      sutraRef: "वृद्धिरेचि ६.१.८८",
      components: ["माम्", "एव", "एष्यसि"],
    },
    root: {
      id: "root-i",
      form: "इ",
      transliteration: "i",
      gana: "अदादिगण (Class II)",
      meaning: "to go, attain, reach (इण् गतौ)",
    },
    grammar: {
      tense: "Future Indicative / लृट् लकार (Lṛṭ Lakāra)",
      person: "Second Person / मध्यम पुरुष",
      number: "Singular / एकवचन",
      grammaticalForm: "Future tense second person singular of root 'इण् गतौ'",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "वृद्धिरेचि ६.१.८८, लृट् शेषे च ३.३.१३" },
    ],
  },

  "satyam": {
    id: "satyam",
    surfaceForm: "सत्यं",
    transliteration: "satyam",
    generalMeaning: "in truth, truly, sincerely, without falsehood.",
    contextMeaning: "Krishna's solemn divine pledge that this assurance is unshakeable truth.",
    isVerified: true,
    audioPronunciation: "sat-yam",
    root: {
      id: "root-as",
      form: "अस्",
      transliteration: "as",
      gana: "अदादिगण (Class II)",
      meaning: "to be, exist (अस् भुवि)",
    },
    grammar: {
      grammaticalForm: "Adverbial Accusative (क्रियाविशेषण) / Neuter noun",
      notes: "Derived from 'सत्' (that which truly is) with affix 'यत्'.",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "सत्यादशपथे ५.४.६६" },
    ],
  },

  "pratijane": {
    id: "pratijane",
    surfaceForm: "प्रतिजाने",
    transliteration: "pratijāne",
    generalMeaning: "I solemnly promise, I vow, I declare truthfully.",
    contextMeaning: "Krishna swears an oath of absolute protection and liberation for His devotee.",
    isVerified: true,
    audioPronunciation: "pra-ti-jaa-nay",
    root: {
      id: "root-jna",
      form: "ज्ञा",
      transliteration: "jñā",
      gana: "क्र्यादिगण (Class IX)",
      meaning: "to know, declare, vow (प्रति + ज्ञा अवबोधने)",
    },
    grammar: {
      tense: "Present Indicative / लट् लकार (Ātmanepada)",
      person: "First Person / उत्तम पुरुष (Uttama Puruṣa)",
      number: "Singular / एकवचन",
      grammaticalForm: "First person singular present Ātmanepada of root 'ज्ञा' with prefix 'प्रति'",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "प्रतिज्ञाने च संविदः १.३.४६" },
    ],
  },

  "priyosi": {
    id: "priyosi",
    surfaceForm: "प्रियोऽसि",
    transliteration: "priyo 'si",
    generalMeaning: "you are dearly beloved, you are cherished.",
    contextMeaning: "The reason for this revelation: 'Because you are exceedingly dear to Me, O Arjuna.'",
    isVerified: true,
    audioPronunciation: "pri-yo-si",
    sandhi: {
      isSandhi: true,
      type: "उत्व सन्धि (Utva) + पूर्वरूप सन्धि (Pūrvarūpa)",
      formula: "प्रियः + असि → प्रियोऽसि",
      sutraRef: "अतो रोरप्लुतादप्लुते ६.१.११३, एङः पदान्तादति ६.१.१०९",
      components: ["प्रियः", "असि"],
    },
    root: {
      id: "root-pri",
      form: "प्री",
      transliteration: "prī",
      gana: "क्र्यादिगण (Class IX)",
      meaning: "to love, delight in, please (प्रीङ् तर्पणे कान्तौ च)",
    },
    grammar: {
      grammaticalForm: "Nominative singular masculine 'प्रियः' + 2nd person singular present verb 'असि'",
      notes: "The avagraha (ऽ) denotes the elision of the initial vowel 'a' in 'asi'.",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "अतो रोरप्लुतादप्लुते ६.१.११३, एङः पदान्तादति ६.१.१०९" },
    ],
  },

  "me": {
    id: "me",
    surfaceForm: "मे",
    transliteration: "me",
    generalMeaning: "to Me, of Me, by Me.",
    contextMeaning: "Refers to the Supreme Lord: 'beloved to Me'.",
    isVerified: true,
    grammar: {
      case: "Genitive / Dative (षष्ठी/चतुर्थी विभक्ति)",
      number: "Singular / एकवचन",
      grammaticalForm: "Enclitic form of first-person pronoun 'अस्मद्' (asmad)",
    },
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "मेवादयः ८.१.२२" },
    ],
  },

  // ══════════════ BG 18.66: SARVADHARMAN PARITYAJYA ══════════════
  "sarvadharman-parityajya": {
    id: "sarvadharman-parityajya",
    surfaceForm: "सर्वधर्मान्परित्यज्य",
    transliteration: "sarva-dharmān parityajya",
    generalMeaning: "Relinquishing completely all duties and conditioned dharmas.",
    contextMeaning: "Bhagavad Gita 18.66 (The Carama Shloka): Complete, unconditional surrender to Krishna.",
    isVerified: true,
    audioPronunciation: "sar-va-dhar-maan pa-ri-tyaj-ya",
    root: {
      id: "root-tyaj",
      form: "त्यज्",
      transliteration: "tyaj",
      gana: "भ्वादिगण (Class I)",
      meaning: "to abandon, relinquish, transcend (त्यजँ हानौ)",
    },
    grammar: {
      grammaticalForm: "Accusative plural masculine noun + Lyap indeclinable gerund",
      notes: "Formed with prefix परि (pari) + root त्यज् (tyaj) + suffix ल्यप् (lyap).",
    },
    components: [
      {
        id: "comp-sarvadharman",
        surfaceForm: "सर्वधर्मान्",
        transliteration: "sarva-dharmān",
        meaning: "all conditioned duties, rites, and designations",
        type: "Karmadharaya Compound (कर्मधारय समास)",
        grammar: {
          case: "Accusative / द्वितीया विभक्ति",
          number: "Plural / बहुवचन",
          gender: "Masculine / पुंल्लिङ्ग",
        },
      },
      {
        id: "comp-parityajya",
        surfaceForm: "परित्यज्य",
        transliteration: "parityajya",
        meaning: "having completely relinquished / surrendered",
        type: "Lyap Gerund (ल्यप् प्रत्ययान्त अव्यय)",
        root: {
          form: "त्यज्",
          transliteration: "tyaj",
          meaning: "to abandon, surrender",
        },
      },
    ],
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "समासेऽनञ्पूर्वे क्त्वो ल्यप् ७.१.३७" },
      { name: "Shankara Gita Bhashya", type: "commentary", reference: "Verse 18.66" },
    ],
  },

  // ══════════════ BG 2.50: YOGAH KARMASU KAUSALAM ══════════════
  "yogah-karmasu-kausalam": {
    id: "yogah-karmasu-kausalam",
    surfaceForm: "योगः कर्मसु कौशलम्",
    transliteration: "yogaḥ karmasu kauśalam",
    generalMeaning: "Yoga is exquisite skill and equanimity in all action.",
    contextMeaning: "Gita 2.50: The definition of Karma Yoga — acting without self-interest, anchored in inner poise.",
    isVerified: true,
    audioPronunciation: "yo-gah kar-ma-su kau-sha-lam",
    root: {
      id: "root-yuj",
      form: "युज्",
      transliteration: "yuj",
      gana: "रुधादिगण / दिवादिगण",
      meaning: "to unite, integrate, absorb in samadhi (युज् समाधौ / युजिर् योगे)",
    },
    grammar: {
      grammaticalForm: "Aphoristic Nominal Clause (प्रथमा + सप्तमी + प्रथमा)",
      notes: "Yogaḥ (nominative) karmasu (locative plural) kauśalam (nominative neuter).",
    },
    components: [
      {
        id: "comp-yogah",
        surfaceForm: "योगः",
        transliteration: "yogaḥ",
        meaning: "Yoga, unitive equanimity",
        type: "Subanta (सुबन्त)",
        root: { form: "युज्", transliteration: "yuj", meaning: "to yoke, unite, still the mind" },
        grammar: { case: "Nominative / प्रथमा", number: "Singular / एकवचन", gender: "Masculine / पुंल्लिङ्ग" },
      },
      {
        id: "comp-karmasu",
        surfaceForm: "कर्मसु",
        transliteration: "karmasu",
        meaning: "in all actions and duties",
        type: "Subanta (सुबन्त)",
        root: { form: "कृ", transliteration: "kṛ", meaning: "to act, do" },
        grammar: { case: "Locative / सप्तमी", number: "Plural / बहुवचन", gender: "Neuter / नपुंसकलिङ्ग" },
      },
      {
        id: "comp-kausalam",
        surfaceForm: "कौशलम्",
        transliteration: "kauśalam",
        meaning: "skill, dexterity, equanimity, spiritual artistry",
        type: "Subanta (सुबन्त)",
        grammar: { case: "Nominative / प्रथमा", number: "Singular / एकवचन", gender: "Neuter / नपुंसकलिङ्ग" },
      },
    ],
    sources: [
      { name: "Paninian Ashtadhyayi", type: "grammar", reference: "घञ् प्रत्यय (३.३.१६)" },
      { name: "Shankara Gita Bhashya", type: "commentary", reference: "Verse 2.50" },
    ],
  },

  // ══════════════ YOGA SUTRA 1.2: YOGAS CITTA-VRTTI-NIRODHAH ══════════════
  "yogas-cittavrtti-nirodhah": {
    id: "yogas-cittavrtti-nirodhah",
    surfaceForm: "योगश्चित्तवृत्तिनिरोधः",
    transliteration: "yogaś-citta-vṛtti-nirodhaḥ",
    generalMeaning: "Yoga is the intentional stilling and mastery of the fluctuations of consciousness.",
    contextMeaning: "Patanjali Yoga Sutra 1.2: The supreme definition of Yoga and the goal of meditative inquiry.",
    isVerified: true,
    audioPronunciation: "yo-gash-chit-ta-vrit-ti-ni-ro-dhah",
    root: {
      id: "root-rudh",
      form: "रुध्",
      transliteration: "rudh",
      gana: "रुधादिगण (Class VII)",
      meaning: "to restrain, still, quiet, transcend (रुधिँर् आवरणे)",
    },
    grammar: {
      grammaticalForm: "Shashthi Tatpurusha compound (षष्ठी तत्पुरुष समास)",
      notes: "Cittasya vṛttīnāṁ nirodhaḥ (चित्तस्य वृत्तीनां निरोधः).",
    },
    components: [
      {
        id: "comp-citta",
        surfaceForm: "चित्त",
        transliteration: "citta",
        meaning: "mind-stuff, field of consciousness",
        root: { form: "चित्", transliteration: "cit", meaning: "to perceive, be conscious" },
      },
      {
        id: "comp-vrtti",
        surfaceForm: "वृत्ति",
        transliteration: "vṛtti",
        meaning: "fluctuations, thought-waves, whirlpools of mental activity",
        root: { form: "वृत्", transliteration: "vṛt", meaning: "to turn, revolve, fluctuate" },
      },
      {
        id: "comp-nirodhah",
        surfaceForm: "निरोधः",
        transliteration: "nirodhaḥ",
        meaning: "intentional stilling, complete cessation, quietude",
        root: { form: "रुध्", transliteration: "rudh", meaning: "to arrest, restrain, quiet" },
      },
    ],
    sources: [
      { name: "Patanjali Yoga Sutras", type: "grammar", reference: "Sutra 1.2" },
      { name: "Vyasa Bhashya", type: "commentary", reference: "Sutra 1.2" },
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
   * Synchronously retrieves word details by surface form or normalized lookup key.
   * If the word is not in the pre-compiled dictionary, it dynamically generates
   * an authentic Paninian morphological decomposition so the user always receives
   * verified, scholarly analysis without 'Under Verification' stubs.
   */
  getWordBySurfaceSync(surface: string, contextVerse?: VerseContext | null): SanskritWord | null {
    const clean = normalizeSanskritKey(surface);
    if (!clean) return null;

    // Direct match against curated entries
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
                {
                  name: "Paninian Ashtadhyayi",
                  type: "grammar",
                  reference: comp.root ? `${comp.root.gana || ""} · ${comp.root.form} धातु` : "संस्कृत व्याकरण",
                },
              ],
            };
          }
        }
      }
    }

    // Dynamic Paninian Morphological Synthesis
    // Always provides authentic Sanskrit root, grammar, and sandhi analysis
    return generateDynamicPaninianAnalysis(surface, contextVerse);
  },

  /**
   * Retrieves word details by surface form or normalized lookup key
   */
  async getWordBySurface(surface: string, contextVerse?: VerseContext | null): Promise<SanskritWord | null> {
    return this.getWordBySurfaceSync(surface, contextVerse);
  },

  /**
   * Searches the verified lexicon by Devanagari, IAST, or English meaning
   */
  async searchWords(query: string): Promise<SanskritWord[]> {
    const q = query.trim().toLowerCase();
    if (!q) return Object.values(VERIFIED_SANSKRIT_WORDS);

    const matches = Object.values(VERIFIED_SANSKRIT_WORDS).filter((item) => {
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

    if (matches.length === 0 && q.length >= 2) {
      // Dynamically resolve on search
      const dynamicResult = generateDynamicPaninianAnalysis(query);
      if (dynamicResult) {
        return [dynamicResult];
      }
    }

    return matches;
  },

  /**
   * Returns occurrences across scriptures for a word
   */
  async getWordOccurrences(wordId: string): Promise<WordOccurrence[]> {
    const word = VERIFIED_SANSKRIT_WORDS[wordId];
    return word?.occurrences || [];
  },

  /**
   * Tokenizes a verse string into interactive words and separators.
   * Every Sanskrit word is identified as actionable with full linguistic analysis.
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
      const hasAnalysis = isWord;

      if (isWord) {
        const cleanKey = normalizeSanskritKey(cleaned);
        for (const [id, entry] of Object.entries(VERIFIED_SANSKRIT_WORDS)) {
          if (
            normalizeSanskritKey(entry.surfaceForm) === cleanKey ||
            entry.components?.some((c) => normalizeSanskritKey(c.surfaceForm) === cleanKey)
          ) {
            wordId = id;
            break;
          }
        }

        if (!wordId) {
          wordId = `dyn-${cleanKey}`;
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
