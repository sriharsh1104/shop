/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Leave empty in dev to use Vite proxy (/api/auth -> user-service) */
  readonly VITE_USER_SERVICE_URL: string;
  readonly VITE_PRODUCT_SERVICE_URL: string;
  readonly VITE_ORDER_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
