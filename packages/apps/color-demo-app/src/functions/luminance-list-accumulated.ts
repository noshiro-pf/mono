export const getLuminanceListAccumulated = (
  luminanceList: NonEmptyArray<NonNegativeFiniteNumber>,
  useLog: boolean
): NonEmptyArray<NonNegativeFiniteNumber> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: NonEmptyArray<FiniteNumber> = pipe(
    luminanceList
  ).chain((list) =>
    Tpl.map(list, (v) => toFiniteNumber(useLog ? Math.log(v + 0.05) : v + 0.05))
  ).value;

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> = pipe(
    luminanceListCorrected
  )
    .chain(Arr.rest)
    .chain((list) =>
      Arr.scan(
        list,
        ([prev, acc], curr) =>
          tp(
            curr,
            NonNegativeFiniteNumber.add(
              acc,
              FiniteNumber.abs(FiniteNumber.sub(curr, prev))
            )
          ),
        tp(Arr.first(luminanceListCorrected), toNonNegativeFiniteNumber(0))
      )
    )
    .chain((list) => Tpl.map(list, ([_, acc]) => acc)).value;

  return luminanceDiffAccumulated;
};
