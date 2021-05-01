export const toPercentString = (probability: number): string =>
  `${(probability * 100).toFixed(1)}%`;
