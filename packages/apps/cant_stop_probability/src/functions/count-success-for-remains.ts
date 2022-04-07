import { ISet } from '@noshiro/ts-utils';
import { diceValueSet } from '../constants';
import type { TwoDiceSumValue } from '../types';
import { possibleTwoDiceSums } from './possible-two-dice-sums';

// 踏破されていない列のいずれかが出る場合の数
export const countSuccessForRemains = (
  columnsAlive: ISet<TwoDiceSumValue>
): number => {
  let mut_count = 0;

  for (const a of diceValueSet) {
    for (const b of diceValueSet) {
      for (const c of diceValueSet) {
        for (const d of diceValueSet) {
          if (
            ISet.intersection(columnsAlive, possibleTwoDiceSums(a, b, c, d))
              .size > 0
          ) {
            mut_count += 1;
          }
        }
      }
    }
  }

  return mut_count;
};
