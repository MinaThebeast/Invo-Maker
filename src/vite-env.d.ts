/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_REVENUECAT_API_KEY?: string;
  readonly VITE_REVENUECAT_APP_USER_ID?: string;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

