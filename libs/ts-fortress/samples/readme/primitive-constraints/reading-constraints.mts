/* eslint-disable import-x/first */
const IGNORE_EMBEDDING = (..._args: readonly unknown[]): void => {};

// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

const SignupForm = t.record({
  age: t.int(20, { min: 0, max: 120 }),
  displayName: t.string('a', { minLength: 1, maxLength: 32 }),
});

// The values the schema validates against are readable back off it, so a form
// control can be driven by the same numbers instead of a second copy of them.
const age = t.at(SignupForm, 'age');

const min: 0 = age.constraints.min;

const max: 120 = age.constraints.max;

// A constraint that was not specified is `undefined` — not `number | undefined`
const step: undefined = age.constraints.step;

// The record's shape reaches the same member type directly
const maxLength: 32 = SignupForm.shape.displayName.constraints.maxLength;

// embed-sample-code-ignore-below
IGNORE_EMBEDDING(min, max, step, maxLength);
