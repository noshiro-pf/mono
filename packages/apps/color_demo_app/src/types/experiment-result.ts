import { Hsl, Hue } from '@noshiro/ts-utils';

export type ExperimentResult = {
  accumulatedDistribution: [Hsl, number][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: number[];
  adjacentContrastRatioVariance: number;
};
