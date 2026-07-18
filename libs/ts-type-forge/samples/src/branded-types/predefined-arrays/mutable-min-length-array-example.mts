import { type MinLengthArray, type MutableMinLengthArray } from 'ts-type-forge';

// embed-sample-code-ignore-above

const history = [0, 1, 2, 3] as unknown as MutableMinLengthArray<3, number>;

history[0] = 10; // OK — elements are mutable
const first: number = history[0]; // OK — no `undefined` below min(N, 10)
const readonlyView: MinLengthArray<3, number> = history; // OK
// const longer: MutableMinLengthArray<5, number> = history; // Error! (3 < 5)

// embed-sample-code-ignore-below
export { first, history, readonlyView };
