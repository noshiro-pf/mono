import {
  type NonNegativeFiniteNumber,
  type PositiveFiniteNumber,
} from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type Hsl, type Hue } from 'ts-utils-additional';

export type ColorResult = DeepReadonly<{
  accumulatedDistribution: [Hsl, NonNegativeFiniteNumber][];
  pickedUpHues: Hue[];
  adjacentContrastRatioList: PositiveFiniteNumber[];
  adjacentContrastRatioVariance: NonNegativeFiniteNumber;
}>;
