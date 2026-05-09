import { type StrictOmit } from 'ts-type-forge';

type Type<A> = Readonly<{
  typeName: string; // Human-readable type name
  defaultValue: A; // Default value for this type
  is: (a: unknown) => a is A; // Type guard function
  assertIs: (a: unknown) => asserts a is A; // Type assertion
  cast: (a: unknown) => A; // Cast with fallback to default
  fill: (a: unknown) => A; // Fill missing values with defaults
  validate: (a: unknown) => Result<A, readonly ValidationError[]>; // Detailed validation
}>;

// embed-sample-code-ignore-below
/* eslint-disable import-x/first */
import { expectType, type Result } from 'ts-data-forge';
import {
  type Type as Type_,
  type ValidationError,
} from '../../../../src/index.mjs';

expectType<Type<number>, StrictOmit<Type_<number>, 'optional'>>('=');
