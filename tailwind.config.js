/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // FAANG-Level Design System (Royal Indigo)
                primary: {
                    900: '#312E81', // Deep Navy Indigo (Headings) - was primary-900
                    700: '#4338CA', // Rich Indigo
                    600: '#4F46E5', // Main Brand (Logo Match)
                    500: '#6366F1', // Purple/Violet
                    400: '#818CF8', // Lighter Violet (Hover)
                    200: '#C7D2FE', // Pale Lavender (Subtle BG)
                    50: '#EEF2FF', // Very Light Tint
                    DEFAULT: '#4F46E5', // Logo Match
                },
                // Alias Indigo to Primary for Instant Global Theme Update
                indigo: {
                    900: '#312E81',
                    700: '#4338CA',
                    600: '#4F46E5',
                    500: '#6366F1',
                    400: '#818CF8',
                    200: '#C7D2FE',
                    100: '#E0E7FF', // Added missing 100 for safety
                    50: '#EEF2FF',
                },
                neutral: {
                    900: '#0F172A', // Near Black (Body Text)
                    800: '#1E293B',
                    700: '#334155', // Secondary Text
                    500: '#64748B', // Borders/Icons
                    400: '#94A3B8',
                    300: '#CBD5E1',
                    200: '#E2E8F0', // Surfaces/Cards
                    100: '#F1F5F9',
                    50: '#F8FAFC', // Almost White BG
                    DEFAULT: '#64748B',
                },
                // Alias Slate to Neutral for Instant Global Theme Update
                slate: {
                    900: '#0F172A',
                    800: '#1E293B',
                    700: '#334155',
                    500: '#64748B',
                    400: '#94A3B8',
                    300: '#CBD5E1',
                    200: '#E2E8F0',
                    100: '#F1F5F9',
                    50: '#F8FAFC',
                },
                success: {
                    500: '#14B8A6', // Soft Teal
                    600: '#0D9488',
                },
                warning: {
                    500: '#F59E0B', // Low Saturation Amber
                },
                error: {
                    500: '#BE123C', // Professional Deep Red
                },
                // Aliases for Backward Compatibility (Mapping to new system)
                canvas: {
                    DEFAULT: '#FFFFFF', // Clean White
                    muted: '#F8FAFC',   // neutral-50
                    subtle: '#F1F5F9',  // neutral-100
                    dark: '#0F172A',    // neutral-900
                },
                ink: {
                    DEFAULT: '#0F172A', // neutral-900
                    muted: '#64748B',   // neutral-500
                    faint: '#94A3B8',   // neutral-400
                    inverse: '#FFFFFF',
                },
                axiom: {
                    orange: '#F59E0B', // Remapped to Warning/Amber for consistency
                }
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'], // Added Inter
                display: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)', // primary-700 -> 500 -> 400
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'glow': '0 0 15px rgba(79, 70, 229, 0.3)',
            }
        },
    },
    plugins: [],
}
