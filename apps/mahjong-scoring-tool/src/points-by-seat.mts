import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { average } from './utils.mjs';

/**
 * 点棒からオカ・ウマを計算した pt を、席順（`rawPoints` の順）に返す。
 *
 * - 配給原点は点棒の合計 ÷ 4（例: 合計 100000 なら 25000）。トップ賞（オカ）は
 *   4 ×（`oka` − 配給原点）。
 * - 同点の場合、ウマとトップ賞はその順位の間で折半する。
 * - 各自を 0.1 pt に四捨五入（0 から遠い方へ）し、合計が 0 からずれた分はトップが
 *   受け取る。トップが同点なら、そのうち席順で最初の人が受け取る。
 *
 * @param rawPoints Each seat's points (e.g. `[35000, 20000, 35000, 10000]`).
 * @param oka E.g. `30000`.
 * @param uma By rank, in thousands (e.g. `[15, 5, -5, -15]`).
 * @returns Each seat's result in pt, a multiple of 0.1, summing to 0.
 */
export const pointsBySeat = (
  rawPoints: FixedLengthTuple<4, number>,
  oka: number,
  uma: FixedLengthTuple<4, number>,
): FixedLengthTuple<4, number> => {
  const startingStack = Arr.sum(rawPoints) / 4;

  /** E.g. `[35000, 35000, 20000, 10000]` */
  const sorted: FixedLengthTuple<4, number> = Arr.toSorted(
    rawPoints,
    (x, y) => y - x,
  );

  /** A score's rank, the first of the ranks it shares: `35000` → `0`. */
  const rankOf = (points: number): number => sorted.indexOf(points);

  /** How many seats share the rank of `points`. */
  const tiedCount = (points: number): number =>
    Arr.count(rawPoints, (p) => p === points);

  /** The uma of the ranks a score shares, averaged. */
  const umaOf = (points: number): number =>
    average(
      uma
        .slice(rankOf(points), rankOf(points) + tiedCount(points))
        .map((u) => u * 1000),
    );

  /** E.g. 4 * (30000 - 25000) = 20000 */
  const topBonus = 4 * (oka - startingStack);

  const [top] = sorted;

  // Every term is in points, counted in tenths of a pt (100 points) once, so
  // that a score such as 23100 gives -19 tenths rather than the error that
  // 23.1 - 30 carries.
  const tenths = Arr.map(rawPoints, (p) =>
    roundHalfAwayFromZero(
      (p -
        oka +
        umaOf(p) +
        // eslint-disable-next-line total-functions/no-partial-division -- at least one seat holds the top
        (p === top ? topBonus / tiedCount(p) : 0)) /
        100,
    ),
  );

  const remainder = -Arr.sum(tenths);

  const firstTopSeat = rawPoints.indexOf(top);

  return Arr.map(
    tenths,
    (t, seat) => (seat === firstTopSeat ? t + remainder : t) / 10,
  );
};

/**
 * `x` rounded to an integer, a half going away from zero: `-19.5` → `-20`.
 * `+ 0` turns the `-0` that a small negative `x` rounds to into `0`.
 */
const roundHalfAwayFromZero = (x: number): number =>
  Math.sign(x) * Math.round(Math.abs(x)) + 0;
