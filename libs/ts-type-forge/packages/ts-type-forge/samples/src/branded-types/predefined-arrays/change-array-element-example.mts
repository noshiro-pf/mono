import {
  type ChangeArrayElement,
  type FixedLengthArray,
  type MinLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type A = ChangeArrayElement<MinLengthArray<3, number>, string>;
// MinLengthArray<3, string>

type B = ChangeArrayElement<FixedLengthArray<3, number>, string>;
// FixedLengthArray<3, string>

type C = ChangeArrayElement<readonly [number, number], string>;
// readonly [string, string]

type D = ChangeArrayElement<readonly number[], string>; // readonly string[]

// embed-sample-code-ignore-below
export type { A, B, C, D };
