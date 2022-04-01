import { setIntersection } from '@noshiro/ts-utils';
import { diceValueSet } from '../constants';
import type { TwoDiceSumValue } from '../types';
import { possibleTwoDiceSums } from './possible-two-dice-sums';

// 踏破されていない列のいずれかが出る場合の数
export const countSuccessForRemains = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  columnsAlive: ReadonlySet<TwoDiceSumValue>
): number => {
  let mut_count = 0;

  for (const a of diceValueSet) {
    for (const b of diceValueSet) {
      for (const c of diceValueSet) {
        for (const d of diceValueSet) {
          if (
            setIntersection(columnsAlive, possibleTwoDiceSums(a, b, c, d))
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
