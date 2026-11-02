import { Num } from 'ts-data-forge';
import type { Count } from '../types/index.mjs';

/**
 * （計算式）
 *
 * 既にN段進んでいるとき、あと1回ダイスを振って期待値がプラスになるには、
 *
 *     P0 := 〈すべての列が外れてチャラになる確率〉
 *     P1 := 〈出た目でちょうど1列進められる確率〉
 *     P2 := 〈出た目でちょうど2列進められる確率〉
 *
 * として
 *
 *     -N * P0 + 1 * P1 + 2 * P2 > 0;
 *
 * である必要がある。
 *
 * 条件を満たすNの最大値は (P1 + 2 * P2) / P0 より真に小さい最大の整数
 *
 *     N = ceil((P1 + 2 * P2) / P0) - 1;
 *
 * (P1 + 2 * P2 = 0 または P0 = 0 のときは 0 を返す)
 *
 * で求められる（比がちょうど整数のとき、その値では期待値が 0 になるので含めない）。
 */
export const calcExpected = (count: Count): number => {
  const { noLine, oneLine, twoLine } = count;

  const gain = oneLine + 2 * twoLine;

  // On the integer counts, floor((gain - 1) / noLine) is the largest N with
  // N * noLine < gain, with no rounding of an exact ratio to worry about.
  return Num.isPositive(noLine) && Num.isPositive(gain)
    ? Math.floor(Num.div(gain - 1, noLine))
    : 0;
};
