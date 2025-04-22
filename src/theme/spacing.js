// Spacing values for consistent layout
const spacing = {
  tiny: 2,
  xxsmall: 4,
  xsmall: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  xxxlarge: 40,
  huge: 48,
  xhuge: 56,
  xxhuge: 64,
  giant: 80,
};

// Layout margins
const layout = {
  screenMargin: spacing.medium,
  cardMargin: spacing.small,
  sectionMargin: spacing.xlarge,
  contentPadding: spacing.medium,
};

// Border radius
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 999,
};

// Shadow styles
const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

export default {
  spacing,
  layout,
  borderRadius,
  shadows,
};
