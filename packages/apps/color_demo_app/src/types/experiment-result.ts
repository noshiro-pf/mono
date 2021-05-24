import type { Hsl, Hue } from '@noshiro/ts-utils';

export type ExperimentResult = Readonly<{
  accumulatedDistribution: readonly (readonly [Hsl, number])[];
  pickedUpHues: readonly Hue[];
  adjacentContrastRatioList: readonly number[];
  adjacentContrastRatioVariance: number;
}>;
