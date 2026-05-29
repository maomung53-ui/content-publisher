/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 全局色彩变量 — 深色主题，专业工具风格
      colors: {
        'app-bg-primary': '#0f1117',     // 主背景色
        'app-bg-secondary': '#161820',   // 侧边栏/次级背景
        'app-bg-tertiary': '#1e2130',    // 卡片、面板背景
        'app-bg-hover': '#252836',       // 悬停态背景
        'app-text-primary': '#e8eaed',   // 主文字色
        'app-text-secondary': '#9aa1b0', // 次要文字色
        'app-text-muted': '#5e6673',     // 弱化文字色
        'app-accent': '#4f8cff',         // 强调色/品牌色
        'app-accent-hover': '#3a7be8',   // 强调色悬停
        'app-border': '#2a2d3a',         // 边框色
        'app-success': '#34d399',        // 成功绿
        'app-warning': '#fbbf24',        // 警告黄
        'app-error': '#f87171',          // 错误红
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
