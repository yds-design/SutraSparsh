/**
 * SutraSparsh Sanskrit TTS Benchmark Corpus
 *
 * A rigorous, controlled test suite spanning 10 phonological and liturgical categories
 * designed to empirically stress-test Sanskrit phonetic rendering in candidate voices.
 */

import { TtsBenchmarkCase } from "../types.js";

export const SANSKRIT_BENCHMARK_CORPUS: TtsBenchmarkCase[] = [
  // Set A - Basic Sanskrit
  {
    id: "BENCH-01-BASIC",
    category: "basic",
    title: "Basic Sanskrit Vocabulary",
    text: "धर्मः कर्म योगः ज्ञानम् भक्तिः।",
    expectedFeatures: ["short-vowels", "long-vowels", "basic-stops", "halanta"],
    description: "Evaluates standard Devanagari vowel and consonant clarity without compounding.",
  },

  // Set B - Aspirated Consonants (Mahāprāṇa)
  {
    id: "BENCH-02-ASPIRATED",
    category: "aspirated",
    title: "Aspirated Consonant Distinction (महाप्राण)",
    text: "धर्मं भजति। फलम् खादति। घटे जलम् भवति।",
    expectedFeatures: ["aspirated-bha", "aspirated-pha", "aspirated-gha", "aspirated-dha"],
    description: "Verifies distinct audible aspiration across guttural, dental, and labial stops.",
  },

  // Set C - Retroflex Consonants (Mūrdhanya)
  {
    id: "BENCH-03-RETROFLEX",
    category: "retroflex",
    title: "Retroflex Distinction (मूर्धन्य ध्वनि)",
    text: "दृष्टिः कण्ठः कष्टम् विष्णुः षट्कर्म।",
    expectedFeatures: ["retroflex-ssa", "retroflex-tta", "retroflex-nna", "vocalic-r"],
    description: "Checks tongue curl and strict distinction between dental and retroflex stops.",
  },

  // Set D - Conjunct Consonants (Saṃyoga)
  {
    id: "BENCH-04-CONJUNCTS",
    category: "conjuncts",
    title: "Complex Ligatures & Conjuncts (संयोग)",
    text: "क्षेत्रज्ञं विद्धि। श्रीमद्भगवद्गीता तत्त्वमसि। बुद्धेर्नाशः।",
    expectedFeatures: ["kssa-ligature", "jnya-ligature", "tra-cluster", "shra-cluster", "ttva-cluster"],
    description: "Tests whether consonant clusters are pronounced without false epenthetic vowels.",
  },

  // Set E - Visarga Aspiration
  {
    id: "BENCH-05-VISARGA",
    category: "visarga",
    title: "Visarga Phonetics (विसर्ग उच्चारण)",
    text: "रामः नमः हरिः पुरुषः शान्तिः गुरुः।",
    expectedFeatures: ["terminal-visarga", "pre-vowel-coloration", "reverent-decay"],
    description: "Ensures visarga (ः) is audibly voiced with authentic unforced breath aspiration.",
  },

  // Set F - Anusvāra & Nasal Assimilation
  {
    id: "BENCH-06-ANUSVARA",
    category: "anusvara",
    title: "Anusvāra & Assimilation (अनुस्वार)",
    text: "संस्कृतम् संसारः गङ्गा आनन्दम् शान्तिम्।",
    expectedFeatures: ["anusvara", "guttural-nasal", "labial-nasal", "vowel-nasalization"],
    description: "Evaluates nasal resonance before various stop consonants.",
  },

  // Set G - Long Sanskrit Compounds (Samāsa)
  {
    id: "BENCH-07-COMPOUNDS",
    category: "long-compounds",
    title: "Authentic Scriptural Samāsa (दीर्घ समास)",
    text: "सर्वभूतहितेरताः अनन्यचेताःसततं यदृच्छालाभसन्तुष्टो योगस्थःकुरुकर्माणि।",
    expectedFeatures: ["compound-pacing", "syllable-timing", "sandhi-transition"],
    description: "Tests whether candidate voices maintain intelligibility throughout multi-stem compounds.",
  },

  // Set H - Danda & Metric Verse Cadence
  {
    id: "BENCH-08-DANDA-CADENCE",
    category: "verse-pauses",
    title: "Half-Verse & Full-Verse Pauses (दण्ड विराम)",
    text: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    expectedFeatures: ["danda-half-pause", "dvidanda-full-pause", "rhythmic-meter"],
    description: "Verifies that single danda (।) and double danda (॥) produce natural pauses.",
  },

  // Set I - Canonical Bhagavad Gita 2.47
  {
    id: "BENCH-09-GITA-2-47",
    category: "canonical-verse",
    title: "Canonical Bhagavad Gita 2.47 (कर्मण्येवाधिकारस्ते)",
    text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    expectedFeatures: [
      "danda",
      "dvidanda",
      "anusvara",
      "avagraha",
      "conjuncts",
      "long-compound",
      "vedic-reverence",
    ],
    description: "The primary canonical liturgical benchmark verse for SutraSparsh shloka certification.",
  },

  // Set J - Short Devotional Passage & Sacred Om
  {
    id: "BENCH-10-DEVOTIONAL-PASSAGE",
    category: "devotional-passage",
    title: "Sacred Shanti Mantra & Om (शान्ति मन्त्र)",
    text: "ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥ ॐ शान्तिः शान्तिः शान्तिः॥",
    expectedFeatures: [
      "sacred-om-resonance",
      "devotional-cadence",
      "shanti-triad",
      "unhurried-tempo",
    ],
    description: "Assesses devotional suitability, sacred Om resonance, and meditative prayer flow.",
  },
];
