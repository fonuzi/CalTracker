/**
 * Spacing utilities for the app
 */

/**
 * Spacing units that follow a geometric progression
 * - xxs: 4 (tiny elements like icons)
 * - xs: 8 (small gaps)
 * - sm: 12 (small elements)
 * - md: 16 (standard spacing)
 * - lg: 24 (large elements)
 * - xl: 32 (extra large spacing)
 * - xxl: 48 (section spacing)
 * - xxxl: 64 (screen-level spacing)
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/**
 * Border radius values
 */
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999,
};

/**
 * Icon sizes
 */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

/**
 * Common layout styles
 */
export const layouts = {
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
};

/**
 * Shadow styles
 */
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};