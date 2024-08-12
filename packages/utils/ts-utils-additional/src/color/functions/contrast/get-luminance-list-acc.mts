import {
  Arr,
  FiniteNumber,
  pipe,
  toFiniteNumber,
  tp,
  Tpl,
} from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: NonEmptyArray<NonNegativeFiniteNumber>,
): NonEmptyArray<FiniteNumber> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: NonEmptyArray<FiniteNumber> = pipe(
    luminanceList,
  ).chain((list) =>
    Tpl.map(list, (v) => toFiniteNumber(Math.log(v + 0.05))),
  ).value;

  const luminanceDiffAccumulated = pipe(luminanceListCorrected)
    .chain(Arr.rest)
    .chain((list) =>
      Arr.scan<FiniteNumber, readonly [FiniteNumber, FiniteNumber]>(
        list,
        ([prev, acc], curr) =>
          tp(
            curr,
            FiniteNumber.add(
              acc,
              FiniteNumber.abs(FiniteNumber.sub(curr, prev)),
            ),
          ),
        tp(Arr.first(luminanceListCorrected), toFiniteNumber(0)),
      ),
    )
    .chain((list) => Tpl.map(list, ([_, acc]) => acc)).value;

  return luminanceDiffAccumulated;
};
