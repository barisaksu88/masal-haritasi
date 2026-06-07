/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Masal Haritası Dark Theme
        background: {
          DEFAULT: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        surface: {
          DEFAULT: '#1e293b',
          hover: '#27354f',
          active: '#334155',
        },
        border: {
          DEFAULT: '#334155',
          light: '#475569',
        },
        text: {
          DEFAULT: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#d97706',
          hover: '#b45309',
          light: '#fbbf24',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        // Pin colors
        pin: {
          location: '#3b82f6',
          npc: '#22c55e',
          quest: '#d97706',
          poi: '#06b6d4',
          danger: '#ef4444',
          secret: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
