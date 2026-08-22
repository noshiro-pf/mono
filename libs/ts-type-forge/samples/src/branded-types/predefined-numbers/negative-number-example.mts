import { type NegativeNumber, type PositiveNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegative = (x: number): x is NegativeNumber => x < 0;

// Widened to `number` before the assertion. The strict standard library types
// `Math.abs<N extends number>` as `AbsoluteValue<N>`, which is defined over
// number *literals* and hands anything else straight back — so there
// `Math.abs` of a `NegativeNumber` is itself typed `NegativeNumber`, and
// asserting that to `PositiveNumber` is rejected as a non-overlapping
// conversion. Going through `number` narrows rather than crosses, and reads
// the same under either library.
const absoluteValue = (x: NegativeNumber): PositiveNumber => {
  const magnitude: number = Math.abs(x);

  return magnitude as PositiveNumber;
};

const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });

// embed-sample-code-ignore-below
export { absoluteValue, debt, isNegative };
