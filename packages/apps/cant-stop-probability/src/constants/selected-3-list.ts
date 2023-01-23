import { type TwoDiceSumValue } from '../types';
import { twoDiceSumSet } from './two-dice-sum-set';

const t = twoDiceSumSet();

export const selected3List = (): readonly [
  TwoDiceSumValue,
  TwoDiceSumValue,
  TwoDiceSumValue
][] => {
  const mut_result: [TwoDiceSumValue, TwoDiceSumValue, TwoDiceSumValue][] = [];

  for (const x of t) {
    for (const y of t) {
      if (y <= x) continue;
      for (const z of t) {
        if (z <= y) continue;
        mut_result.push(
          [x, y, z].sort((a, b) => a - b) as [
            TwoDiceSumValue,
            TwoDiceSumValue,
            TwoDiceSumValue
          ]
        );
      }
    }
  }
  return mut_result;
};
