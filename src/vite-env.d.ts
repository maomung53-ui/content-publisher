/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** DeepSeek API 密钥 */
  readonly VITE_DEEPSEEK_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
