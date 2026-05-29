import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 将环境变量注入到客户端代码，通过 import.meta.env.VITE_* 访问
  // 开发时在项目根目录创建 .env 文件：VITE_DEEPSEEK_API_KEY=sk-xxx
  define: {
    'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(
      process.env.VITE_DEEPSEEK_API_KEY || '',
    ),
  },
})
