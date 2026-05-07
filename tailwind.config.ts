import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:       '#1B3A6B',
          'navy-dim': '#152E55',
          blue:       '#2E5BA8',
          gold:       '#C09A3A',
        },
        vz: {
          bg:         'var(--vz-bg)',
          surface:    'var(--vz-surface)',
          'surface-2':'var(--vz-surface-2)',
          'surface-3':'var(--vz-surface-3)',
          border:     'var(--vz-border)',
          'border-2': 'var(--vz-border-2)',
          text:       'var(--vz-text)',
          'text-2':   'var(--vz-text-2)',
          'text-3':   'var(--vz-text-3)',
          'text-4':   'var(--vz-text-4)',
        },
      },
      borderRadius: {
        vz:    'var(--vz-radius)',
        'vz-sm': 'var(--vz-radius-sm)',
        'vz-lg': 'var(--vz-radius-lg)',
        'vz-xl': 'var(--vz-radius-xl)',
      },
      boxShadow: {
        vz:    'var(--vz-shadow)',
        'vz-sm': 'var(--vz-shadow-sm)',
        'vz-md': 'var(--vz-shadow-md)',
      },
    },
  },
  plugins: [],
}

export default config
