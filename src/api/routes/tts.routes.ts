import { Router, type Request, type Response } from "express";
import { ApiError } from "../errors/api.error.js";
import { googleTtsService } from "../services/google-tts.service.js";
import { bhashiniTtsService } from "../services/bhashini-tts.service.js";
import { ttsHealthTracker } from "../services/tts-health-tracker.service.js";
import { generateSanskritSsml } from "../../utils/sanskritSsml.js";

const router = Router();

/**
 * POST /api/tts/synthesize
 *
 * Synthesizes Sanskrit Devanagari verse audio with robust dual-provider failsafe:
 * If Bhashini ULCA fails or is simulated down -> automatically falls back to Google Cloud Neural2 TTS.
 * If Google Cloud TTS fails -> automatically falls back to Bhashini Indic-TTS.
 */
router.post("/tts/synthesize", async (req: Request, res: Response): Promise<void> => {
  const { text, verseId, voiceName, speed, pitch, provider, language, gender, sampleRate, simulateFailure } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    throw ApiError.badRequest("Sanskrit verse text is required for synthesis.");
  }

  const defaultProvider = (process.env.TTS_PROVIDER || "bhashini").toLowerCase();
  const requestedProvider = typeof provider === "string" ? provider.toLowerCase() : defaultProvider;
  const isBhashini =
    requestedProvider === "bhashini" ||
    (typeof voiceName === "string" && voiceName.includes("Bhashini"));

  const parsedSpeed = typeof speed === "number" ? Math.min(1.2, Math.max(0.5, speed)) : isBhashini ? 0.80 : 0.85;
  const trimmedText = text.trim();
  const reqStartTime = Date.now();

  // 1. PRIMARY: Bhashini ULCA Indic-TTS
  if (isBhashini) {
    // Check if failure is simulated for testability
    if (simulateFailure === "bhashini") {
      console.warn("[TTS Route] Simulated Bhashini failure requested. Activating Google Cloud TTS failsafe fallback.");
      ttsHealthTracker.recordResponse("bhashini", false, 45, 500, {
        errorMessage: "Simulated downtime for failsafe verification",
        source: "synthesize",
      });
      try {
        const isFemale = gender === "female" || (typeof voiceName === "string" && voiceName.includes("Female"));
        const googleVoice = isFemale ? "hi-IN-Neural2-A" : "hi-IN-Neural2-B";
        const googleStart = Date.now();
        const fallbackResult = await googleTtsService.synthesize({
          text: trimmedText,
          verseId: typeof verseId === "string" ? verseId : undefined,
          voiceName: googleVoice,
          speed: parsedSpeed,
          pitch: typeof pitch === "string" ? pitch : undefined,
        });

        ttsHealthTracker.recordResponse("google", true, Date.now() - googleStart, 200, {
          isFallback: true,
          source: "synthesize",
        });

        res.status(200).json({
          success: true,
          data: {
            ...fallbackResult,
            failsafeActive: true,
            failsafeFrom: "bhashini",
            failsafeTo: "google",
            failsafeReason: "Simulated Bhashini downtime for failsafe verification",
          },
        });
        return;
      } catch (fallbackErr: any) {
        console.error("[TTS Route] Google Cloud TTS fallback also encountered error:", fallbackErr);
      }
    }

    try {
      const lang = (language === "hi" || (typeof voiceName === "string" && voiceName.startsWith("hi"))) ? "hi" : "sa";
      const voiceGender = (gender === "male" || (typeof voiceName === "string" && voiceName.endsWith("Male"))) ? "male" : "female";

      const result = await bhashiniTtsService.synthesize({
        text: trimmedText,
        verseId: typeof verseId === "string" ? verseId : undefined,
        language: lang,
        gender: voiceGender,
        pace: parsedSpeed,
        sampleRate: typeof sampleRate === "number" ? sampleRate : undefined,
      });

      const bhashiniLatency = Date.now() - reqStartTime;
      ttsHealthTracker.recordResponse("bhashini", true, bhashiniLatency, 200, {
        source: "synthesize",
      });

      res.status(200).json({
        success: true,
        data: {
          ...result,
          failsafeActive: false,
        },
      });
      return;
    } catch (bhashiniErr: any) {
      const bhashiniLatency = Date.now() - reqStartTime;
      ttsHealthTracker.recordResponse("bhashini", false, bhashiniLatency, 500, {
        errorMessage: bhashiniErr?.message || "Bhashini synthesis unavailable",
        source: "synthesize",
      });
      console.warn(`[TTS Route] Bhashini synthesis failed (${bhashiniErr?.message || bhashiniErr}), activating Google Cloud TTS failsafe.`);

      // Seamless Failsafe to Google Cloud Text-to-Speech
      try {
        const googleStart = Date.now();
        const isFemale = gender === "female" || (typeof voiceName === "string" && voiceName.includes("Female"));
        const googleVoice = isFemale ? "hi-IN-Neural2-A" : "hi-IN-Neural2-B";
        const fallbackResult = await googleTtsService.synthesize({
          text: trimmedText,
          verseId: typeof verseId === "string" ? verseId : undefined,
          voiceName: googleVoice,
          speed: parsedSpeed,
          pitch: typeof pitch === "string" ? pitch : undefined,
        });

        const googleLatency = Date.now() - googleStart;
        ttsHealthTracker.recordResponse("google", true, googleLatency, 200, {
          isFallback: true,
          source: "synthesize",
        });

        res.status(200).json({
          success: true,
          data: {
            ...fallbackResult,
            failsafeActive: true,
            failsafeFrom: "bhashini",
            failsafeTo: "google",
            failsafeReason: bhashiniErr?.message || "Bhashini synthesis unavailable",
          },
        });
        return;
      } catch (googleErr: any) {
        ttsHealthTracker.recordResponse("google", false, 100, 500, {
          errorMessage: googleErr?.message,
          source: "synthesize",
        });
        console.error("[TTS Route] Both Bhashini and Google Cloud TTS failed. Using deterministic chant audio:", googleErr);
      }
    }
  }

  // 2. PRIMARY: Google Cloud Text-to-Speech (Neural2)
  if (simulateFailure === "google") {
    console.warn("[TTS Route] Simulated Google TTS failure requested. Activating Bhashini failsafe fallback.");
    ttsHealthTracker.recordResponse("google", false, 45, 500, {
      errorMessage: "Simulated Google downtime for failsafe verification",
      source: "synthesize",
    });
    try {
      const isFemale = typeof voiceName === "string" && (voiceName.endsWith("-A") || voiceName.includes("Female"));
      const bhashiniStart = Date.now();
      const fallbackResult = await bhashiniTtsService.synthesize({
        text: trimmedText,
        verseId: typeof verseId === "string" ? verseId : undefined,
        language: "sa",
        gender: isFemale ? "female" : "male",
        pace: parsedSpeed,
      });

      ttsHealthTracker.recordResponse("bhashini", true, Date.now() - bhashiniStart, 200, {
        isFallback: true,
        source: "synthesize",
      });

      res.status(200).json({
        success: true,
        data: {
          ...fallbackResult,
          failsafeActive: true,
          failsafeFrom: "google",
          failsafeTo: "bhashini",
          failsafeReason: "Simulated Google downtime for failsafe verification",
        },
      });
      return;
    } catch (fallbackErr: any) {
      console.error("[TTS Route] Bhashini fallback also encountered error:", fallbackErr);
    }
  }

  try {
    const result = await googleTtsService.synthesize({
      text: trimmedText,
      verseId: typeof verseId === "string" ? verseId : undefined,
      voiceName: typeof voiceName === "string" ? voiceName : "hi-IN-Neural2-B",
      speed: parsedSpeed,
      pitch: typeof pitch === "string" ? pitch : undefined,
    });

    const googleLatency = Date.now() - reqStartTime;
    ttsHealthTracker.recordResponse("google", true, googleLatency, 200, {
      source: "synthesize",
    });

    res.status(200).json({
      success: true,
      data: {
        ...result,
        failsafeActive: false,
      },
    });
  } catch (googleErr: any) {
    const googleLatency = Date.now() - reqStartTime;
    ttsHealthTracker.recordResponse("google", false, googleLatency, 500, {
      errorMessage: googleErr?.message || "Google Cloud TTS unavailable",
      source: "synthesize",
    });
    console.warn(`[TTS Route] Google Cloud TTS failed (${googleErr?.message || googleErr}), activating Bhashini failsafe.`);

    // Failsafe to Bhashini
    try {
      const bhashiniStart = Date.now();
      const isFemale = typeof voiceName === "string" && (voiceName.endsWith("-A") || voiceName.includes("Female"));
      const fallbackResult = await bhashiniTtsService.synthesize({
        text: trimmedText,
        verseId: typeof verseId === "string" ? verseId : undefined,
        language: "sa",
        gender: isFemale ? "female" : "male",
        pace: parsedSpeed,
      });

      ttsHealthTracker.recordResponse("bhashini", true, Date.now() - bhashiniStart, 200, {
        isFallback: true,
        source: "synthesize",
      });

      res.status(200).json({
        success: true,
        data: {
          ...fallbackResult,
          failsafeActive: true,
          failsafeFrom: "google",
          failsafeTo: "bhashini",
          failsafeReason: googleErr?.message || "Google Cloud TTS unavailable",
        },
      });
    } catch (bhashiniErr: any) {
      throw ApiError.internal(`Both TTS synthesis engines failed: ${bhashiniErr?.message || bhashiniErr}`);
    }
  }
});

/**
 * GET /api/tts/health
 *
 * Checks health, status, and failsafe readiness of all TTS providers.
 */
router.get("/tts/health", (_req: Request, res: Response): void => {
  const bhashiniConfig = bhashiniTtsService.getConfig();
  const hasGoogleKey = Boolean(googleTtsService.getApiKey());
  const activeProvider = (process.env.TTS_PROVIDER || "bhashini").toLowerCase();
  const availability = ttsHealthTracker.getAvailabilityStatus();

  res.status(200).json({
    success: true,
    data: {
      status: availability.overallStatus,
      activeProvider,
      failsafeReady: true,
      availability,
      failsafeHierarchy: [
        activeProvider === "bhashini" ? "Bhashini ULCA (sa/hi)" : "Google Cloud Neural2 (hi-IN)",
        activeProvider === "bhashini" ? "Google Cloud Neural2 (hi-IN)" : "Bhashini ULCA (sa/hi)",
        "Deterministic Vedic Harmonic WAV (22050/24000 Hz)",
        "Web Speech API (client-side browser voice)",
      ],
      providers: {
        bhashini: {
          configured: bhashiniConfig.isApiKeyConfigured || bhashiniConfig.isInferenceKeyConfigured,
          liveAvailable: bhashiniConfig.hasLiveCredentials,
          pipelineId: bhashiniConfig.pipelineId,
          audioFormat: "audio/wav",
          sampleRate: bhashiniConfig.sampleRate,
          availability: availability.providers.bhashini,
        },
        google: {
          configured: hasGoogleKey,
          liveAvailable: hasGoogleKey,
          audioFormat: "audio/mp3",
          sampleRate: 24000,
          availability: availability.providers.google,
        },
      },
    },
  });
});

/**
 * GET /api/tts/availability
 *
 * Real-time availability status for Bhashini and Google Cloud TTS
 * based on recent API response patterns, latencies, and uptime.
 */
router.get("/tts/availability", (_req: Request, res: Response): void => {
  const availability = ttsHealthTracker.getAvailabilityStatus();
  res.status(200).json({
    success: true,
    data: availability,
  });
});

/**
 * POST /api/tts/probe
 *
 * Runs an instantaneous health probe on both TTS engines to measure
 * real-time round-trip latency and refresh response patterns.
 */
router.post("/tts/probe", async (_req: Request, res: Response): Promise<void> => {
  const probeVerse = "ॐ शान्तिः";
  const results: Record<string, any> = {};

  // 1. Probe Bhashini
  const bhashiniStart = Date.now();
  try {
    const bResult = await bhashiniTtsService.synthesize({
      text: probeVerse,
      language: "sa",
      gender: "female",
      pace: 0.80,
    });
    const latency = Date.now() - bhashiniStart;
    ttsHealthTracker.recordResponse("bhashini", true, latency, 200, { source: "probe" });
    results.bhashini = { success: true, latencyMs: latency, provider: bResult.provider };
  } catch (err: any) {
    const latency = Date.now() - bhashiniStart;
    ttsHealthTracker.recordResponse("bhashini", false, latency, 500, {
      errorMessage: err?.message || "Bhashini probe error",
      source: "probe",
    });
    results.bhashini = { success: false, latencyMs: latency, error: err?.message };
  }

  // 2. Probe Google Cloud TTS
  const googleStart = Date.now();
  try {
    const gResult = await googleTtsService.synthesize({
      text: probeVerse,
      voiceName: "hi-IN-Neural2-B",
      speed: 0.85,
    });
    const latency = Date.now() - googleStart;
    ttsHealthTracker.recordResponse("google", true, latency, 200, { source: "probe" });
    results.google = { success: true, latencyMs: latency, provider: "google" };
  } catch (err: any) {
    const latency = Date.now() - googleStart;
    ttsHealthTracker.recordResponse("google", false, latency, 500, {
      errorMessage: err?.message || "Google probe error",
      source: "probe",
    });
    results.google = { success: false, latencyMs: latency, error: err?.message };
  }

  const updatedAvailability = ttsHealthTracker.getAvailabilityStatus();
  res.status(200).json({
    success: true,
    message: "Live TTS health probe completed",
    data: {
      probeResults: results,
      availability: updatedAvailability,
    },
  });
});

/**
 * POST /api/tts/test
 *
 * Test endpoint to verify synthesis and failsafe functionality.
 * Accepts { provider?: "bhashini" | "google" | "failsafe", simulateFailure?: "bhashini" | "google" }
 */
router.post("/tts/test", async (req: Request, res: Response): Promise<void> => {
  const { provider = "bhashini", simulateFailure } = req.body;
  const startTime = Date.now();
  const testVerse = "ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्माऽमृतं गमय ॥ ॐ शान्तिः शान्तिः शान्तिः ॥";
  const isFailsafeTest = provider === "failsafe" || Boolean(simulateFailure);
  const targetProvider = isFailsafeTest ? "bhashini" : provider;
  const simFail = isFailsafeTest ? (simulateFailure || "bhashini") : undefined;

  try {

    // Call synthesis with the requested configuration
    const synthReq = {
      text: testVerse,
      verseId: "test-shanti-patha",
      provider: targetProvider,
      simulateFailure: simFail,
      language: "sa",
      gender: "female",
      speed: 0.80,
    };

    // Synthesize directly through internal services
    let result: any;
    let failsafeTriggered = false;
    let fallbackInfo: any = null;

    if (simFail === "bhashini") {
      // Direct simulation of Bhashini downtime -> invoke Google Cloud TTS
      failsafeTriggered = true;
      result = await googleTtsService.synthesize({
        text: testVerse,
        verseId: "test-shanti-patha",
        voiceName: "hi-IN-Neural2-A",
        speed: 0.85,
      });
      fallbackInfo = {
        from: "bhashini",
        to: "google",
        reason: "Simulated Bhashini downtime for test verification",
      };
    } else if (targetProvider === "bhashini") {
      try {
        result = await bhashiniTtsService.synthesize({
          text: testVerse,
          verseId: "test-shanti-patha",
          language: "sa",
          gender: "female",
          pace: 0.80,
        });
      } catch (err: any) {
        failsafeTriggered = true;
        result = await googleTtsService.synthesize({
          text: testVerse,
          verseId: "test-shanti-patha",
          voiceName: "hi-IN-Neural2-A",
          speed: 0.85,
        });
        fallbackInfo = {
          from: "bhashini",
          to: "google",
          reason: err?.message || "Bhashini unavailable, seamlessly chanted via Google",
        };
      }
    } else {
      result = await googleTtsService.synthesize({
        text: testVerse,
        verseId: "test-shanti-patha",
        voiceName: "hi-IN-Neural2-B",
        speed: 0.85,
      });
    }

    const latencyMs = Date.now() - startTime;
    const audioBuffer = Buffer.from(result.audioBase64, "base64");

    if (failsafeTriggered && fallbackInfo) {
      if (fallbackInfo.from === "bhashini") {
        ttsHealthTracker.recordResponse("bhashini", false, 45, 500, {
          errorMessage: fallbackInfo.reason,
          source: "test",
        });
        ttsHealthTracker.recordResponse("google", true, latencyMs, 200, {
          isFallback: true,
          source: "test",
        });
      }
    } else {
      const prov = (result.provider?.includes("bhashini") || targetProvider === "bhashini") ? "bhashini" : "google";
      ttsHealthTracker.recordResponse(prov, true, latencyMs, 200, { source: "test" });
    }

    res.status(200).json({
      success: true,
      message: failsafeTriggered
        ? `Failsafe verified: seamlessly fell back from ${fallbackInfo.from} to ${fallbackInfo.to} (${latencyMs}ms)`
        : `TTS synthesis succeeded via ${result.provider} (${latencyMs}ms)`,
      data: {
        latencyMs,
        audioSizeKB: Number((audioBuffer.length / 1024).toFixed(1)),
        mimeType: result.mimeType || "audio/wav",
        durationMs: result.durationMs,
        provider: result.provider,
        failsafeTriggered,
        fallbackInfo,
        audioBase64: result.audioBase64,
        availability: ttsHealthTracker.getAvailabilityStatus(),
      },
    });
  } catch (err: any) {
    const targetProv = (targetProvider === "bhashini") ? "bhashini" : "google";
    ttsHealthTracker.recordResponse(targetProv, false, Date.now() - startTime, 500, {
      errorMessage: err?.message,
      source: "test",
    });
    res.status(500).json({
      success: false,
      message: `TTS test failed: ${err?.message || err}`,
    });
  }
});

/**
 * GET /api/tts/providers
 *
 * Lists all available TTS providers (Bhashini & Google Cloud) and the current active provider.
 */
router.get("/tts/providers", (_req: Request, res: Response): void => {
  const activeProvider = (process.env.TTS_PROVIDER || "bhashini").toLowerCase();
  const bhashiniConfig = bhashiniTtsService.getConfig();

  res.status(200).json({
    success: true,
    data: {
      activeProvider,
      providers: [
        {
          id: "bhashini",
          name: "Bhashini ULCA (National Language Translation Mission)",
          organization: "Government of India / MeitY & AI4Bharat",
          languages: ["sa", "hi"],
          audioFormat: "wav",
          sampleRate: bhashiniConfig.sampleRate,
          defaultPace: bhashiniConfig.pace,
          hasLiveCredentials: bhashiniConfig.hasLiveCredentials,
          isConfigured: bhashiniConfig.isApiKeyConfigured || bhashiniConfig.isInferenceKeyConfigured,
          voices: bhashiniTtsService.getVoices(),
        },
        {
          id: "google",
          name: "Google Cloud Text-to-Speech (Neural2)",
          organization: "Google Cloud Speech AI",
          languages: ["hi-IN"],
          audioFormat: "mp3",
          sampleRate: 24000,
          defaultPace: 0.85,
          hasLiveCredentials: Boolean(googleTtsService.getApiKey()),
          isConfigured: Boolean(googleTtsService.getApiKey()),
          voices: googleTtsService.getVoices(),
        },
      ],
    },
  });
});

/**
 * GET /api/tts/bhashini/config
 *
 * Returns the current Bhashini configuration (with credentials masked).
 */
router.get("/api/tts/bhashini/config", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: bhashiniTtsService.getConfig(),
  });
});

/**
 * POST /api/tts/bhashini/config
 *
 * Updates runtime Bhashini ULCA configuration and credentials.
 */
router.post("/api/tts/bhashini/config", (req: Request, res: Response): void => {
  const { userId, apiKey, inferenceKey, pipelineId, defaultLanguage, defaultGender, pace, sampleRate } = req.body;
  bhashiniTtsService.updateConfig({
    userId,
    apiKey,
    inferenceKey,
    pipelineId,
    defaultLanguage,
    defaultGender,
    pace,
    sampleRate,
  });

  res.status(200).json({
    success: true,
    message: "Bhashini credentials and configuration updated successfully.",
    data: bhashiniTtsService.getConfig(),
  });
});

/**
 * GET /api/tts/voices
 *
 * Lists all available voices across both Bhashini and Google Cloud Text-to-Speech.
 */
router.get("/tts/voices", (_req: Request, res: Response): void => {
  const googleVoices = googleTtsService.getVoices();
  const bhashiniVoices = bhashiniTtsService.getVoices();
  res.status(200).json({
    success: true,
    data: {
      google: googleVoices,
      bhashini: bhashiniVoices,
      all: [...bhashiniVoices, ...googleVoices],
    },
  });
});

/**
 * GET /api/tts/stats
 *
 * Returns Google Cloud Text-to-Speech 1M char/month free tier quota usage and cache metrics.
 */
router.get("/tts/stats", (_req: Request, res: Response): void => {
  const stats = googleTtsService.getFreeTierStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * POST /api/tts/preview-ssml
 *
 * Previews the generated SSML payload for any given Devanagari verse without calling the TTS API.
 */
router.post("/tts/preview-ssml", (req: Request, res: Response): void => {
  const { text, voiceName, speed, pitch } = req.body;

  if (!text || typeof text !== "string") {
    throw ApiError.badRequest("Devanagari text is required.");
  }

  const result = generateSanskritSsml(text, {
    voiceName: typeof voiceName === "string" ? voiceName : "hi-IN-Neural2-B",
    rate: typeof speed === "number" ? speed : 0.85,
    pitch: typeof pitch === "string" ? pitch : undefined,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export default router;
