import {
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const rgb = [255, 128, 0] as unknown as FixedLengthArray<3, number>;

const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
const nonEmpty: MinLengthArray<1, number> = rgb; // OK (3 >= 1)
const red: number = rgb[0]; // OK — in-range indexed access (N <= 10)
const len: 3 = rgb.length; // `length` is the literal N (N <= 10)
// const rgba: FixedLengthArray<4, number> = rgb; // Error!

// embed-sample-code-ignore-below
export { atMost5, len, nonEmpty, red };
