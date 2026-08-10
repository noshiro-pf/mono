/** Helper function for formatting ratios as CSS percentage values. */
export const formatPercentage = (ratio: number): string =>
  `${(ratio * 100).toFixed(2)}%`;
