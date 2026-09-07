/**
 * SutraSparsh — Word Explorer & "Look Closer" Types
 * Data-driven architecture for Sanskrit linguistic and semantic layers
 */

export interface WordRoot {
  id?: string;
  form: string;
  transliteration?: string;
  gana?: string; // e.g. "तनादिगण (Tanādi)"
  meaning: string;
}

export interface WordGrammarData {
  case?: string; // विभक्ति (e.g. "Locative / सप्तमी")
  number?: string; // वचन (e.g. "Singular / एकवचन")
  gender?: string; // लिङ्ग (e.g. "Neuter / नपुंसकलिङ्ग")
  person?: string; // पुरुष (e.g. "Third / प्रथम पुरुष")
  tense?: string; // लकार (e.g. "Present / लट् लकार")
  mood?: string;
  grammaticalForm?: string; // e.g. "Locative singular of noun stem 'karman'"
  notes?: string;
}

export type WordGrammar = WordGrammarData;

export interface WordSandhiStep {
  from: string;
  into: string;
  ruleName: string;
  paniniSutra?: string;
}

export interface WordSandhiData {
  isSandhi: boolean;
  type?: string;
  formula?: string;
  components?: string[];
  steps?: WordSandhiStep[];
  sutraRef?: string;
}

export type WordSandhi = WordSandhiData;

export interface WordSource {
  name: string;
  type: "lexicon" | "grammar" | "commentary" | "corpus";
  reference?: string;
}

export interface WordOccurrence {
  id: string;
  scripture: string;
  chapterVerse: string;
  verseSnippet: string;
  translationSnippet: string;
}

export interface WordComponent {
  id: string;
  surfaceForm: string;
  transliteration?: string;
  meaning: string;
  contextMeaning?: string;
  type?: string; // e.g. "Noun (सुबन्त)", "Particle / Avyaya (अव्यय)", "Pronoun (सर्वनाम)"
  root?: WordRoot;
  grammar?: WordGrammarData;
  sandhiRuleApplied?: string;
}

export interface SanskritWord {
  id: string;
  surfaceForm: string; // The full inflected or compound form as found in the verse
  transliteration: string; // IAST notation (e.g. "karmaṇy-evādhikāras-te")
  generalMeaning: string; // Comprehensive dictionary / lexical definition
  contextMeaning?: string; // Specific contextual nuance in this verse
  meanings?: {
    language: string;
    text: string;
    context?: string;
  }[];
  components?: WordComponent[];
  root?: WordRoot;
  grammar?: WordGrammarData;
  sandhi?: WordSandhiData;
  occurrences?: WordOccurrence[];
  sources?: WordSource[];
  isVerified: boolean; // FR-10: Must not fabricate linguistic decomposition
  unavailableReason?: string;
  audioPronunciation?: string;
  philosophicalNote?: string;
}

export interface VerseToken {
  id: string;
  raw: string;
  cleaned: string;
  isWord: boolean;
  wordId?: string;
  hasAnalysis: boolean;
}

export type WordExplorerViewMode = "overview" | "components" | "grammar" | "sandhi" | "occurrences";
