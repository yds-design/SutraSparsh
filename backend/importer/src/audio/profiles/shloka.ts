/**
 * Sanskrit Audio Profile Definitions
 *
 * Configures pacing, pause strategies, and metric cadences for different
 * classes of sacred Sanskrit and devotional content.
 */

import { AudioProfileConfig, SanskritAudioProfile } from "../types.js";

export const AUDIO_PROFILES: Record<SanskritAudioProfile, AudioProfileConfig> = {
  shloka_recitation: {
    id: "shloka_recitation",
    name: "Shloka Recitation (श्लोक-पाठ)",
    description: "Reverent, unhurried recitation for Bhagavad Gita and classical meters (Anushtubh, etc.)",
    recommendedPace: 0.88,
    pauseStrategy: "danda",
    dandaPauseMs: 350,
    dvidandaPauseMs: 700,
    preferredVoices: ["hi-IN-Chirp3-HD-Deva", "hi-IN-Neural2-A"],
  },

  mantra_recitation: {
    id: "mantra_recitation",
    name: "Mantra Japa & Chanting (मन्त्र-जप)",
    description: "Resonant, deliberate cadence with extended vocalization on Om and sacred seed syllables",
    recommendedPace: 0.82,
    pauseStrategy: "danda",
    dandaPauseMs: 400,
    dvidandaPauseMs: 850,
    preferredVoices: ["hi-IN-Chirp3-HD-Deva", "hi-IN-Neural2-B"],
  },

  sutra_recitation: {
    id: "sutra_recitation",
    name: "Sutra Aphorism (सूत्र-पाठ)",
    description: "Crisp, concise, highly intelligible pronunciation for Patanjali Yoga Sutras",
    recommendedPace: 0.90,
    pauseStrategy: "danda",
    dandaPauseMs: 300,
    dvidandaPauseMs: 600,
    preferredVoices: ["hi-IN-Chirp3-HD-Deva", "hi-IN-Neural2-A"],
  },

  stotra_recitation: {
    id: "stotra_recitation",
    name: "Stotra & Hymn (स्तोत्र-गान)",
    description: "Melodious, flowing devotional recitation for Shiva Tandava, Vishnu Sahasranama, etc.",
    recommendedPace: 0.92,
    pauseStrategy: "danda",
    dandaPauseMs: 300,
    dvidandaPauseMs: 650,
    preferredVoices: ["hi-IN-Chirp3-HD-Deva", "hi-IN-Neural2-B"],
  },

  chalisa_recitation: {
    id: "chalisa_recitation",
    name: "Chalisa Recitation (चालीसा-पाठ)",
    description: "Rhythmic Avadhi/Sanskritized chaupai cadence with steady devotional tempo",
    recommendedPace: 0.95,
    pauseStrategy: "punctuation",
    dandaPauseMs: 280,
    dvidandaPauseMs: 550,
    preferredVoices: ["hi-IN-Neural2-A", "hi-IN-Chirp3-HD-Deva"],
  },

  scripture_narration: {
    id: "scripture_narration",
    name: "Epic & Scripture Narration (कथा-वाचन)",
    description: "Expressive narrative storytelling for Mahabharata, Ramayana, and Puranas",
    recommendedPace: 0.98,
    pauseStrategy: "punctuation",
    dandaPauseMs: 250,
    dvidandaPauseMs: 500,
    preferredVoices: ["hi-IN-Journey-D", "hi-IN-Neural2-A"],
  },

  meaning_narration: {
    id: "meaning_narration",
    name: "Philosophical Meaning (भावार्थ-कथन)",
    description: "Clear pedagogical narration explaining spiritual commentary and Sanskrit translation",
    recommendedPace: 1.0,
    pauseStrategy: "punctuation",
    dandaPauseMs: 250,
    dvidandaPauseMs: 500,
    preferredVoices: ["hi-IN-Neural2-A", "hi-IN-Journey-D"],
  },

  introduction: {
    id: "introduction",
    name: "App Guided Introduction (मार्गदर्शन)",
    description: "Warm, welcoming orientation and guidance for contemplative practice",
    recommendedPace: 1.0,
    pauseStrategy: "punctuation",
    dandaPauseMs: 250,
    dvidandaPauseMs: 500,
    preferredVoices: ["hi-IN-Neural2-A", "hi-IN-Chirp3-HD-Deva"],
  },
};

export function getAudioProfile(profileId: SanskritAudioProfile): AudioProfileConfig {
  const profile = AUDIO_PROFILES[profileId];
  if (!profile) {
    return AUDIO_PROFILES.shloka_recitation;
  }
  return profile;
}
