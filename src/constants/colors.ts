// Color palette - Minimal, modern, Apple-like
export const colors = {
  // Primary
  primary: '#0ea5e9',
  primaryLight: '#e0f2fe',
  primaryDark: '#0369a1',

  // Neutral
  background: '#ffffff',
  surface: '#fafafa',
  surfaceSecondary: '#f5f5f5',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',

  // Text
  textPrimary: '#171717',
  textSecondary: '#525252',
  textTertiary: '#737373',
  textMuted: '#a3a3a3',

  // Semantic
  success: '#22c55e',
  successLight: '#f0fdf4',
  successDark: '#16a34a',

  danger: '#ef4444',
  dangerLight: '#fef2f2',
  dangerDark: '#dc2626',

  warning: '#f59e0b',
  warningLight: '#fffbeb',

  // Money colors
  profit: '#22c55e',
  loss: '#ef4444',
  revenue: '#0ea5e9',
  expense: '#f59e0b',
} as const;

export type ColorKey = keyof typeof colors;
