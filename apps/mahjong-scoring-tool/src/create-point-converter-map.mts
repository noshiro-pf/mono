import { Arr, asUint32 } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { average } from './utils.mjs';

/**
 * 点棒からオカ・ウマを計算して pt に変換する Map を返す。
 *
 * @param rawPoints (e.g. [35000, 20000, 35000, 10000])
 * @param oka (e.g. 30000)
 * @param uma (e.g. [15, 5, -5, -15])
 */
export const createPointMap = (
  rawPoints: FixedLengthTuple<4, number>,
  oka: number,
  uma: FixedLengthTuple<4, number>,
): ReadonlyMap<number, number> => {
  const sumOfRawPoints = Arr.sum(rawPoints);

  if (sumOfRawPoints !== 100_000) {
    throw new Error(
      `The sum of sumOfRawPoints is expected to be 100000, but is actually ${sumOfRawPoints}.`,
    );
  }

  /** E.g. `[35000, 35000, 20000, 10000]` */
  const rawPointsSorted: FixedLengthTuple<4, number> = Arr.toSorted(
    rawPoints,
    (x, y) => y - x,
  );

  /** E.g. `[0, 0, 2, 3]` */
  const rank: FixedLengthTuple<4, number> = Arr.map(rawPointsSorted, (x) =>
    rawPointsSorted.indexOf(x),
  );

  /** E.g. `[2, 0, 1, 1]` */
  const rankCount: FixedLengthTuple<4, number> = Arr.map(rank, (_, i) =>
    Arr.count(rank, (x) => x === i),
  );

  /** E.g. `[15000, 5000, -5000, -15000]` */
  const umaInRawPoints: FixedLengthTuple<4, number> = Arr.map(
    uma,
    (u) => u * 1000,
  );

  /**
   * 同点の場合は折半
   *
   * E.g. `[10000, 0, -5000, -15000]`
   */
  const umaAveraged: FixedLengthTuple<4, number> = Arr.map(
    umaInRawPoints,
    (_, i) => average(umaInRawPoints.slice(i, asUint32(rankCount[i] + i))),
  );

  /** E.g. 4 * (30000 - 25000) = 20000 */
  const topBonus: number = 4 * (oka - 25_000);

  /**
   * 同点トップが複数いる場合折半
   *
   * E.g. 10000
   */
  // eslint-disable-next-line total-functions/no-partial-division
  const topBonusAveraged: number = topBonus / rankCount[0];

  // Every term is in raw points and the sum is divided by 1000 once, so that a
  // score such as 23100 gives -1.9 rather than the error that 23.1 - 30
  // carries. A tie that splits a term into thirds still gives a repeating
  // fraction.
  const result: FixedLengthTuple<4, number> = Arr.map(
    rawPointsSorted,
    (p, i) =>
      (p -
        oka +
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        umaAveraged[rank[i]]! +
        (rank[i] === 0 ? topBonusAveraged : 0)) /
      1000,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const mp = new Map(rawPointsSorted.map((p, i) => [p, result[i]!]));

  return mp;
};
