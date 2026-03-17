import { hasKey, isRecord } from 'ts-data-forge';
import { type ValidationError } from './utils/index.mjs';

/**
 * - `typeName` : Name for this type
 * - `is` : Type guard function
 * - `assertIs` : Type assertion function
 * - `cast` : Cast function (returns the original value, no transformation)
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

/**
 * Controls how excess properties (keys not in shape) are handled.
 *
 * - `'allow'` (default) — accept excess properties at runtime
 * - `'reject'` — reject objects with excess properties at runtime
 *
 * This option only affects runtime validation behavior.
 * The value type is always exact regardless of the setting.
 */
export type ExcessPropertyOption = 'allow' | 'reject';

/** @internal */
export type UnknownShape = ReadonlyRecord<string, Type<unknown>>;

/** @internal Runtime type for accessing internal record properties via cast. */
export type RecordTypeInternals = Readonly<{
  shape: UnknownShape;
  excessProperty: ExcessPropertyOption;
}>;

/** @internal Runtime check for record type internals. */
export const hasRecordInternals = <T extends Type<unknown>>(
  t: T,
): t is T & RecordTypeInternals => hasRecordInternalsImpl(t);

const hasRecordInternalsImpl = (t: unknown): t is RecordTypeInternals =>
  isRecord(t) &&
  hasKey(t, 'shape') &&
  isRecord(t.shape) &&
  hasKey(t, 'excessProperty') &&
  (t.excessProperty === 'allow' || t.excessProperty === 'reject');
