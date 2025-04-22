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
  xxxl: 64
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
  round: 9999 // For circular elements
};

/**
 * Icon sizes
 */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48
};

/**
 * Common layout styles
 */
export const layouts = {
  // Flex layouts
  row: {
    flexDirection: 'row'
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  column: {
    flexDirection: 'column'
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Margin helpers
  marginH: (size) => ({
    marginHorizontal: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  marginV: (size) => ({
    marginVertical: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  marginT: (size) => ({
    marginTop: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  marginB: (size) => ({
    marginBottom: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  marginL: (size) => ({
    marginLeft: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  marginR: (size) => ({
    marginRight: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  
  // Padding helpers
  paddingH: (size) => ({
    paddingHorizontal: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  paddingV: (size) => ({
    paddingVertical: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  paddingT: (size) => ({
    paddingTop: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  paddingB: (size) => ({
    paddingBottom: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  paddingL: (size) => ({
    paddingLeft: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  paddingR: (size) => ({
    paddingRight: typeof size === 'number' ? size : spacing[size || 'md']
  }),
  
  // Fill parent
  fill: {
    flex: 1
  },
  fullWidth: {
    width: '100%'
  },
  fullHeight: {
    height: '100%'
  }
};

/**
 * Shadow styles
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5
  }
};