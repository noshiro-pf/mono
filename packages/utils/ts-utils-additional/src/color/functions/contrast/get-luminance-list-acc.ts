import { IList, pipe, tp } from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: ReadonlyNonEmptyArray<number>
): ReadonlyNonEmptyArray<number> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected = pipe(luminanceList).chain((list) =>
    IList.map(list, (v: number) => Math.log(v + 0.05))
  ).value;

  const luminanceDiffAccumulated = pipe(luminanceListCorrected)
    .chain(IList.rest)
    .chain((list) =>
      IList.scan(
        list,
        ([prev, acc], curr) => tp(curr, acc + Math.abs(curr - prev)),
        tp(IList.first(luminanceListCorrected), 0)
      )
    )
    .chain((list) =>
      IList.map(list, ([_, acc]: readonly [number, number]) => acc)
    ).value;

  return luminanceDiffAccumulated;
};
