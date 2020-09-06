import { Hsl, Hue } from '@mono/ts-utils';

export type ExperimentResult = {
  accumulatedDistribution: [Hsl, number][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: number[];
  adjacentContrastRatioVariance: number;
};
