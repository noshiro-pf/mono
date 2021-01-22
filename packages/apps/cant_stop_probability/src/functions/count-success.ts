import { setIsSuperset } from '@mono/ts-utils';
import { denom } from '../constants/denom';
import { diceValueSet } from '../constants/dice-value-set';
import { twoDiceSumSet } from '../constants/two-dice-sum-set';
import { TwoDiceSumValue } from '../types/two-dice-sum-value';
import { possibleTwoDiceSums } from './possible-two-dice-sums';

export const countSuccess = (
  x: TwoDiceSumValue,
  y: TwoDiceSumValue,
  z: TwoDiceSumValue
): number => {
  const rest: Set<TwoDiceSumValue> = twoDiceSumSet();
  rest.delete(x);
  rest.delete(y);
  rest.delete(z);

  let ng: number = 0;

  for (const a of diceValueSet) {
    for (const b of diceValueSet) {
      for (const c of diceValueSet) {
        for (const d of diceValueSet) {
          if (setIsSuperset(rest, possibleTwoDiceSums(a, b, c, d))) {
            ng += 1;
          }
        }
      }
    }
  }

  return denom - ng;
};
