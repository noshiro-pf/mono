import { type Hsl, type Hue } from '@noshiro/ts-utils-additional';

export type ColorResult = DeepReadonly<{
  accumulatedDistribution: [Hsl, NonNegativeFiniteNumber][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: PositiveFiniteNumber[];
  adjacentContrastRatioVariance: NonNegativeFiniteNumber;
}>;
