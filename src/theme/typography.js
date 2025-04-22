import { Platform } from 'react-native';

// Base font family
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    light: 'sans-serif-light',
    thin: 'sans-serif-thin',
  },
});

// Font sizes
const fontSizes = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 30,
  huge: 36
};

// Line heights
const lineHeights = {
  tiny: 14,
  small: 18,
  regular: 20,
  medium: 24,
  large: 26,
  xlarge: 30,
  xxlarge: 36,
  xxxlarge: 44,
  huge: 52
};

// Font weights
const fontWeights = {
  thin: Platform.select({ ios: '100', android: 'normal' }),
  light: Platform.select({ ios: '300', android: 'normal' }),
  regular: Platform.select({ ios: '400', android: 'normal' }),
  medium: Platform.select({ ios: '500', android: 'normal' }),
  bold: Platform.select({ ios: '700', android: 'bold' }),
  black: Platform.select({ ios: '900', android: 'bold' }),
};

// Text variants
const textVariants = {
  // Display styles
  displayLarge: {
    fontFamily: fontFamily.light,
    fontSize: fontSizes.huge,
    lineHeight: lineHeights.huge,
    fontWeight: fontWeights.light,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: fontFamily.light,
    fontSize: fontSizes.xxxlarge,
    lineHeight: lineHeights.xxxlarge,
    fontWeight: fontWeights.light,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.xxlarge,
    lineHeight: lineHeights.xxlarge,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  
  // Headline styles
  headlineLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.xxlarge,
    lineHeight: lineHeights.xxlarge,
    fontWeight: fontWeights.medium,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.xlarge,
    lineHeight: lineHeights.xlarge,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  },
  headlineSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.large,
    lineHeight: lineHeights.large,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  },
  
  // Title styles
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.large,
    lineHeight: lineHeights.large,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.medium,
    lineHeight: lineHeights.medium,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.regular,
    lineHeight: lineHeights.regular,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },
  
  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.medium,
    lineHeight: lineHeights.medium,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.regular,
    lineHeight: lineHeights.regular,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.4,
  },
  
  // Label styles
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.regular,
    lineHeight: lineHeights.regular,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.tiny,
    lineHeight: lineHeights.tiny,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },
};

export default {
  fontFamily,
  fontSizes,
  lineHeights,
  fontWeights,
  textVariants,
};
