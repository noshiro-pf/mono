import { type Result } from '@noshiro/ts-utils';

/**
 * - `typeName` : Name for this type
 * - `is` : Type guard function
 * - `assertIs` : Type assertion function
 * - `cast` : Cast function
 * - `fill` : Default value filling function
 * - `validate` : A base function to be used in `is` and `assertIs`. `validate`
 *   returns Result.Ok if the value is of Type A, otherwise returns Result.Err
 *   with error message stack as the value.
 */
export type Type<A> = Readonly<{
  typeName: string;
  defaultValue: A;
  is: (a: unknown) => a is A;
  assertIs: (a: unknown) => asserts a is A;
  cast: (a: unknown) => A;
  fill: (a: unknown) => A;
  validate: (a: unknown) => Result<A, readonly string[]>;

  /** Used in record type */
  optional?: true;
}>;

export type TypeOf<A extends Type<unknown>> = A['defaultValue'];

export type OptionalType<A> = MergeIntersection<
  Type<A> & Readonly<{ optional: true }>
>;
