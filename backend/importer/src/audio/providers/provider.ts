/**
 * SutraSparsh Text-to-Speech Provider Abstraction
 *
 * Decouples SutraSparsh from any single vendor (Google Cloud TTS, AWS Polly,
 * Azure, ElevenLabs, or Human Studio Recordings).
 */

import {
  TtsProviderId,
  TtsVoiceMetadata,
  TtsSynthesisRequest,
  TtsSynthesisResponse,
  SanskritAudioProfile,
} from "../types.js";

export interface TtsProvider {
  readonly id: TtsProviderId;
  readonly name: string;

  /**
   * Discovers and retrieves available candidate voices from the provider.
   */
  listVoices(languageCode?: string): Promise<TtsVoiceMetadata[]>;

  /**
   * Retrieves metadata for a specific voice ID.
   */
  getVoice(voiceId: string): Promise<TtsVoiceMetadata | undefined>;

  /**
   * Synthesizes audio for the given Sanskrit input and profile.
   */
  synthesize(request: TtsSynthesisRequest): Promise<TtsSynthesisResponse>;

  /**
   * Checks whether a voice supports the required capabilities of an audio profile.
   */
  isProfileSupported(voiceId: string, profile: SanskritAudioProfile): Promise<boolean>;
}

// Global registry of providers
const providerRegistry = new Map<TtsProviderId, TtsProvider>();

export function registerTtsProvider(provider: TtsProvider): void {
  providerRegistry.set(provider.id, provider);
}

export function getTtsProvider(providerId: TtsProviderId = "google-cloud-tts"): TtsProvider {
  const provider = providerRegistry.get(providerId);
  if (!provider) {
    throw new Error(
      `TTS Provider "${providerId}" is not registered. Available providers: ${Array.from(providerRegistry.keys()).join(", ")}`
    );
  }
  return provider;
}
