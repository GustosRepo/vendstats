/**
 * VendStats Theme - Central Export
 */

export * from './tokens';

import { colors, spacing, radius, typography, shadows } from './tokens';

const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export default theme;

// NativeWind class helpers
export const tw = {
  // Background colors
  bg: {
    primary: 'bg-[#F7F7F8]',
    surface: 'bg-white',
    accent: 'bg-[#2F3DF5]',
    accentLight: 'bg-[#EEF0FF]',
    success: 'bg-[#16A34A]',
    successLight: 'bg-[#DCFCE7]',
    danger: 'bg-[#DC2626]',
    dangerLight: 'bg-[#FEE2E2]',
  },

  // Text colors
  text: {
    primary: 'text-[#0B0D10]',
    secondary: 'text-[#6B7280]',
    tertiary: 'text-[#9CA3AF]',
    white: 'text-white',
    accent: 'text-[#2F3DF5]',
    success: 'text-[#16A34A]',
    danger: 'text-[#DC2626]',
  },

  // Border colors
  border: {
    default: 'border-[#E5E7EB]',
    light: 'border-[#F3F4F6]',
    accent: 'border-[#2F3DF5]',
  },

  // Border radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  // Spacing
  padding: {
    screen: 'px-5',
    card: 'p-4',
    cardLg: 'p-5',
  },
} as const;
