import { asSafeUint } from 'ts-data-forge';
import { type MutableRecord } from 'ts-type-forge';
import { diceValueList } from '../constants/index.mjs';
import {
  type Count,
  type DiceValue,
  type TwoDiceSumValue,
} from '../types/index.mjs';
import { possibleTwoDiceSumPairs } from './possible-two-dice-sum-pair.mjs';

/** Which counter a single roll of four dice contributes to. */
type Progress = keyof Count;

/**
 * How far the three chosen columns can be advanced by one roll.
 *
 * Extracted from the four nested loops below, which used `continue` to pick
 * between the three outcomes — the loops now just read the answer.
 */
const progressFor = (
  x: TwoDiceSumValue,
  y: TwoDiceSumValue,
  z: TwoDiceSumValue,
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue,
): Progress => {
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
    return 'twoLine';
  }

  const x1 = pair1.includes(x);

  const y1 = pair1.includes(y);

  const z1 = pair1.includes(z);

  const x2 = pair2.includes(x);

  const y2 = pair2.includes(y);

  const z2 = pair2.includes(z);

  const x3 = pair3.includes(x);

  const y3 = pair3.includes(y);

  const z3 = pair3.includes(z);

  // どれか2列を1段ずつ進められる組み合わせ
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
    return 'twoLine';
  }

  if (x1 || x2 || x3 || y1 || y2 || y3 || z1 || z2 || z3) {
    return 'oneLine';
  }

  return 'noLine';
};

export const countSuccess = (
  x: TwoDiceSumValue,
  y: TwoDiceSumValue,
  z: TwoDiceSumValue,
): Count => {
  const mut_count: MutableRecord<Progress, number> = {
    oneLine: 0,
    twoLine: 0,
    noLine: 0,
  };

  for (const a of diceValueList) {
    for (const b of diceValueList) {
      for (const c of diceValueList) {
        for (const d of diceValueList) {
          mut_count[progressFor(x, y, z, a, b, c, d)] += 1;
        }
      }
    }
  }

  return {
    noLine: asSafeUint(mut_count.noLine),
    oneLine: asSafeUint(mut_count.oneLine),
    twoLine: asSafeUint(mut_count.twoLine),
  };
};
