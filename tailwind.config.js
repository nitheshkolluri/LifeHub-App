/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // "Calm Daylight" Palette (Warm Paper, Natural, Peaceful)
                canvas: {
                    DEFAULT: '#FDFBF7', // Warm Alabaster / Milk
                    muted: '#F5F5F4',   // Warm Stone 100
                    subtle: '#E7E5E4',  // Warm Stone 200
                    dark: '#292524',    // Contrast Dark
                },
                ink: {
                    DEFAULT: '#292524', // Warm Charcoal (Stone 800)
                    muted: '#78716C',   // Stone 500
                    faint: '#A8A29E',   // Stone 400
                    inverse: '#FAFAFA', // White
                },
                axiom: {
                    orange: '#EA580C', // Burnt Orange (More natural than neon)
                    gold: '#CA8A04',   // Deep Gold
                    forest: '#15803D', // Deep Forest Green
                    clay: '#E11D48',   // Rose
                    slate: '#64748B',  // Slate Blue
                },
                // Aliases for compatibility
                primary: {
                    DEFAULT: '#4F46E5', // Indigo 600 (Solid, Trusted)
                    500: '#6366F1',
                    600: '#4F46E5',
                },
                secondary: '#78716C',
                surface: {
                    light: '#FDFBF7',
                    dark: '#292524',
                    card: '#FFFFF',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Switch to Inter for "Swiss" cleanliness? Or stick to Plus Jakarta. Let's stick to Plus Jakarta for now but maybe Inter is more "Artistic". Let's keep existing fonts to not break imports.
                display: ['Outfit', 'sans-serif'],
            },
            backgroundImage: {
                'matte-gradient': 'linear-gradient(to bottom right, #1c1917, #0c0a09)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(5px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
            }
        },
    },
    plugins: [],
}
