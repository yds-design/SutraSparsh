/**
 * TypeScript Type Definitions for src/services/bhashiniService.js
 */

import type {
  BhashiniCredentials,
  BhashiniTTSRequest,
  BhashiniTTSResponse,
  VoiceGender,
} from "../types/bhashini";

export * from "../types/bhashini";

export declare class BhashiniServiceError extends Error {
  code: string | number;
  status?: number;
  isRetryable: boolean;
  details?: unknown;
  timestamp: number;
  constructor(
    message: string,
    options?: {
      code?: string | number;
      status?: number;
      isRetryable?: boolean;
      details?: unknown;
    }
  );
}

export declare const SUPPORTED_INDIC_LANGUAGES: Record<
  string,
  { code: string; name: string; native: string; script: string }
>;

export declare class BhashiniService {
  constructor();
  getProxyConfig(): {
    mode: "server-proxy";
    proxyEndpoint: string;
    pipelineId: string;
  };
  isConfigured(): {
    isConfigured: boolean;
    mode: "server-proxy";
    secretsExposedOnClient: boolean;
  };
  synthesizeSpeech(request: BhashiniTTSRequest): Promise<BhashiniTTSResponse>;
  playAudio(
    audioUrlOrBase64: string,
    options?: {
      playbackRate?: number;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): {
    audio: HTMLAudioElement;
    play: () => Promise<void>;
    pause: () => void;
    stop: () => void;
  };
  base64ToBlobUrl(base64: string, mimeType?: string): string;
  downloadAudio(audioUrlOrBase64: string, filename?: string): void;
  validateLanguageCode(langCode?: string): string;
}

export declare const bhashiniService: BhashiniService;
export default bhashiniService;
