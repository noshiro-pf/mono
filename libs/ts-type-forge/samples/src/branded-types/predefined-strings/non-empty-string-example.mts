import { type MinLengthString, type NonEmptyString } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonEmptyString = (s: string): s is NonEmptyString => s.length > 0;

const greeting = 'hello' as NonEmptyString;

const atLeastOne: MinLengthString<0> = greeting; // OK

// embed-sample-code-ignore-below
export { atLeastOne, isNonEmptyString };
