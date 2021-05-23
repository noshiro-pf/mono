import type { ReadonlyNonEmptyArray } from '@noshiro/ts-utils';
import {
  first,
  isNonEmpty,
  ituple,
  map,
  pipe,
  rest,
  scan,
} from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: readonly number[],
  useLog: boolean
): number[] => {
  if (!isNonEmpty(luminanceList)) return [];

  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: ReadonlyNonEmptyArray<number> = pipe(
    luminanceList
  ).chain(map((v: number) => (useLog ? Math.log(v + 0.05) : v + 0.05))).value;

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
