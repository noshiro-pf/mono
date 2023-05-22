import { Arr, pipe, tp, Tpl } from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: NonEmptyArray<number>
): NonEmptyArray<number> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected = pipe(luminanceList).chain((list) =>
    Tpl.map(list, (v: number) => Math.log(v + 0.05))
  ).value;

  const luminanceDiffAccumulated = pipe(luminanceListCorrected)
    .chain(Arr.rest)
    .chain((list) =>
      Arr.scan(
        list,
        ([prev, acc], curr) => tp(curr, acc + Math.abs(curr - prev)),
        tp(Arr.first(luminanceListCorrected), 0)
      )
    )
    .chain((list) =>
      Tpl.map(list, ([_, acc]: readonly [number, number]) => acc)
    ).value;

  return luminanceDiffAccumulated;
};
