import { asSafeUint, ISet, type SafeUint } from 'ts-data-forge';
import { diceValueList } from '../constants/index.mjs';
import { type TwoDiceSumValue } from '../types/index.mjs';
import { possibleTwoDiceSums } from './possible-two-dice-sums.mjs';

// 踏破されていない列のいずれかが出る場合の数
export const countSuccessForRemains = (
  columnsAlive: ISet<TwoDiceSumValue>,
): SafeUint => {
  let mut_count = 0;

  for (const a of diceValueList) {
    for (const b of diceValueList) {
      for (const c of diceValueList) {
        for (const d of diceValueList) {
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

  return asSafeUint(mut_count);
};
