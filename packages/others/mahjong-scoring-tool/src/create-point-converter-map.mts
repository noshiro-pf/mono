import { toUint32 } from '@noshiro/mono-utils';
import { type ArrayOfLength4 } from './types.mjs';
import { average, count, sum } from './utils.mjs';

/**
 * 点棒からオカ・ウマを計算して pt に変換する Map を返す。
 *
 * @param rawPoints (e.g. [35000, 20000, 35000, 10000])
 * @param oka (e.g. 30000)
 * @param uma (e.g. [15, 5, -5, -15])
 */
export const createPointMap = (
  rawPoints: ArrayOfLength4<number>,
  oka: number,
  uma: ArrayOfLength4<number>,
): ReadonlyMap<number, number> => {
  const sumOfRawPoints = sum(rawPoints);

  if (sumOfRawPoints !== 100_000) {
    throw new Error(
      `The sum of sumOfRawPoints is expected to be 100000, but is actually ${sumOfRawPoints}.`,
    );
  }

  /** E.g. `[35000, 35000, 20000, 10000]` */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const rawPointsSorted: ArrayOfLength4<number> = rawPoints.toSorted(
    (x, y) => y - x,
  ) as ArrayOfLength4<number>;

  /** E.g. `[35, 35, 20, 10]` */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const pointsRounded: ArrayOfLength4<number> = rawPointsSorted.map(
    (v) => v / 1000,
  ) as unknown as ArrayOfLength4<number>;

  const sumOfPointsRounded = sum(pointsRounded);
  if (sumOfPointsRounded !== 100) {
    throw new Error(
      `The sum of sumOfPointsRounded is expected to be 100, but is actually ${sumOfPointsRounded}.`,
    );
  }

  /** E.g. `[0, 0, 2, 3]` */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const rank: ArrayOfLength4<number> = pointsRounded.map((x) =>
    pointsRounded.indexOf(x),
  ) as ArrayOfLength4<number>;

  /** E.g. `[2, 0, 1, 1]` */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const rankCount: ArrayOfLength4<number> = rank.map((_, i) =>
    count(rank, (x) => x === i),
  ) as ArrayOfLength4<number>;

  /**
   * 同点の場合は折半
   *
   * E.g. `[10, 0, -5, -15]`
   */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const umaAveraged: ArrayOfLength4<number> = uma.map((_, i) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    average(uma.slice(i, toUint32(rankCount[i]! + i))),
  ) as ArrayOfLength4<number>;

  /** E.g. 4 * (30000 - 25000) / 1000 = 20 */
  const topBonus: number = (4 * (oka - 25_000)) / 1000;

  /**
   * 同点トップが複数いる場合折半
   *
   * E.g. 10
   */
  // eslint-disable-next-line total-functions/no-partial-division
  const topBonusAveraged: number = topBonus / rankCount[0];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const result: ArrayOfLength4<number> = pointsRounded.map(
    (p, i) =>
      p -
      oka / 1000 +
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      umaAveraged[rank[i]!]! +
      (rank[i] === 0 ? topBonusAveraged : 0),
  ) as ArrayOfLength4<number>;

  // eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-non-null-assertion
  const mp = new Map(rawPointsSorted.map((p, i) => [p, result[i]!]));

  return mp;
};
