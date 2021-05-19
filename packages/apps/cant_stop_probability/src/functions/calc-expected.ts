import type { uint32 } from '@noshiro/ts-utils';
import type { Count } from '../types';

/**
 * （計算式）
 *
 * 既にN段進んでいるとき、あと1回ダイスを振って期待値がプラスになるには、
 *
 * P0 := 〈すべての列が外れてチャラになる確率〉
 * P1 := 〈出た目でちょうど1列進められる確率〉
 * P2 := 〈出た目でちょうど2列進められる確率〉
 *
 * として
 *
 * -N * P0 + 1 * P1 + 2 * P2 >0
 *
 * である必要がある。
 *
 * 条件を満たすNの最大値は
 * N = floor((P1 + 2 * P2) / P0)
 * で求められる。
 */

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const calcExpected = (count: Count): uint32 => {
  const { noLine, oneLine, twoLine } = count as { [K in keyof Count]: number };
  return Math.floor((oneLine + 2 * twoLine) / noLine) as uint32;
};
