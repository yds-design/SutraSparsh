# SutraSparsh — First-Timer's Guide to Android APK & Production Deployment
## Tailored for Windows 10/11, VS Code & PowerShell

**App Name:** SutraSparsh (Touch the Sacred Sanskrit Sutras)  
**Package Identifier:** `com.yds.sutrasparsh`  
**Firebase Project ID:** `sutrasparsh-17a55`  
**Target Environment:** Windows 10/11, PowerShell 5.1 / 7+, VS Code Terminal  
**Build Engine:** Expo Application Services (EAS Cloud Build) & Expo SDK 57  

---

## 🌟 Executive Overview for 1st-Time Mobile Builders

As a first-timer building an Android app, the traditional method requires installing 25+ GB of Android Studio, Java JDK, Gradle build tools, and configuring complex Windows environment variables (`ANDROID_HOME`, `JAVA_HOME`).

**You do NOT need to do that!**  
SutraSparsh is configured with **EAS (Expo Application Services)**. EAS builds your APK in secure cloud build containers. 

You only need:
1. **VS Code & Windows PowerShell**
2. **Node.js** (v18, v20, or v22 LTS)
3. A **Free Expo Account** (takes 60 seconds to create)

This runbook guides you from zero to installing the live `.apk` on your Android phone and producing the `.aab` for the Google Play Store.

---

## Table of Contents
1. [Phase 0: Windows & VS Code Initial Setup](#phase-0-windows--vs-code-initial-setup)
2. [Phase 1: Setting Up Your Free Expo Cloud Account](#phase-1-setting-up-your-free-expo-cloud-account)
3. [Phase 2: Project Verification & EAS CLI Installation](#phase-2-project-verification--eas-cli-installation)
4. [Phase 3: Building Your First Testable APK (Direct Install)](#phase-3-building-your-first-testable-apk-direct-install)
5. [Phase 4: Installing & Testing the APK on Your Android Device](#phase-4-installing--testing-the-apk-on-your-android-device)
6. [Phase 5: Connecting Google Sign-In & Firebase (SHA-1 Fingerprint)](#phase-5-connecting-google-sign-in--firebase-sha-1-fingerprint)
7. [Phase 6: Compiling Production Bundle (.aab) for Google Play Store](#phase-6-compiling-production-bundle-aab-for-google-play-store)
8. [Phase 7: Windows PowerShell Troubleshooting & FAQ](#phase-7-windows-powershell-troubleshooting--faq)

---

## Phase 0: Windows & VS Code Initial Setup

### Step 0.1: Open VS Code as Administrator
1. On Windows, press the `Windows Key`, search for **Visual Studio Code**.
2. Right-click and choose **"Run as administrator"** (recommended for initial setup so npm global packages install cleanly).
3. Open the project folder in VS Code (`File` > `Open Folder...` > select your SutraSparsh repository folder).

### Step 0.2: Configure PowerShell Execution Policy
By default, Windows blocks running scripts in PowerShell. Let's enable local scripts.

1. Open the Integrated Terminal in VS Code:
   - Press ``Ctrl + ` `` (Backtick) or go to menu `Terminal` > `New Terminal`.
   - Ensure the dropdown shows **pwsh** or **PowerShell** (not Command Prompt or Git Bash).
2. Run this command:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
   ```
3. Verify your Node.js and npm versions:
   ```powershell
   node -v
   npm -v
   ```
   *(You should see Node v18+, v20+, or v22+).*

---

## Phase 1: Setting Up Your Free Expo Cloud Account

EAS Cloud Build provides **free cloud build credits** every month:
1. Open your browser and go to: [https://expo.dev/signup](https://expo.dev/signup)
2. Create a free account (e.g., using your email `vishal.kr.gupta@gmail.com` or GitHub).
3. Note your **Expo Username** and **Password** (you will use them in the terminal in Phase 2).

---

## Phase 2: Project Verification & EAS CLI Installation

Run all commands below in your **VS Code PowerShell Terminal**.

### Step 2.1: Install EAS CLI Globally
```powershell
npm install -g eas-cli
```

Verify the installation:
```powershell
eas --version
```
*(Should output `eas-cli/14.x.x` or newer).*

### Step 2.2: Log in to Expo from PowerShell
```powershell
eas login
```
- It will prompt: `Email or username:` ➔ enter your Expo credentials.
- It will prompt: `Password:` ➔ enter your password.
- Output: `✔ Logged in as <your-username>`.

### Step 2.3: Link the Project to your Expo Account
Run:
```powershell
eas project:init
```
- If prompted: *"Would you like to link this project to @your-username/sutrasparsh?"* ➔ Select **Yes**.
- This updates `app.json` with your unique `projectId`.

### Step 2.4: Verify Critical Configuration Files
Before compiling, verify that these two key files exist in your root directory:
```powershell
Test-Path .\google-services.json
Test-Path .\app.json
Test-Path .\eas.json
```
*(All three commands should return `True`).*

---

## Phase 3: Building Your First Testable APK (Direct Install)

An **APK** (`.apk`) is the standard Android package file that you can install directly on any phone without publishing to the Play Store.

### Step 3.1: Trigger the Cloud APK Build
In your PowerShell terminal, run:
```powershell
eas build --platform android --profile preview
```

### Step 3.2: What to Expect During the Prompts

1. **Android Keystore Prompt:**
   ```text
   ✔ Generate a new Android Keystore?
   > [Yes] (Recommended)
   ```
   ➔ Press **Enter** on **Yes**. Expo will automatically generate, secure, and store your cryptographic signing key in the cloud. You don't have to manage raw keystore files on Windows!

2. **Build Submission:**
   EAS will compress your project metadata and upload it to the Expo build servers:
   ```text
   ✔ Build request submitted.
   Build details: https://expo.dev/accounts/<user>/projects/sutrasparsh/builds/<build-id>
   Waiting for build to complete. You can press Ctrl+C to exit...
   ```

3. **Wait for Build Completion (typically 5 to 8 minutes):**
   - You can leave PowerShell running, OR
   - You can click the build URL to watch the live build logs in your web browser.
   - When finished, PowerShell will display:
   ```text
   ✔ Build finished!
   Installable APK: https://expo.dev/artifacts/eas/.../sutrasparsh-preview.apk
   [QR Code displayed in terminal]
   ```

---

## Phase 4: Installing & Testing the APK on Your Android Device

You have two convenient ways to put the APK on your phone:

### Method A: Scan the QR Code (Fastest)
1. Open your Android phone's Camera app.
2. Scan the QR code printed directly in your VS Code PowerShell terminal.
3. Tap the link to download `sutrasparsh-preview.apk`.

### Method B: Direct URL Download
1. Copy the download URL printed in PowerShell (or find it on [expo.dev](https://expo.dev) under your Project > Builds).
2. Send it to your phone (via WhatsApp, Telegram, or Chrome browser).
3. Download the `.apk` file.

### First-Time Android Installation Warning:
When installing an APK downloaded outside of Google Play:
1. Tap the downloaded `.apk` file on your phone.
2. Android will show a prompt: *"For your security, your phone is not allowed to install unknown apps from this source"*.
3. Tap **Settings** ➔ Toggle **"Allow from this source"** ➔ Tap **Back** ➔ Tap **Install**.
4. Play Protect may show *"Unrecognized App"* (because it's a private build):
   - Tap **"More details"** ➔ Tap **"Install anyway"**.
5. **Open SutraSparsh!** Your app will launch with full offline chanting, daily affirmations, and streak tracking.

---

## Phase 5: Connecting Google Sign-In & Firebase (SHA-1 Fingerprint)

For Google Sign-In popups to work on physical Android hardware, Firebase must recognize your build's cryptographic signature.

### Step 5.1: Retrieve Your App's SHA-1 Fingerprint
In VS Code PowerShell, run:
```powershell
eas credentials -p android
```
- Select: **`production`** or **`preview`** keystore.
- EAS will print:
  ```text
  SHA1 Fingerprint:    2A:3B:4C:5D:6E:7F:...
  SHA256 Fingerprint:  9Z:8Y:7X:6W:5V:4U:...
  ```
- Copy the **SHA1 Fingerprint**.

### Step 5.2: Add SHA-1 into Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select project **`sutrasparsh-17a55`**.
3. Click the ⚙️ **Gear icon** (top left) > **Project settings**.
4. Scroll down to **"Your apps"** and select **Android app (`com.yds.sutrasparsh`)**.
5. Click **"Add fingerprint"**.
6. Paste your copied **SHA-1** fingerprint and click **Save**.
*(Google Sign-In is now permanently authorized on physical Android devices!)*

---

## Phase 6: Compiling Production Bundle (.aab) for Google Play Store

When you are ready to publish on the Google Play Store, Google requires an **Android App Bundle (`.aab`)** instead of an `.apk`.

### Step 6.1: Run the Production Build
In your VS Code PowerShell terminal:
```powershell
eas build --platform android --profile production
```

### Step 6.2: Download the Release Bundle
1. Once the cloud build completes (approx 5-8 minutes), EAS provides a download link for `sutrasparsh.aab`.
2. Download this file to your Windows PC (e.g., in your `Downloads` folder).

### Step 6.3: Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name:** `SutraSparsh`
   - **Default language:** `English (United States)`
   - **App or Game:** `App`
   - **Free or Paid:** `Free`
3. In the left navigation, go to **Testing** > **Internal testing** (or **Production**).
4. Click **Create new release**.
5. Drag and drop your downloaded `sutrasparsh.aab` file into the upload box.
6. Provide release notes:
   ```text
   SutraSparsh v1.0.0 — Sacred Sanskrit wisdom sanctuary with authentic chanting, daily sadhana streaks, and offline reflection journal.
   ```
7. Fill out store metadata using the pre-prepared `/store-listing-metadata.json` file in your repository:
   - Privacy Policy URL: `https://ais-dev-z2uvcnewtnoiucjecebq6f-246687965285.asia-southeast1.run.app/privacy.html`
   - App Icon: Upload `/assets/icon.png` (512x512)
   - Feature Graphic: Upload `/public/assets/aistudio/...`
8. Click **Save** and **Review Release**!

---

## Phase 7: Windows PowerShell Troubleshooting & FAQ

### Issue 1: `eas : File ... cannot be loaded because running scripts is disabled on this system`
**Solution:** PowerShell security policy is preventing script execution. Run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```
Close and reopen the VS Code terminal.

### Issue 2: `eas command not found` after running `npm install -g eas-cli`
**Solution:** Your Windows PATH does not include npm global packages. Run this in PowerShell to add it for your session:
```powershell
$env:Path += ";$env:APPDATA\npm"
```
To make it permanent, add `%APPDATA%\npm` to your Windows Environment Variables under User PATH.

### Issue 3: How to test on Windows with an Android phone connected via USB?
If you want to install directly using Android Debug Bridge (`adb`):
1. Enable **Developer Options** and **USB Debugging** on your phone:
   - Go to `Settings` > `About phone` > tap `Build number` 7 times.
   - Go to `Settings` > `System` > `Developer options` > turn on `USB debugging`.
2. Connect phone via USB cable and allow USB debugging when prompted.
3. If you have `adb` installed:
   ```powershell
   adb install -r path\to\sutrasparsh-preview.apk
   ```

### Issue 4: Where do I find the store descriptions and keywords?
The repository includes a ready-to-use file:
- `store-listing-metadata.json` (contains Title, Subtitle, Short Description, Full 4000-char Description, Tags, and Category).

---

## Summary of Essential PowerShell Commands

```powershell
# 1. Allow scripts
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force

# 2. Install EAS CLI
npm install -g eas-cli

# 3. Log in to your free Expo account
eas login

# 4. Build installable test APK (for your phone)
eas build --platform android --profile preview

# 5. Build production bundle (for Google Play Store)
eas build --platform android --profile production

# 6. View your build fingerprints (SHA-1 for Firebase)
eas credentials -p android
```

Congratulations! You now have a complete, reproducible Windows PowerShell deployment pipeline for SutraSparsh.
