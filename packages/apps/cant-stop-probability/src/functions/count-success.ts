import { diceValueSet } from '../constants';
import { type Count, type TwoDiceSumValue } from '../types';
import { possibleTwoDiceSumPairs } from './possible-two-dice-sum-pair';

export const countSuccess = (
  x: TwoDiceSumValue,
  y: TwoDiceSumValue,
  z: TwoDiceSumValue
): Count => {
  const mut_count: Writable<Count> = {
    oneLine: 0,
    twoLine: 0,
    noLine: 0,
  };

  for (const a of diceValueSet) {
    for (const b of diceValueSet) {
      for (const c of diceValueSet) {
        for (const d of diceValueSet) {
          const [pair1, pair2, pair3] = possibleTwoDiceSumPairs(a, b, c, d);
          // どれか1列を2段進められる組み合わせ
          if (
            (pair1[0] === pair1[1] &&
              (x === pair1[0] || y === pair1[0] || z === pair1[0])) ||
            (pair2[0] === pair2[1] &&
              (x === pair2[0] || y === pair2[0] || z === pair2[0])) ||
            (pair3[0] === pair3[1] &&
              (x === pair3[0] || y === pair3[0] || z === pair3[0]))
          ) {
            mut_count.twoLine += 1;
            continue;
          }

          // どれか2列を1段ずつ進められる組み合わせ
          const x1 = pair1.includes(x);
          const y1 = pair1.includes(y);
          const z1 = pair1.includes(z);
          const x2 = pair2.includes(x);
          const y2 = pair2.includes(y);
          const z2 = pair2.includes(z);
          const x3 = pair3.includes(x);
          const y3 = pair3.includes(y);
          const z3 = pair3.includes(z);
          if (
            (x1 && y1) ||
            (x2 && y2) ||
            (x3 && y3) ||
            (x1 && z1) ||
            (x2 && z2) ||
            (x3 && z3) ||
            (y1 && z1) ||
            (y2 && z2) ||
            (y3 && z3)
          ) {
            mut_count.twoLine += 1;
            continue;
          }

          if (x1 || x2 || x3 || y1 || y2 || y3 || z1 || z2 || z3) {
            mut_count.oneLine += 1;
            continue;
          }
          mut_count.noLine += 1;
        }
      }
    }
  }

  return mut_count as Count;
};
