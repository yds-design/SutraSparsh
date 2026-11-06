import { resilientAudioPlayer, AudioValidationError } from "../utils/resilientAudioPlayer.js";

async function testResilientAudioPlayer() {
  console.log("=================================================");
  console.log("🧪 Comprehensive Testing: Resilient Audio Player");
  console.log("=================================================");

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

  // --- 1. Singleton Instance & Core Methods ---
  console.log("\n--- 1. Core API & Singleton Contract ---");
  assert(Boolean(resilientAudioPlayer), "ResilientAudioPlayer instance exists");
  assert(typeof resilientAudioPlayer.unlockAudio === "function", "unlockAudio method exists");
  assert(typeof resilientAudioPlayer.play === "function", "play method exists");
  assert(typeof resilientAudioPlayer.stopCurrent === "function", "stopCurrent method exists");
  assert(typeof resilientAudioPlayer.validateAudioSource === "function", "validateAudioSource method exists");
  assert(typeof resilientAudioPlayer.trackBlobUrl === "function", "trackBlobUrl method exists");
  assert(typeof resilientAudioPlayer.revokeBlobUrl === "function", "revokeBlobUrl method exists");
  assert(typeof resilientAudioPlayer.revokeAllBlobUrls === "function", "revokeAllBlobUrls method exists");
  assert(typeof resilientAudioPlayer.getTrackedBlobUrlCount === "function", "getTrackedBlobUrlCount method exists");

  // --- 2. Safe Execution in Non-Browser Environment ---
  console.log("\n--- 2. Non-Browser Graceful Handling ---");
  try {
    resilientAudioPlayer.unlockAudio();
    assert(true, "unlockAudio executes safely without DOM/window");
  } catch (err: any) {
    assert(false, `unlockAudio threw error: ${err?.message}`);
  }

  try {
    resilientAudioPlayer.stopCurrent();
    assert(true, "stopCurrent executes safely without active handle");
  } catch (err: any) {
    assert(false, `stopCurrent threw error: ${err?.message}`);
  }

  // Calling play in Node environment throws clean informative error
  try {
    await resilientAudioPlayer.play("dummy");
    assert(false, "play() should reject in non-browser environment");
  } catch (err: any) {
    assert(
      err?.message?.includes("browser environment") || err instanceof AudioValidationError,
      "play() cleanly identifies browser-only execution"
    );
  }

  // --- 3. Blob URL Tracking & Disposal (Memory Leak Prevention) ---
  console.log("\n--- 3. Blob URL Tracking & Disposal ---");
  const initialCount = resilientAudioPlayer.getTrackedBlobUrlCount();
  assert(initialCount === 0, "Initial tracked blob URL count is 0");

  const testBlobUrl1 = "blob:https://sutrasparsh.internal/audio-test-1";
  const testBlobUrl2 = "blob:https://sutrasparsh.internal/audio-test-2";
  resilientAudioPlayer.trackBlobUrl(testBlobUrl1);
  resilientAudioPlayer.trackBlobUrl(testBlobUrl2);
  assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 2, "Tracks 2 registered blob URLs");

  // Revoke single URL
  resilientAudioPlayer.revokeBlobUrl(testBlobUrl1);
  assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 1, "Disposing one URL decrements count to 1");

  // Revoke all URLs
  resilientAudioPlayer.revokeAllBlobUrls();
  assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 0, "revokeAllBlobUrls frees all tracked URLs");

  // Non-blob URLs ignored in tracking
  resilientAudioPlayer.trackBlobUrl("https://example.com/audio.mp3");
  assert(resilientAudioPlayer.getTrackedBlobUrlCount() === 0, "Ignores non-blob URLs for memory disposal tracking");

  // --- 4. Pre-Validation of Audio Sources ---
  console.log("\n--- 4. Audio Source Pre-Validation ---");

  // 4a. Empty or null inputs
  const emptyVal = await resilientAudioPlayer.validateAudioSource("");
  assert(!emptyVal.isValid, "Rejects empty string audio source");
  assert(!emptyVal.isPlayable, "Empty source is marked not playable");

  // 4b. Too short / corrupted base64 string
  const shortVal = await resilientAudioPlayer.validateAudioSource("AQID");
  assert(!shortVal.isValid, "Rejects truncated/corrupt base64 string (< 50 chars)");

  // 4c. Valid RIFF WAV Base64
  // Construct minimal valid 44-byte RIFF WAVE buffer
  const sampleWavBuf = Buffer.alloc(44);
  sampleWavBuf.write("RIFF", 0);
  sampleWavBuf.writeUInt32LE(36, 4);
  sampleWavBuf.write("WAVE", 8);
  sampleWavBuf.write("fmt ", 12);
  sampleWavBuf.writeUInt32LE(16, 16);
  sampleWavBuf.writeUInt16LE(1, 20); // PCM
  sampleWavBuf.writeUInt16LE(1, 22); // Mono
  sampleWavBuf.writeUInt32LE(22050, 24);
  sampleWavBuf.writeUInt32LE(44100, 28);
  sampleWavBuf.writeUInt16LE(2, 32);
  sampleWavBuf.writeUInt16LE(16, 34);
  sampleWavBuf.write("data", 36);
  sampleWavBuf.writeUInt32LE(0, 40);

  const sampleWavB64 = sampleWavBuf.toString("base64");
  const wavVal = await resilientAudioPlayer.validateAudioSource(sampleWavB64);
  assert(wavVal.isValid, "Validates valid RIFF WAVE header bytes");
  assert(wavVal.format === "wav", "Identifies WAV format correctly");
  assert(wavVal.mimeType === "audio/wav", "Assigns audio/wav MIME type");

  // 4d. Valid MP3 with ID3 tag
  const id3Buf = Buffer.alloc(64);
  id3Buf.write("ID3", 0);
  id3Buf[3] = 3; // version 2.3
  const id3B64 = id3Buf.toString("base64");
  const mp3Val = await resilientAudioPlayer.validateAudioSource(id3B64);
  assert(mp3Val.isValid, "Validates MP3 with ID3 tag");
  assert(mp3Val.format === "mp3", "Identifies MP3 format correctly");

  // 4e. Raw PCM Base64 (such as Bhashini Indic-TTS model returning raw 16-bit PCM)
  const rawPcmBuf = Buffer.alloc(200);
  for (let i = 0; i < 100; i++) {
    rawPcmBuf.writeInt16LE(Math.floor(Math.sin(i) * 10000), i * 2);
  }
  const rawPcmB64 = rawPcmBuf.toString("base64");
  const pcmVal = await resilientAudioPlayer.validateAudioSource(rawPcmB64);
  assert(pcmVal.isValid, "Recognizes raw 16-bit PCM payload");
  assert(pcmVal.format === "pcm", "Flags format as PCM for auto RIFF-framing");

  // --- 5. Base64 to ArrayBuffer Conversion ---
  console.log("\n--- 5. Binary Conversion Helpers ---");
  const testB64 = Buffer.from("SutraSparsh Vedic Recitation Audio").toString("base64");
  const arrBuf = resilientAudioPlayer.base64ToArrayBuffer(testB64);
  assert(arrBuf instanceof ArrayBuffer, "base64ToArrayBuffer returns valid ArrayBuffer");
  assert(arrBuf.byteLength === 34, "ArrayBuffer byteLength matches decoded length (34 bytes)");

  console.log("=================================================");
  console.log(`🎯 Summary: ${passed}/${total} assertions passed`);
  console.log("=================================================");
}

testResilientAudioPlayer();
