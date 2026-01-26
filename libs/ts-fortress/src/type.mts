import { expectType } from 'ts-data-forge';
import { type ValidationError } from './utils/index.mjs';

/**
 * - `typeName` : Name for this type
 * - `is` : Type guard function
 * - `assertIs` : Type assertion function
 * - `cast` : Cast function
 * - `fill` : Default value filling function
 * - `validate` : A base function to be used in `is` and `assertIs`. `validate`
 *   returns Result.Ok if the value is of Type A, otherwise returns Result.Err
 *   with structured validation error information.
 */
export type Type<A> = Readonly<{
  typeName: string;
  defaultValue: A;
  is: (a: unknown) => a is A;
  assertIs: (a: unknown) => asserts a is A;
  cast: (a: unknown) => A;
  fill: (a: unknown) => A;
  validate: (a: unknown) => Result<A, readonly ValidationError[]>;

  /** @internal Used to mark properties as optional in record type validation */
  optional?: true;
}>;

export type TypeOf<A extends Type<unknown>> = A['defaultValue'];

/** @deprecated */
export type OptionalType<A> = MergeIntersection<
  Type<A> &
    Readonly<{
      optional: true;
    }>
>;

export type ExcessPropertyBehavior = 'allow' | 'strip' | 'error';

export type ExcessPropertyFillBehavior = Extract<
  ExcessPropertyBehavior,
  'allow' | 'strip'
>;

export type RecordType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  ExcessPropertyValidation extends ExcessPropertyBehavior = 'strip',
> = Type<
  ExcessPropertyValidation extends 'allow'
    ? TsFortressInternal.RecordTypeValue<R> | UnknownRecord
    : TsFortressInternal.RecordTypeValue<R>
> &
  Readonly<{
    shape: R;
    excessPropertyValidation: ExcessPropertyValidation;
    excessPropertyFill: ExcessPropertyFillBehavior;
  }>;

expectType<
  RecordType<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>,
  Type<Readonly<{ a: 0; b: 1; c: 2 }>> &
    Readonly<{
      shape: Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>;
      excessPropertyValidation: 'strip';
      excessPropertyFill: ExcessPropertyFillBehavior;
    }>
>('=');

export namespace TsFortressInternal {
  export type RecordTypeValue<R extends ReadonlyRecord<string, Type<unknown>>> =
    RecordTypeValueImpl<R>;

  export type RecordTypeValueImpl<
    R extends ReadonlyRecord<string, Type<unknown>>,
  > = RecordTypeValueImplSub<R, OptionalTypeKeys<R>>;

  type RecordTypeValueImplSub<
    A extends ReadonlyRecord<string, Type<unknown>>,
    OptionalKeys extends keyof A,
  > =
    TypeEq<OptionalKeys, never> extends true
      ? Readonly<{ [key in Exclude<keyof A, OptionalKeys>]: TypeOf<A[key]> }>
      : TypeEq<keyof A, OptionalKeys> extends true
        ? MergeIntersection<
            Readonly<{ [key in OptionalKeys]?: TypeOf<A[key]> }>
          >
        : MergeIntersection<
            Readonly<
              { [key in OptionalKeys]?: TypeOf<A[key]> } & {
                [key in Exclude<keyof A, OptionalKeys>]: TypeOf<A[key]>;
              }
            >
          >;

  type OptionalTypeKeys<A extends ReadonlyRecord<string, Type<unknown>>> = {
    [K in keyof A]: A[K] extends Readonly<{ optional: true }> ? K : never;
  }[keyof A];
}
