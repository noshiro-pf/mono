import { asUint32 } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { average, count, sum } from './utils.mjs';

/**
 * `map` over a four-tuple, keeping its length in the type.
 *
 * `Array.prototype.map` widens a tuple to `U[]`, which is why the
 * pre-restoration source cast its result back on every call. Writing the four
 * positions out is total, so the casts — and their
 * `total-functions/no-unsafe-type-assertion` disables — go away.
 */
const map4 = <T, U>(
  tuple: FixedLengthTuple<4, T>,
  // A literal index, not `number`: callers index other four-tuples with it,
  // and under `noUncheckedIndexedAccess` only a literal makes that total.
  mapFn: (value: T, index: 0 | 1 | 2 | 3) => U,
): FixedLengthTuple<4, U> =>
  [
    mapFn(tuple[0], 0),
    mapFn(tuple[1], 1),
    mapFn(tuple[2], 2),
    mapFn(tuple[3], 3),
  ] as const;

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
  const sumOfRawPoints = sum(rawPoints);

  if (sumOfRawPoints !== 100_000) {
    throw new Error(
      `The sum of sumOfRawPoints is expected to be 100000, but is actually ${sumOfRawPoints}.`,
    );
  }

  /** E.g. `[35000, 35000, 20000, 10000]` */
  // `toSorted` widens the tuple to `number[]`, and `noUncheckedIndexedAccess`
  // makes each read `number | undefined`. Sorting four numbers yields four
  // numbers, so naming the positions is total — and says so without a cast.
  const descending = rawPoints.toSorted((x, y) => y - x);

  const rawPointsSorted: FixedLengthTuple<4, number> = [
    descending[0] ?? 0,
    descending[1] ?? 0,
    descending[2] ?? 0,
    descending[3] ?? 0,
  ] as const;

  /** E.g. `[35, 35, 20, 10]` */
  const pointsRounded: FixedLengthTuple<4, number> = map4(
    rawPointsSorted,
    (v) => v / 1000,
  );

  const sumOfPointsRounded = sum(pointsRounded);

  if (sumOfPointsRounded !== 100) {
    throw new Error(
      `The sum of sumOfPointsRounded is expected to be 100, but is actually ${sumOfPointsRounded}.`,
    );
  }

  /** E.g. `[0, 0, 2, 3]` */
  const rank: FixedLengthTuple<4, number> = map4(pointsRounded, (x) =>
    pointsRounded.indexOf(x),
  );

  /** E.g. `[2, 0, 1, 1]` */
  const rankCount: FixedLengthTuple<4, number> = map4(rank, (_, i) =>
    count(rank, (x) => x === i),
  );

  /**
   * 同点の場合は折半
   *
   * E.g. `[10, 0, -5, -15]`
   */
  const umaAveraged: FixedLengthTuple<4, number> = map4(uma, (_, i) =>
    average(uma.slice(i, asUint32(rankCount[i] + i))),
  );

  /** E.g. 4 * (30000 - 25000) / 1000 = 20 */
  const topBonus: number = (4 * (oka - 25_000)) / 1000;

  /**
   * 同点トップが複数いる場合折半
   *
   * E.g. 10
   */
  // eslint-disable-next-line total-functions/no-partial-division
  const topBonusAveraged: number = topBonus / rankCount[0];

  const result: FixedLengthTuple<4, number> = map4(
    pointsRounded,
    (p, i) =>
      p -
      oka / 1000 +
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      umaAveraged[rank[i]]! +
      (rank[i] === 0 ? topBonusAveraged : 0),
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const mp = new Map(rawPointsSorted.map((p, i) => [p, result[i]!]));

  return mp;
};
