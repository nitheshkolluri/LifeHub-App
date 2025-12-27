/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // NEW DESIGN SYSTEM: "Calm & Soft"
                // Primary: Soft Violet / Lavender (Replaces harsh Indigo)
                primary: {
                    900: '#3730A3', // Deep Violet (Text/Headings)
                    800: '#4338CA',
                    700: '#4F46E5', // Actionable
                    600: '#6366F1', // Brand Base
                    500: '#818CF8', // Soft Focus
                    400: '#A5B4FC', // Hover/Active
                    300: '#C7D2FE',
                    200: '#E0E7FF', // Soft Backgrounds
                    100: '#EEF2FF', // Tints
                    50: '#F5F7FF',  // Base Tints
                    DEFAULT: '#6366F1',
                },
                // Aliases for compatibility
                indigo: {
                    900: '#3730A3',
                    700: '#4F46E5',
                    600: '#6366F1',
                    500: '#818CF8',
                    400: '#A5B4FC',
                    200: '#E0E7FF',
                    100: '#EEF2FF',
                    50: '#F5F7FF',
                },
                // Surface Colors (Warm/Soft Grays)
                neutral: {
                    900: '#1e293b', // Ink Black
                    800: '#334155',
                    700: '#475569',
                    600: '#64748b', // Muted Text
                    500: '#94a3b8',
                    400: '#cbd5e1', // Borders
                    300: '#e2e8f0', // Lines
                    200: '#f1f5f9', // Card BG
                    100: '#f8fafc', // Main BG
                    50: '#fcfdff',  // Lightest
                    DEFAULT: '#64748b',
                },
                // Alias Slate
                slate: {
                    900: '#1e293b',
                    800: '#334155',
                    700: '#475569',
                    600: '#64748b',
                    500: '#94a3b8',
                    400: '#cbd5e1',
                    300: '#e2e8f0',
                    200: '#f1f5f9',
                    100: '#f8fafc',
                    50: '#fcfdff',
                },
                success: {
                    500: '#10B981', // Calm Emerald
                    600: '#059669',
                    50: '#ECFDF5',
                },
                warning: {
                    500: '#F59E0B', // Warm Amber
                    50: '#FFFBEB',
                },
                error: {
                    500: '#F43F5E', // Soft Rose
                    600: '#E11D48',
                    50: '#FFF1F2',
                },
                // Semantic
                surface: {
                    DEFAULT: '#FFFFFF',
                    subtle: '#F8FAFC', // neutral-100
                    muted: '#F1F5F9',  // neutral-200
                },
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03), 0 10px 25px rgba(0, 0, 0, 0.04)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.15)', // Soft purple glow
                'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
            }
        },
    },
    plugins: [],
}
