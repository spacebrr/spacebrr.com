/** @type {import('tailwindcss').Config} */
export default {
  plugins: [require('@tailwindcss/typography')],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Pro', 'serif'],
        'sans': ['Space Grotesk', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Crimson Pro, serif',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            color: 'rgb(var(--text-secondary))',
            h1: { fontFamily: 'Space Grotesk, sans-serif', color: 'rgb(var(--text-primary))' },
            h2: { fontFamily: 'Space Grotesk, sans-serif', color: 'rgb(var(--text-primary))' },
            h3: { fontFamily: 'Space Grotesk, sans-serif', color: 'rgb(var(--text-primary))' },
            a: { color: 'rgb(var(--accent-primary))', '&:hover': { color: 'rgb(var(--accent-hover))' } },
            code: { backgroundColor: 'rgb(var(--bg-secondary))', borderRadius: '0.25em' },
            pre: { backgroundColor: 'rgb(var(--bg-secondary))' },
          },
        },
      },
      fontSize: {
        'body': ['1.125rem', '1.6'],      // 18px with 1.6 line height
        'body-lg': ['1.25rem', '1.6'],    // 20px with 1.6 line height (Dario style)
        'title-sm': ['1.5rem', '1.3'],    // 24px with 1.3 line height
        'title-md': ['1.75rem', '1.2'],   // 28px with 1.2 line height
        'title-lg': ['2rem', '1.1'],      // 32px with 1.1 line height
      },
      maxWidth: {
        'reading': '42rem',               // ~672px optimal reading width
        'prose': '65ch',                  // Character-based width
      }
    },
  },
}
