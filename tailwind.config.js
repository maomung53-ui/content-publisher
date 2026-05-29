/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ===== 🎨 Apple 官网明亮色彩体系 =====
      colors: {
        // 底色系统
        'surface': {
          'page': '#f5f5f7',
          'card': '#ffffff',
          'card-hover': '#fafafa',
          'glass': 'rgba(255,255,255,0.72)',
          'overlay': 'rgba(255,255,255,0.88)',
        },
        // 文字系统
        'text': {
          'primary': '#1d1d1f',
          'secondary': '#86868b',
          'tertiary': '#aeaeb2',
          'placeholder': '#c7c7cc',
        },
        // 莫兰迪辅助色
        'morandi': {
          'blue': '#8e9aaf',
          'sage': '#a3b18a',
          'rose': '#c4a5a5',
          'apricot': '#e0c9b0',
          'lavender': '#b8b0c8',
        },
        // 分割线与边框
        'divider': {
          'light': '#e8e8ed',
          'medium': '#d2d2d7',
        },
        // 品牌强调色
        'accent': {
          'blue': '#0071e3',
          'blue-hover': '#0077ed',
          'blue-active': '#006edb',
        },
        // 状态色
        'status': {
          'success': '#34c759',
          'warning': '#ff9f0a',
          'error': '#ff3b30',
          'info': '#007aff',
        },
      },

      // ===== 🔲 阴影系统 =====
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.04)',
        'sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'md': '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'lg': '0 4px 24px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.05)',
        'xl': '0 8px 40px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
        'float': '0 2px 16px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'button': '0 1px 4px rgba(0,0,0,0.06)',
        'button-hover': '0 2px 8px rgba(0,113,227,0.2)',
        'none': 'none',
      },

      // ===== ⭕ 大圆角系统 =====
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '14px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        'pill': '9999px',
      },

      // ===== 🎬 Spring 动画系统 =====
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'spring-in': 'springIn 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.93)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        springIn: {
          '0%': { opacity: '0', transform: 'scale(0.88) translateY(16px)' },
          '50%': { opacity: '1', transform: 'scale(1.03) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },

      // ===== 📏 间距扩展 =====
      spacing: {
        'page-x': '60px',
        'section': '64px',
        'card-pad': '32px',
        'element': '24px',
        'tight': '16px',
        'micro': '8px',
      },

      // ===== 🔤 字体系统 =====
      fontFamily: {
        'sans': ['-apple-system', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
        'mono': ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '1.08', fontWeight: '600', letterSpacing: '-0.024em' }],
        'display': ['36px', { lineHeight: '1.12', fontWeight: '600', letterSpacing: '-0.022em' }],
        'title': ['28px', { lineHeight: '1.16', fontWeight: '600', letterSpacing: '-0.02em' }],
        'subtitle': ['22px', { lineHeight: '1.24', fontWeight: '600', letterSpacing: '-0.018em' }],
        'heading': ['18px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.014em' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.01em' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.006em' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '0.01em' }],
      },

      // ===== 🌫️ 毛玻璃 =====
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '40px',
      },
    },
  },
  plugins: [],
}
