import {
  first,
  isNonEmpty,
  map,
  neaMap,
  pipe,
  ReadonlyNonEmptyArray,
  rest,
  scan,
  tuple,
} from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: readonly number[],
  useLog: boolean
): number[] => {
  if (!isNonEmpty(luminanceList)) return [];

  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: ReadonlyNonEmptyArray<number> = pipe(
    luminanceList
  ).chain(neaMap((v: number) => (useLog ? Math.log(v + 0.05) : v + 0.05)))
    .value;

  const luminanceDiffAccumulated = pipe(rest(luminanceListCorrected))
    .chain(
      scan(
        ([prev, acc], curr) => tuple(curr, acc + Math.abs(curr - prev)),
        tuple(first(luminanceListCorrected), 0)
      )
    )
    .chain(map(([_, acc]) => acc)).value;

  return luminanceDiffAccumulated;
};
