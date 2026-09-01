/// <reference types="vite/client" />

declare module '*.png';

declare module '*.jpg';

declare module '*.jpeg';

declare module '*.svg';

declare module '*.gif';

declare module '*.webp';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_USE_PROXY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  // add other env vars you expect here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
