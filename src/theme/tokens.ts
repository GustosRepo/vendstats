/**
 * VendStats Design Tokens
 * Executive Finance-Grade Aesthetic
 * Colors extracted from US $100 bill
 */

export const colors = {
  // Backgrounds - Light blue from $100 bill security ribbon
  background: '#E8F1F8',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F9FC',
  surfaceSecondary: '#DCE8F2',

  // Text - Strong hierarchy (like the engraving)
  textPrimary: '#1A1F1E',      // Near-black (portrait ink)
  textSecondary: '#3D4543',    // Dark gray-green
  textTertiary: '#5F6B68',     // Medium gray
  textMuted: '#8A9693',        // Light gray

  // Borders & Dividers - Subtle
  divider: 'rgba(26, 31, 30, 0.06)',
  border: 'rgba(26, 31, 30, 0.08)',
  borderLight: 'rgba(26, 31, 30, 0.04)',

  // Primary Accent - Treasury Seal Green
  primary: '#1B4332',
  primaryHover: '#2D5A45',
  primaryLight: 'rgba(27, 67, 50, 0.08)',
  primaryTint: 'rgba(27, 67, 50, 0.12)',

  // Security Ribbon Blue
  ribbon: '#5B8DBE',
  ribbonLight: 'rgba(91, 141, 190, 0.12)',

  // Copper Inkwell accent
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',

  // Growth - Gold/Copper accent
  growth: '#B87333',
  growthLight: 'rgba(184, 115, 51, 0.10)',

  // Semantic Colors
  success: '#B87333',
  successLight: 'rgba(184, 115, 51, 0.10)',

  danger: '#8B2C2C',
  dangerLight: 'rgba(139, 44, 44, 0.08)',

  warning: '#B87333',
  warningLight: 'rgba(184, 115, 51, 0.10)',

  // Money-specific
  profit: '#B87333',
  loss: '#8B2C2C',
  revenue: '#1A1F1E',

  // Chart colors - Gold/Copper accent
  chartLine: '#B87333',
  chartFill: 'rgba(184, 115, 51, 0.08)',
  chartFillGradientStart: 'rgba(184, 115, 51, 0.18)',
  chartFillGradientEnd: 'rgba(184, 115, 51, 0.02)',

  // Tab bar
  tabActive: '#B87333',
  tabInactive: '#8A9693',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const typography = {
  // Hero / Display
  displayLarge: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
  },
  displayMedium: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },

  // Headlines
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },

  // Labels - Uppercase tracking
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },

  // Metrics - Finance grade
  metricHero: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
  },
  metricLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  metricMedium: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  metricSmall: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },

  // KPI styles for stat cards
  kpiSmall: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  kpiMedium: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  kpiLarge: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
} as const;

// Shadows - Soft, subtle elevation
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Button styles
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
} as const;

// Helper to apply text styles
export const applyTypography = (style: keyof typeof typography) => ({
  fontSize: typography[style].fontSize,
  lineHeight: typography[style].lineHeight,
  fontWeight: typography[style].fontWeight,
  ...(('letterSpacing' in typography[style]) && { letterSpacing: (typography[style] as any).letterSpacing }),
});
