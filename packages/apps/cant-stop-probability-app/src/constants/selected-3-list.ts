import { type TwoDiceSumValue } from '../types';
import { twoDiceSumSet } from './two-dice-sum-set';

const t = twoDiceSumSet();

export const selected3List = (): readonly ArrayOfLength<
  3,
  TwoDiceSumValue
>[] => {
  const mut_result: ArrayOfLength<3, TwoDiceSumValue>[] = [];

  for (const x of t) {
    for (const y of t) {
      if (y <= x) continue;
      for (const z of t) {
        if (z <= y) continue;
        mut_result.push(Tpl.sorted([x, y, z] as const));
      }
    }
  }
  return mut_result;
};
