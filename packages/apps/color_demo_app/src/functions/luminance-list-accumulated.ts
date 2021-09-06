import type { ReadonlyNonEmptyArray } from '@noshiro/ts-utils';
import { IList, ituple, pipe } from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: readonly number[],
  useLog: boolean
): readonly number[] => {
  if (!IList.isNonEmpty(luminanceList)) return [];

  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: ReadonlyNonEmptyArray<number> = pipe(
    luminanceList
  ).chain((list) =>
    IList.map(list, (v: number) => (useLog ? Math.log(v + 0.05) : v + 0.05))
  ).value;

  const luminanceDiffAccumulated = pipe(IList.rest(luminanceListCorrected))
    .chain((list) =>
      IList.scan(
        list,
        ([prev, acc], curr) => ituple(curr, acc + Math.abs(curr - prev)),
        ituple(IList.first(luminanceListCorrected), 0)
      )
    )
    .chain((list) =>
      IList.map(list, ([_, acc]: readonly [number, number]) => acc)
    ).value;

  return luminanceDiffAccumulated;
};
