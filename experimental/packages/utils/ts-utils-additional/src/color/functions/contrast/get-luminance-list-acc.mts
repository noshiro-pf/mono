import {
  Arr,
  FiniteNumber,
  NonNegativeFiniteNumber,
  pipe,
  toFiniteNumber,
  toNonNegativeFiniteNumber,
  tp,
  Tpl,
} from '@noshiro/ts-utils';

export const getLuminanceListAccumulated = (
  luminanceList: NonEmptyArray<NonNegativeFiniteNumber>,
): NonEmptyArray<NonNegativeFiniteNumber> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: NonEmptyArray<FiniteNumber> = pipe(
    luminanceList,
  ).chain((list) =>
    Tpl.map(list, (v) => toFiniteNumber(Math.log(v + 0.05))),
  ).value;

  const luminanceDiffAccumulated = pipe(luminanceListCorrected)
    .chain(Arr.rest)
    .chain((list) =>
      Arr.scan<FiniteNumber, readonly [FiniteNumber, NonNegativeFiniteNumber]>(
        list,
        ([prev, acc], curr) =>
          tp(
            curr,
            NonNegativeFiniteNumber.add(
              acc,
              FiniteNumber.abs(FiniteNumber.sub(curr, prev)),
            ),
          ),
        tp(Arr.first(luminanceListCorrected), toNonNegativeFiniteNumber(0)),
      ),
    )
    .chain((list) => Tpl.map(list, ([_, acc]) => acc)).value;

  return luminanceDiffAccumulated;
};
