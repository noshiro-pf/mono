import { Arr, Obj, hasKey, isRecord, type Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type ValidationError } from './utils/index.mjs';

/**
 * - `typeName` : Name for this type
 * - `is` : Type guard function
 * - `assertIs` : Type assertion function
 * - `cast` : Cast function (returns the original value, no transformation)
 * - `fill` : Default value filling function
 * - `prune` : Excess property pruning function (recursively removes value
 *   paths that are not represented by the type; unlike `fill`, it never fills
 *   in default values)
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

  /**
   * Recursively removes value paths that are not represented by the type
   * (e.g. excess record properties). Unlike `fill`, it never fills in default
   * values, so the input must already be of type `A`.
   *
   * NOTE: The parameter is intentionally a naked type parameter
   * (`<B extends A>(a: B) => A`) rather than `(a: A) => A`:
   *
   * 1. `(a: A) => A` would put `A` in a contravariant position, so `Type<X>`
   *    would no longer be assignable to `Type<unknown>` under
   *    `strictFunctionTypes`, breaking `UnknownShape` (the shape constraint
   *    of `record`), `TypeOf`, and every `readonly Type<unknown>[]` argument
   *    (`tuple`, `union`, `intersection`, ...).
   * 2. `(a: A) => A` would reject fresh object literals with excess
   *    properties (e.g. `Point2D.prune({ x: 1, y: 2, z: 3 })`) via excess
   *    property checking (TS2353), which is the main use case of `prune`.
   *    Inference onto the naked type parameter `B` skips that check, while
   *    `B extends A` still rejects inputs with missing keys.
   *
   * (A bivariance hack such as `{ m(a: A): A }['m']` would solve 1 but not
   * 2.)
   */
  prune: <B extends A>(a: B) => A;
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

/** @internal Shape structure that can represent union and intersection */
export type ShapeStructure = Readonly<
  | { kind: 'simple'; shape: UnknownShape }
  | { kind: 'union'; variants: readonly ShapeStructure[] }
  | { kind: 'intersection'; parts: readonly ShapeStructure[] }
>;

/** @internal Runtime type for accessing internal record properties via cast. */
export type RecordTypeInternals = Readonly<{
  shapeStructure: ShapeStructure;
  excessProperty: ExcessPropertyOption;
}>;

/** @internal Helper to flatten ShapeStructure to a simple shape if possible */
export const flattenShapeStructure = (
  structure: ShapeStructure,
): UnknownShape | undefined => {
  switch (structure.kind) {
    case 'simple': {
      return structure.shape;
    }
    case 'intersection': {
      // Intersection can be flattened by merging all parts
      const parts = structure.parts.map(flattenShapeStructure);

      if (parts.includes(undefined)) {
        // Contains union - cannot flatten
        return undefined;
      }

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Obj.merge(...(parts as readonly UnknownShape[]));
    }
    case 'union': {
      // Union cannot be flattened to a single shape
      return undefined;
    }
  }
};

/** @internal Backward compatibility: simple shape accessor */
export const getShape = (internals: RecordTypeInternals): UnknownShape => {
  const flattened = flattenShapeStructure(internals.shapeStructure);

  if (flattened === undefined) {
    throw new Error(
      `getShape() can only be called on simple or intersection record types, but received a union type. Use shapeStructure instead.`,
    );
  }

  return flattened;
};

/** @internal Runtime check for record type internals. */
export const hasRecordInternals = <T extends Type<unknown>>(
  t: T,
): t is T & RecordTypeInternals => hasRecordInternalsImpl(t);

const hasRecordInternalsImpl = (t: unknown): t is RecordTypeInternals =>
  isRecord(t) &&
  hasKey(t, 'shapeStructure') &&
  isValidShapeStructure(t.shapeStructure) &&
  hasKey(t, 'excessProperty') &&
  (t.excessProperty === 'allow' || t.excessProperty === 'reject');

const isValidShapeStructure = (s: unknown): s is ShapeStructure => {
  if (!isRecord(s) || !hasKey(s, 'kind')) return false;

  if (s.kind === 'simple') {
    return hasKey(s, 'shape') && isRecord(s.shape);
  }

  if (s.kind === 'union') {
    return (
      hasKey(s, 'variants') &&
      Arr.isArray(s.variants) &&
      s.variants.every(isValidShapeStructure)
    );
  }

  if (s.kind === 'intersection') {
    return (
      hasKey(s, 'parts') &&
      Arr.isArray(s.parts) &&
      s.parts.every(isValidShapeStructure)
    );
  }

  return false;
};
