/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_BHASHINI_USER_ID?: string;
  readonly VITE_BHASHINI_UDYAT_KEY?: string;
  readonly VITE_BHASHINI_API_KEY?: string;
  readonly VITE_BHASHINI_INFERENCE_KEY?: string;
  readonly VITE_BHASHINI_PIPELINE_ID?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_DATABASE_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_OAUTH_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
