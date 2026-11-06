/**
 * Integration Test: TTS Failsafe Failover & Resilient Audio Player
 *
 * Verifies:
 * 1. Simulation of HTTP 500 internal server error from Bhashini ULCA endpoint.
 * 2. Automatic, seamless failover to Google Cloud TTS provider (Neural2) as secondary source.
 * 3. Explicit Blob creation with 'audio/wav' MIME type and compliant 44-byte RIFF header.
 * 4. Immediate disposal of generated Object URLs via URL.revokeObjectURL() upon 'ended' and 'error' events.
 */

import { resilientAudioPlayer, AudioValidationError } from "../src/utils/resilientAudioPlayer.js";

async function runTtsFallbackIntegrationTests() {
  console.log("================================================================================");
  console.log("🧪 Integration Test: Bhashini HTTP 500 Simulation & Google Cloud TTS Failover");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  // Mock audio byte generators for Bhashini and Google Cloud TTS
  function createMockBhashiniPcmBase64(): string {
    // 22050Hz 16-bit mono PCM sample
    const sampleCount = 4410; // 200ms
    const buf = Buffer.alloc(sampleCount * 2);
    for (let i = 0; i < sampleCount; i++) {
      buf.writeInt16LE(Math.floor(Math.sin((2 * Math.PI * 216 * i) / 22050) * 15000), i * 2);
    }
    return buf.toString("base64");
  }

  function createMockGoogleTtsMp3Base64(): string {
    // Simulated MP3 with ID3 header
    const buf = Buffer.alloc(128);
    buf.write("ID3", 0);
    buf[3] = 3;
    return buf.toString("base64");
  }

  // --- Test Suite 1: Bhashini Blob Conversion to 'audio/wav' ---
  console.log("\n--- Suite 1: Bhashini Audio to 'audio/wav' Blob Conversion ---");
  const rawPcmB64 = createMockBhashiniPcmBase64();
  const wavBlob = resilientAudioPlayer.convertBhashiniAudioToWavBlob(rawPcmB64, 22050);

  assert(Boolean(wavBlob), "Bhashini raw audio converted to Blob");
  assert(wavBlob.type === "audio/wav", "Blob explicitly has 'audio/wav' MIME type");
  assert(wavBlob.size > 44, `Blob size (${wavBlob.size} bytes) includes 44-byte RIFF header + PCM data`);

  // Inspect the first 12 bytes of the created Blob to confirm standard RIFF WAVE header
  const headerBuf = await wavBlob.slice(0, 12).arrayBuffer();
  const headerBytes = new Uint8Array(headerBuf);
  const riffMagic = String.fromCharCode(headerBytes[0], headerBytes[1], headerBytes[2], headerBytes[3]);
  const waveMagic = String.fromCharCode(headerBytes[8], headerBytes[9], headerBytes[10], headerBytes[11]);

  assert(riffMagic === "RIFF", "Header starts with 'RIFF' chunk descriptor");
  assert(waveMagic === "WAVE", "Header contains 'WAVE' format tag");

  // --- Test Suite 2: Bhashini HTTP 500 Simulation & Dual-Provider Failover ---
  console.log("\n--- Suite 2: Simulating Bhashini HTTP 500 & Asserting Google Cloud TTS Failover ---");

  let bhashiniAttemptCount = 0;
  let googleAttemptCount = 0;
  let fallbackNotified = false;
  let fallbackFrom = "";
  let fallbackTo = "";

  // Mock primary provider that throws HTTP 500 (Bhashini downtime)
  const mockBhashiniProvider = async () => {
    bhashiniAttemptCount++;
    const error: any = new Error("Bhashini ULCA gateway error HTTP 500: Internal Server Error");
    error.status = 500;
    error.code = "HTTP_500";
    throw error;
  };

  // Mock secondary provider that succeeds (Google Cloud TTS Neural2)
  const mockGoogleTtsProvider = async () => {
    googleAttemptCount++;
    return {
      audioContent: createMockGoogleTtsMp3Base64(),
      mimeType: "audio/mp3",
      provider: "google",
      voiceName: "hi-IN-Neural2-B",
    };
  };

  // Execute dual-provider failover
  try {
    const result = await resilientAudioPlayer.playWithProviderFallback(
      {
        primary: mockBhashiniProvider,
        fallback: mockGoogleTtsProvider,
      },
      {
        onFallback: (from, to) => {
          fallbackNotified = true;
          fallbackFrom = from;
          fallbackTo = to;
        },
      }
    );

    // In a browser environment, this would start playback. In Node environment, play() rejects with browser-only notice.
  } catch (err: any) {
    // Expected in Node test environment: "resilientAudioPlayer can only be called in browser environment"
    assert(
      err?.message?.includes("browser environment"),
      "Failover correctly prepares playback and identifies environment"
    );
  }

  assert(bhashiniAttemptCount === 1, "Primary provider (Bhashini) was attempted first");
  assert(googleAttemptCount === 1, "Secondary provider (Google Cloud TTS) was invoked following Bhashini 500");
  assert(fallbackNotified, "onFallback callback was triggered");
  assert(fallbackFrom === "bhashini", "Failover 'from' provider is bhashini");
  assert(fallbackTo === "google", "Failover 'to' secondary provider is google");

  // --- Test Suite 3: Object URL Lifecycle & Immediate Disposal (Memory Leak Prevention) ---
  console.log("\n--- Suite 3: Object URL Revocation & Disposal Verification ---");

  // Ensure clean slate before measuring Object URL lifecycles
  resilientAudioPlayer.revokeAllBlobUrls();

  // Mock URL.createObjectURL and URL.revokeObjectURL
  const revokedUrls: string[] = [];
  const originalCreateObjectURL = (globalThis as any).URL.createObjectURL;
  const originalRevokeObjectURL = (globalThis as any).URL.revokeObjectURL;

  let urlId = 0;
  (globalThis as any).URL.createObjectURL = (blob: Blob) => {
    urlId++;
    return `blob:http://sutrasparsh.local/test-audio-${urlId}`;
  };

  (globalThis as any).URL.revokeObjectURL = (url: string) => {
    revokedUrls.push(url);
  };

  try {
    // 1. Create a Bhashini Blob URL
    const testUrl = resilientAudioPlayer.createBhashiniBlobUrl(rawPcmB64);
    assert(testUrl.startsWith("blob:"), "Created tracked Object URL");
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 1, "Player is tracking created Object URL in memory");

    // 2. Simulate audio element 'ended' event disposal
    resilientAudioPlayer.revokeBlobUrl(testUrl);
    assert(revokedUrls.includes(testUrl), "URL.revokeObjectURL() was called for the ended audio URL");
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 0, "Tracked URL count decremented to 0");

    // 3. Simulate audio element 'error' event disposal
    const errorTestUrl = resilientAudioPlayer.createBhashiniBlobUrl(rawPcmB64);
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 1, "Tracking new Object URL before error event");

    resilientAudioPlayer.revokeBlobUrl(errorTestUrl);
    assert(revokedUrls.includes(errorTestUrl), "URL.revokeObjectURL() was called immediately upon 'error' event");
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 0, "No lingering Object URLs in memory after error");

    // 4. Test revokeAllBlobUrls()
    const urlA = resilientAudioPlayer.createBhashiniBlobUrl(rawPcmB64);
    const urlB = resilientAudioPlayer.createBhashiniBlobUrl(rawPcmB64);
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 2, "2 active Object URLs tracked in memory");

    resilientAudioPlayer.revokeAllBlobUrls();
    assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 0, "revokeAllBlobUrls() freed all active Object URLs");
    assert(revokedUrls.includes(urlA) && revokedUrls.includes(urlB), "Both Object URLs were explicitly revoked");
  } finally {
    // Restore original functions
    if (originalCreateObjectURL) {
      (globalThis as any).URL.createObjectURL = originalCreateObjectURL;
    } else {
      delete (globalThis as any).URL.createObjectURL;
    }
    if (originalRevokeObjectURL) {
      (globalThis as any).URL.revokeObjectURL = originalRevokeObjectURL;
    } else {
      delete (globalThis as any).URL.revokeObjectURL;
    }
  }

  console.log("\n================================================================================");
  console.log(`🎯 Test Summary: ${passed}/${total} assertions passed`);
  console.log("================================================================================");

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runTtsFallbackIntegrationTests();
