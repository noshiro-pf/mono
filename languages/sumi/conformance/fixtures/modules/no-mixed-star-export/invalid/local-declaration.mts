export * from '../first.mjs';

// @sumi-expect-error modules/no-mixed-star-export
export const helper = (x: number): number => x + 1;
