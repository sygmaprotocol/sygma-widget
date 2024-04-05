/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDGE_ENV: string;
  // more env variables...
  readonly VITE_CHAIN_ID_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
