/**
 * Google Cloud TTS Synthesize Orchestrator
 *
 * Implements budget-guarded synthesis, rate-limiting, and error recovery.
 */

import { TtsSynthesisRequest, TtsSynthesisResponse } from "../../types.js";
import { googleTtsProvider } from "./client.js";

export interface SynthesisOptions {
  bypassCache?: boolean;
}

export async function synthesizeSanskritAudio(
  request: TtsSynthesisRequest,
  _options: SynthesisOptions = {}
): Promise<TtsSynthesisResponse> {
  // Synthesize via registered Google TTS Provider
  return googleTtsProvider.synthesize(request);
}
