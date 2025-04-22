/**
 * Typography definitions for the app
 */

// Font size definitions
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 30,
  title: 36
};

// Line height definitions
export const lineHeights = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 38,
  display: 42,
  title: 48
};

// Font families
export const fonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400'
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500'
  },
  semiBold: {
    fontFamily: 'System',
    fontWeight: '600'
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700'
  }
};

// Typography presets for consistent use throughout the app
export const typography = {
  title: {
    ...fonts.bold,
    fontSize: fontSizes.title,
    lineHeight: lineHeights.title
  },
  heading1: {
    ...fonts.bold,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display
  },
  heading2: {
    ...fonts.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl
  },
  heading3: {
    ...fonts.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl
  },
  subheading: {
    ...fonts.medium,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl
  },
  body1: {
    ...fonts.regular,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg
  },
  body2: {
    ...fonts.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md
  },
  caption: {
    ...fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm
  },
  button: {
    ...fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg
  },
  overline: {
    ...fonts.medium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  }
};

// Common text styles for components
export const textStyles = {
  header: {
    ...typography.heading2
  },
  subheader: {
    ...typography.subheading
  },
  bodyText: {
    ...typography.body1
  },
  smallText: {
    ...typography.body2
  },
  caption: {
    ...typography.caption
  },
  buttonLabel: {
    ...typography.button
  }
};