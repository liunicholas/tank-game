import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1a2e',
        'game-wall': '#ffffff',
        'tank-pink': '#ffb3ba',
        'tank-blue': '#bae1ff',
        'tank-green': '#baffc9',
        'tank-yellow': '#ffffba',
        'tank-purple': '#e0b3ff',
        'tank-orange': '#ffdfba',
        'tank-cyan': '#b3ffff',
        'tank-coral': '#ffc9ba',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
