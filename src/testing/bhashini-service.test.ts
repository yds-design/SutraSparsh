/**
 * Comprehensive System & Unit Tests for Bhashini Localization & Voice Intelligence Service
 * Validates:
 * - FR-01: Secure Credential Initialization & Auth Headers
 * - FR-02: Pipeline Compute Service & Payload Construction
 * - FR-03: Error Handling & Exponential Backoff Retry Logic
 */

import { bhashiniService, BhashiniServiceError, SUPPORTED_INDIC_LANGUAGES } from "../services/bhashiniService.js";

async function runBhashiniServiceTests() {
  console.log("=================================================");
  console.log("🧪 Running SutraSparsh Bhashini Service Test Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Server-Side Proxy Configuration & Zero Exposed Client Secrets (FR-01)
  // ---------------------------------------------------------------------------
  console.log("--- 1. Testing Server-Proxy Mode & Zero Client Secrets (FR-01) ---");
  const proxyConfig = bhashiniService.getProxyConfig();
  assert(proxyConfig.mode === "server-proxy", "Bhashini operates in secure server-proxy mode");
  assert(proxyConfig.proxyEndpoint === "/api/tts/synthesize", "Routes synthesis through /api/tts/synthesize");
  assert(Boolean(proxyConfig.pipelineId), "Non-secret ULCA pipelineId metadata present");

  const configStatus = bhashiniService.isConfigured();
  assert(configStatus.isConfigured === true, "Service proxy is configured");
  assert(configStatus.secretsExposedOnClient === false, "Zero Bhashini secrets exposed on client");
  assert(
    typeof (bhashiniService as any).getCredentials !== "function" &&
      typeof (bhashiniService as any).getAuthHeaders !== "function",
    "Client-side credential & auth header builders are removed"
  );

  // ---------------------------------------------------------------------------
  // TEST 2: Language Code Validation & Mapping (FR-02)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Testing Language Validation (FR-02) ---");
  assert(bhashiniService.validateLanguageCode("sa") === "sa", "Validates Sanskrit code 'sa'");
  assert(bhashiniService.validateLanguageCode("hi") === "hi", "Validates Hindi code 'hi'");
  assert(bhashiniService.validateLanguageCode("mr") === "mr", "Validates Marathi code 'mr'");
  assert(bhashiniService.validateLanguageCode("ta") === "ta", "Validates Tamil code 'ta'");
  assert(bhashiniService.validateLanguageCode("unknown_lang") === "sa", "Defaults unknown language to 'sa'");
  assert(Boolean(SUPPORTED_INDIC_LANGUAGES.sa), "Language dictionary contains Sanskrit metadata");

  // ---------------------------------------------------------------------------
  // TEST 3: Input Validation & Empty Text Rejection (FR-02)
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Testing Input Validation & Error Handling (FR-02/03) ---");
  let caughtEmptyError = false;
  try {
    // @ts-ignore
    await bhashiniService.synthesizeSpeech({ text: "   " });
  } catch (err: any) {
    caughtEmptyError = true;
    assert(err instanceof BhashiniServiceError, "Throws BhashiniServiceError on empty text");
    assert(err.code === "VALIDATION_EMPTY_TEXT", "Error code is VALIDATION_EMPTY_TEXT");
  }
  assert(caughtEmptyError, "Rejects empty or whitespace-only text");

  // ---------------------------------------------------------------------------
  // TEST 4: Exponential Backoff & Retry Mechanism (FR-03)
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Testing Exponential Backoff Retry Mechanism (FR-03) ---");
  let retryAttemptsRecorded = 0;
  let simulatedFailureCount = 0;

  try {
    await (bhashiniService as any)._executeWithExponentialBackoff(
      async () => {
        simulatedFailureCount++;
        if (simulatedFailureCount <= 2) {
          throw new BhashiniServiceError("Simulated 504 Gateway Timeout", {
            code: "HTTP_504",
            status: 504,
            isRetryable: true,
          });
        }
        return "SUCCESS_AFTER_RETRIES";
      },
      {
        maxRetries: 3,
        baseDelayMs: 50,
        maxDelayMs: 200,
        onRetry: (attempt: number) => {
          retryAttemptsRecorded = attempt;
        },
      }
    );
    assert(retryAttemptsRecorded === 2, `Exponential backoff retried exactly 2 times (recorded: ${retryAttemptsRecorded})`);
    assert(simulatedFailureCount === 3, "Simulated call succeeded on 3rd attempt");
  } catch (err: any) {
    assert(false, "Exponential backoff failed unexpectedly", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Non-Retryable 401/403 Handling (FR-03)
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Testing Non-Retryable Auth Rejections (FR-03) ---");
  let nonRetryableCallCount = 0;
  try {
    await (bhashiniService as any)._executeWithExponentialBackoff(
      async () => {
        nonRetryableCallCount++;
        throw new BhashiniServiceError("Bhashini authorization rejected (HTTP 401)", {
          code: "HTTP_401",
          status: 401,
          isRetryable: false,
        });
      },
      {
        maxRetries: 3,
        baseDelayMs: 50,
      }
    );
  } catch (err: any) {
    assert(nonRetryableCallCount === 1, "401/403 error is NOT retried (aborts on 1st attempt)");
    assert(err.status === 401, "Error preserves HTTP 401 status");
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Resilient Audio Synthesis & Offline Vedic Harmonic Engine (FR-02)
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. Testing End-to-End Speech Synthesis (FR-02) ---");
  const testVerse = "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥";
  const synthesisResult = await bhashiniService.synthesizeSpeech({
    text: testVerse,
    sourceLanguage: "sa",
    gender: "female",
    pace: 0.80,
    failsafeFallback: true,
    enableCache: true,
  });

  assert(Boolean(synthesisResult.audioContent), "Synthesis returned base64 audio content");
  assert(synthesisResult.mimeType === "audio/wav", "Mime type is audio/wav");
  assert(synthesisResult.sourceLanguage === "sa", "Source language preserved as 'sa'");
  assert(synthesisResult.gender === "female", "Gender preserved as 'female'");
  assert(synthesisResult.characterCount === testVerse.length, "Character count matches text length");
  assert(synthesisResult.audioContent.length > 100, "Base64 audio payload has valid audio byte length");

  // ---------------------------------------------------------------------------
  // TEST 7: Audio Caching Check
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. Testing Audio Caching ---");
  const cachedSynthesis = await bhashiniService.synthesizeSpeech({
    text: testVerse,
    sourceLanguage: "sa",
    gender: "female",
    pace: 0.80,
    enableCache: true,
  });

  assert(cachedSynthesis.cached === true, "Subsequent synthesis call served immediately from cache");
  assert(cachedSynthesis.latencyMs < 50, `Cached synthesis latency is sub-50ms (actual: ${cachedSynthesis.latencyMs}ms)`);

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBhashiniServiceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
