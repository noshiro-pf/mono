import { type Hsl, type Hue } from '@noshiro/ts-utils-additional';

export type ColorResult = DeepReadonly<{
  accumulatedDistribution: [Hsl, number][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: number[];
  adjacentContrastRatioVariance: number;
}>;
