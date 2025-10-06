/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ai: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          dark: '#0f172a',
          darker: '#020617',
          light: '#f8fafc',
          lighter: '#ffffff',
          border: '#e2e8f0',
          'border-dark': '#334155',
        }
      },
      fontFamily: {
        'ai': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'ai-float': 'float 6s ease-in-out infinite',
        'ai-pulse': 'ai-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ai-slide-in': 'ai-slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'ai-message-enter': 'messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'ai-neural-float': 'neural-float 20s ease-in-out infinite',
        'ai-typing': 'typing 3.5s steps(40, end)',
        'ai-blink-caret': 'blink-caret 0.75s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'ai-pulse': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          },
          '50%': { 
            opacity: '0.7',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)'
          },
        },
        'ai-slideIn': {
          'from': {
            opacity: '0',
            transform: 'translateX(100%) scale(0.95)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0) scale(1)'
          },
        },
        'messageSlideIn': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        'neural-float': {
          '0%, 100%': { backgroundPosition: '0 0, 100px 100px, 200px 200px' },
          '50%': { backgroundPosition: '50px 50px, 150px 150px, 250px 250px' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'rgb(99, 102, 241)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'ai-glow': '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(6, 182, 212, 0.1)',
        'ai-glow-hover': '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(6, 182, 212, 0.2)',
        'ai-card': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)',
        'ai-button': '0 10px 25px rgba(99, 102, 241, 0.3)',
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 0%, #06b6d4 100%)',
        'ai-gradient-radial': 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
        'ai-gradient-sidebar': 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        'ai-gradient-button': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      },
      backgroundSize: {
        'ai-neural': '200px 200px, 300px 300px, 400px 400px',
      },
      backgroundPosition: {
        'ai-neural': '0 0, 100px 100px, 200px 200px',
        'ai-neural-float': '50px 50px, 150px 150px, 250px 250px',
      },
      transitionTimingFunction: {
        'ai-bounce': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      scale: {
        'ai-hover': '1.02',
        'ai-active': '0.98',
      },
      borderRadius: {
        'ai-xl': '1rem',
        'ai-2xl': '1.5rem',
        'ai-3xl': '2rem',
      },
    },
  },
  plugins: [],
}
