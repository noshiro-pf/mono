import type { NonEmptyArray, ReadonlyNonEmptyArray } from '../../../array';
import { first, map, rest, scan } from '../../../array';
import { pipe } from '../../../functional';
import { ituple } from '../../../others';

export const getLuminanceListAccumulated = (
  luminanceList: ReadonlyNonEmptyArray<number>
): NonEmptyArray<number> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected = pipe(luminanceList).chain(
    map((v: number) => Math.log(v + 0.05))
  ).value;

  const luminanceDiffAccumulated = pipe(rest(luminanceListCorrected))
    .chain(
      scan(
        ([prev, acc], curr) => ituple(curr, acc + Math.abs(curr - prev)),
        ituple(first(luminanceListCorrected), 0)
      )
    )
    .chain(map(([_, acc]: readonly [number, number]) => acc)).value;

  return luminanceDiffAccumulated;
};
