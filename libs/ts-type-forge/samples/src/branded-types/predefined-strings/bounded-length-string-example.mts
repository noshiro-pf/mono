import {
  type BoundedLengthString,
  type MaxLengthString,
  type MinLengthString,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const userId = 'user-12345678' as BoundedLengthString<8, 16>;

const relaxed: BoundedLengthString<1, 255> = userId; // OK ([8, 16] ⊆ [1, 255])
const atLeast8: MinLengthString<8> = userId; // OK
const atMost16: MaxLengthString<16> = userId; // OK
// const strict: BoundedLengthString<10, 16> = userId; // Error! (8 < 10)

// embed-sample-code-ignore-below
export { atLeast8, atMost16, relaxed };
