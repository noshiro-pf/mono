import {
  type BoundedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const selection = [1, 2, 3] as unknown as BoundedLengthArray<1, 5, number>;

const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK ([1, 5] ⊆ [0, 100])
const atLeast1: MinLengthArray<1, number> = selection; // OK
const atMost5: MaxLengthArray<5, number> = selection; // OK
// const strict: BoundedLengthArray<2, 5, number> = selection; // Error! (1 < 2)

// embed-sample-code-ignore-below
export { atLeast1, atMost5, relaxed };
