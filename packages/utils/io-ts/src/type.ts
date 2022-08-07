import type { Result } from '@noshiro/ts-utils';

/**
 * @description
 * - `typeName` : Name for this type
 * - `validate` : A base function to be used in `is` and `assertIs`.
 *                `validate` returns Result.Ok if the value is of Type A,
 *                otherwise returns Result.Err with error message stack as the value.
 * - `is`       : Type guard function
 * - `assertIs` : Type assertion function
 */
export type Type<A> = Readonly<{
  typeName: string;
  defaultValue: A;
  is: (a: unknown) => a is A;
  assertIs: (a: unknown) => asserts a is A;
  fill: (a: unknown) => A;
  validate: (a: unknown) => Result<void, readonly string[]>;
}>;

export type TypeOf<A extends Type<unknown>> = A['defaultValue'];
