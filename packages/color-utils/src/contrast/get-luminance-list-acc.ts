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
} from 'noshiro-ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: readonly number[]
): readonly number[] => {
  if (!isNonEmpty(luminanceList)) return [];

  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: ReadonlyNonEmptyArray<number> = pipe(
    luminanceList,
    neaMap((v: number) => Math.log(v + 0.05))
  );

  const luminanceDiffAccumulated = pipe(
    rest(luminanceListCorrected),
    scan(
      ([prev, acc], curr) => tuple(curr, acc + Math.abs(curr - prev)),
      tuple(first(luminanceListCorrected), 0)
    ),
    map(([_, acc]) => acc)
  );

  return luminanceDiffAccumulated;
};
