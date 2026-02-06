/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // VendStats Calm Authority Design System
        background: '#F5F3EF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFAF9',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          muted: '#D1D5DB',
        },
        divider: 'rgba(17, 24, 39, 0.06)',
        border: {
          DEFAULT: 'rgba(17, 24, 39, 0.08)',
          light: 'rgba(17, 24, 39, 0.04)',
        },
        // Authority Green - Primary Accent
        primary: {
          DEFAULT: '#14532D',
          light: 'rgba(20, 83, 45, 0.08)',
          dark: '#0F3D21',
        },
        // Mint - Growth Accent
        growth: {
          DEFAULT: '#4ADE80',
          light: 'rgba(74, 222, 128, 0.12)',
        },
        success: {
          DEFAULT: '#4ADE80',
          light: 'rgba(74, 222, 128, 0.12)',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: 'rgba(220, 38, 38, 0.08)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.08)',
        },
        // Chart specific
        chart: {
          line: '#111827',
          fill: 'rgba(20, 83, 45, 0.10)',
          growth: '#4ADE80',
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '64px',
      },
      fontSize: {
        // Display / Hero
        'display-lg': ['40px', { lineHeight: '48px', fontWeight: '700', letterSpacing: '-1px' }],
        'display-md': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.5px' }],
        // Headlines
        'h1': ['28px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.5px' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.3px' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h4': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        // Body
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        // Labels - Uppercase
        'label': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.5px' }],
        'label-sm': ['10px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.6px' }],
        // Metrics
        'metric-hero': ['40px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-1px' }],
        'metric-lg': ['32px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.5px' }],
        'metric-md': ['24px', { lineHeight: '28px', fontWeight: '700' }],
        'metric-sm': ['18px', { lineHeight: '22px', fontWeight: '600' }],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(17, 24, 39, 0.03)',
        'md': '0 2px 6px rgba(17, 24, 39, 0.04)',
        'lg': '0 4px 12px rgba(17, 24, 39, 0.05)',
      },
    },
  },
  plugins: [],
};
