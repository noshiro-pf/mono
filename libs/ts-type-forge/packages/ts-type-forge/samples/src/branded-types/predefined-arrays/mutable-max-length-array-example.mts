import { type MaxLengthArray, type MutableMaxLengthArray } from 'ts-type-forge';

// embed-sample-code-ignore-above

const tags = ['a', 'b', 'c'] as unknown as MutableMaxLengthArray<8, string>;

tags[0] = 'z'; // OK — elements are mutable
const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
// const strict: MutableMaxLengthArray<2, string> = tags; // Error! (8 > 2)

// embed-sample-code-ignore-below
export { relaxed, tags };
