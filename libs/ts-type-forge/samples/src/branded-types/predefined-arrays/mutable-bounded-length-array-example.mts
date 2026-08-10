import {
  type BoundedLengthArray,
  type MutableBoundedLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const selection = [1, 2, 3] as unknown as MutableBoundedLengthArray<
  1,
  5,
  number
>;

selection[0] = 10; // OK — elements are mutable
const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK ([1, 5] ⊆ [0, 100])
// const strict: MutableBoundedLengthArray<2, 5, number> = selection; // Error! (1 < 2)

// embed-sample-code-ignore-below
export { relaxed, selection };
