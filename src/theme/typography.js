/**
 * Typography definitions for the app
 */

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 48,
};

export const fonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
};

export const typography = {
  h1: {
    ...fonts.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
  },
  h2: {
    ...fonts.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
  },
  h3: {
    ...fonts.bold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
  },
  h4: {
    ...fonts.bold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
  },
  h5: {
    ...fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  body1: {
    ...fonts.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  body2: {
    ...fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  button: {
    ...fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  caption: {
    ...fonts.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
};

export const textStyles = {
  h1: {
    ...typography.h1,
  },
  h2: {
    ...typography.h2,
  },
  h3: {
    ...typography.h3,
  },
  h4: {
    ...typography.h4,
  },
  h5: {
    ...typography.h5,
  },
  body1: {
    ...typography.body1,
  },
  body2: {
    ...typography.body2,
  },
  button: {
    ...typography.button,
  },
  caption: {
    ...typography.caption,
  },
};