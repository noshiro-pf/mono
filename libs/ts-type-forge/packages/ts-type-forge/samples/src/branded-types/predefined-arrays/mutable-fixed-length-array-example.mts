import {
  type FixedLengthArray,
  type MutableFixedLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const rgb = [255, 128, 0] as unknown as MutableFixedLengthArray<3, number>;

rgb[0] = 200; // OK — elements are mutable
const len: 3 = rgb.length; // `length` is the literal N (N <= 10)
const readonlyView: FixedLengthArray<3, number> = rgb; // OK
// const rgba: MutableFixedLengthArray<4, number> = rgb; // Error!

// embed-sample-code-ignore-below
export { len, readonlyView, rgb };
