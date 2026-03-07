/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUNPOD_API_KEY?: string
  readonly VITE_RUNPOD_BASE_URL?: string
  readonly VITE_RUNPOD_ENDPOINT_ID?: string
  readonly VITE_USE_LOCAL_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
