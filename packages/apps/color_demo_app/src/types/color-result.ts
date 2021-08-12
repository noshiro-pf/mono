import type { DeepReadonly, Hsl, Hue } from '@noshiro/ts-utils';

export type ColorResult = DeepReadonly<{
  accumulatedDistribution: [Hsl, number][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: number[];
  adjacentContrastRatioVariance: number;
}>;
