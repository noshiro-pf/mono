import {
  Arr,
  asFiniteNumber,
  asNonNegativeFiniteNumber,
  FiniteNumber,
  NonNegativeFiniteNumber,
  tp,
} from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

export const getLuminanceListAccumulated = (
  luminanceList: NonEmptyArray<NonNegativeFiniteNumber>,
  useLog: boolean,
): NonEmptyArray<NonNegativeFiniteNumber> => {
  /* +0.05はコントラスト比計算時に足される補正項  */
  const luminanceListCorrected: NonEmptyArray<FiniteNumber> = Arr.map(
    luminanceList,
    (v) => asFiniteNumber(useLog ? Math.log(v + 0.05) : v + 0.05),
  );

  // `.slice(1)` rather than `Arr.rest`: the latter's `const` type parameter
  // reconstructs the tail as a tuple, and at this length `tsc` gives up with
  // TS2590. Only the element type matters downstream.
  const rest: readonly FiniteNumber[] = luminanceListCorrected.slice(1);

  // Annotated so that `Arr.scan` infers `S` as the declared pair type;
  // `asNonNegativeFiniteNumber(0)` on its own carries a narrower brand.
  const init: readonly [FiniteNumber, NonNegativeFiniteNumber] = tp(
    luminanceListCorrected[0],
    asNonNegativeFiniteNumber(0),
  );

  const luminanceDiffAccumulated: NonEmptyArray<
    readonly [FiniteNumber, NonNegativeFiniteNumber]
  > = Arr.scan(
    rest,
    ([prev, acc], curr) =>
      tp(
        curr,
        NonNegativeFiniteNumber.add(
          acc,
          FiniteNumber.abs(FiniteNumber.sub(curr, prev)),
        ),
      ),
    init,
  );

  return Arr.map(luminanceDiffAccumulated, ([, acc]) => acc);
};
