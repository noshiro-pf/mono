import { Arr, Obj, type Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type {
  Primitive,
  ReadonlyRecord,
  StrictExtract,
  StrictOmit,
  UnknownRecord,
} from 'ts-type-forge';
import type { ValidationError } from './utils/index.mjs';

/**
 * - `typeName` : Name for this type
 * - `is` : Type guard function
 * - `assertIs` : Type assertion function
 * - `cast` : Cast function (returns the original value, no transformation)
 * - `fill` : Default value filling function (turns any input into a value of
 *   type `A`, keeping the valid parts and replacing the rest with defaults;
 *   `array` can drop invalid elements instead, see its `onInvalidElement`)
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
   * Recursively removes value paths that are not represented by the type (e.g.
   * excess record properties). Unlike `fill`, it never fills in default values,
   * so the input must already be of type `A`.
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
   * (A bivariance hack such as `{ m(a: A): A }['m']` would solve 1 but not 2.)
   */
  prune: <B extends A>(a: B) => A;
  validate: (a: unknown) => Result<A, readonly ValidationError[]>;

  /**
   * What the type is built from, readable at runtime: the kind of type and the
   * types it is composed of (see {@link TypeStructure}). Every type the package
   * constructs carries one; a `Type` written by hand may not, and is then
   * opaque to whatever reads it (`toJsonSchema` among them).
   */
  structure?: TypeStructure;

  /**
   * What the type means to a reader, set by `annotate` (see
   * {@link TypeAnnotations}). It changes nothing the type does; `toJsonSchema`
   * writes it out.
   */
  annotations?: TypeAnnotations;

  /** @internal Used to mark properties as optional in record type validation */
  optional?: true;
}>;

/**
 * The JSON Schema annotations a type carries, written by `toJsonSchema` under
 * the keywords of the same names. Validation never reads them: a `format`
 * describes the values, and the type alone decides which are valid.
 *
 * @template A - The type's value type, which each of `examples` is.
 */
export type TypeAnnotations<A = unknown> = Partial<
  Readonly<{
    title: string;
    description: string;
    format: JsonSchemaFormat;
    examples: readonly A[];
    deprecated: boolean;
  }>
>;

/**
 * A JSON Schema `format`: one of the formats the draft 2020-12 vocabulary
 * defines, or any other string, which JSON Schema leaves to the tools that read
 * it (OpenAPI's `int32` or `password`, for example).
 */
export type JsonSchemaFormat =
  | 'date-time'
  | 'date'
  | 'time'
  | 'duration'
  | 'email'
  | 'idn-email'
  | 'hostname'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | 'uri-reference'
  | 'iri'
  | 'iri-reference'
  | 'uuid'
  | 'uri-template'
  | 'json-pointer'
  | 'relative-json-pointer'
  | 'regex' // Keeps the names above in autocomplete while accepting any other string.
  | (string & {});

/**
 * The runtime description of a {@link Type}, discriminated by `kind`.
 *
 * It records what the type was built from and nothing it computes: the
 * constraint values of `string` / `number` / `bigint` are on the type's own
 * `constraints` (see `WithConstraints`), whether a record member is optional is
 * the member type's `optional`, and a predicate passed to `refine`, `brand` or
 * `templateLiteral` stays a closure — such a type says only that it narrows its
 * base type.
 *
 * - `record` — `shape` as given, and whether excess properties are rejected.
 *   The record operations (`pick`, `omit`, `partial`, `required`,
 *   `mergeRecords`) build a new `record`, so they describe themselves as one.
 * - `array` — an array of `elementType`, `minLength` / `maxLength` set by
 *   the length-constrained arrays and tuples (`nonEmptyArray`,
 *   `fixedLengthArray`, `minLengthTuple`, ...).
 * - `tuple` — one type per position, of exactly that length.
 * - `union` / `intersection` — the member types as written: a union nested
 *   directly in another stays a member here, though it is flattened for
 *   validation.
 * - `integerRange` — an integer from `min` to `max`, both inclusive.
 * - `brand` — `baseType` branded with `brandKeys` (and not `brandFalseKeys`);
 *   `refined` tells whether an `is` predicate narrows it further.
 * - `recursion` — `resolve` returns the definition, called lazily so that a
 *   type defined in terms of itself can be traversed without looping.
 */
export type TypeStructure = Readonly<
  | {
      kind:
        | 'string'
        | 'number'
        | 'bigint'
        | 'boolean'
        | 'symbol'
        | 'null'
        | 'undefined'
        | 'unknown'
        | 'templateLiteral';
    }
  | {
      kind: 'literal';
      value: StrictExtract<Primitive, string | number | bigint | boolean>;
    }
  | { kind: 'enum'; values: readonly Primitive[] }
  | { kind: 'integerRange'; min: number; max: number }
  | {
      kind: 'record';
      shape: UnknownShape;
      excessProperty: ExcessPropertyOption;
    }
  | {
      kind: 'keyValueRecord';
      keyType: Type<unknown>;
      valueType: Type<unknown>;
    }
  | {
      kind: 'array';
      elementType: Type<unknown>;
      minLength: number | undefined;
      maxLength: number | undefined;
    }
  | { kind: 'tuple'; elementTypes: readonly Type<unknown>[] }
  | { kind: 'union'; memberTypes: readonly Type<unknown>[] }
  | { kind: 'intersection'; memberTypes: readonly Type<unknown>[] }
  | { kind: 'map'; keyType: Type<unknown>; valueType: Type<unknown> }
  | { kind: 'set'; elementType: Type<unknown> }
  | { kind: 'refine'; baseType: Type<unknown> }
  | {
      kind: 'brand';
      baseType: Type<unknown>;
      brandKeys: readonly string[];
      brandFalseKeys: readonly string[];
      refined: boolean;
    }
  | {
      kind: 'recursion';
      typeName: string;
      resolve: () => Type<unknown>;
    }
>;

/** The `kind`s of {@link TypeStructure}. */
export type TypeStructureKind = TypeStructure['kind'];

/**
 * @internal Replaces the {@link TypeStructure} of `type`, keeping every other
 * property as it is — by property descriptor, for the reason given in
 * `attachConstraints`.
 */
export const withStructure = <T extends UnknownType>(
  type: T,
  structure: TypeStructure,
): T =>
  // The same object with one property replaced.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(type),
      structure: { value: structure, enumerable: true },
    },
  ) as T;

/**
 * @internal A new object with the prototype of `type` and the property
 * `descriptors` given, which are usually `type`'s own with some replaced.
 * Copying by descriptor leaves a lazy `defaultValue` getter unevaluated (see
 * `attachConstraints`), and keeping the prototype keeps the members a `Type`
 * written as a class inherits.
 */
export const copyTypeByDescriptors = (
  type: UnknownType,
  descriptors: PropertyDescriptorMap,
): unknown => {
  const proto: unknown = Object.getPrototypeOf(type);

  // A prototype is an object, a function or `null`, all of which
  // `Object.create` takes; the other branch is unreachable.
  return typeof proto === 'object' || typeof proto === 'function'
    ? Object.create(proto, descriptors)
    : Object.defineProperties({}, descriptors);
};

/**
 * The bound used where a codec is accepted without caring which value type it
 * validates, such as the type parameter of {@link TypeOf}, the element bounds
 * of `union` / `tuple` / `intersection`, and the members of the shape `record`,
 * `strictRecord` and {@link WithShape} take.
 *
 * It is `Type<unknown>` with one member loosened: `prune` takes `never`, so the
 * bound asks only that `prune` exist. No `any` is involved, so a value typed by
 * it stays checked. It is exported for a caller's own bound,
 * `<C extends UnknownType>`, which accepts a codec imported from another
 * package's declarations where `<C extends Type<unknown>>` might not (below).
 * {@link TypeStructure} and {@link UnknownShape}, which a caller reads, are
 * typed `Type`.
 *
 * Why `prune` is loosened: it is `<B extends A>(a: B) => A`, and relating that
 * to `Type<unknown>`'s `<B extends unknown>(a: B) => unknown` unifies the two
 * type parameters and leaves the target's `B` unconstrained, which
 * `B extends A` will not accept. Within a module that never shows, because
 * `typeof someCodec` is still the `Type<A>` alias and the compiler compares the
 * two instantiations by variance. Declaration emit is where it would: an
 * *inferred* codec type (`const X = record({ ... })`) is written out
 * structurally in the `.d.mts`, the alias is gone, and against plain
 * `Type<unknown>` a module-scope `TypeOf<typeof X>` then fails the
 * declaration's own type check (TS2344). A parameter of `never` accepts any
 * `prune`, generic or not, so the structural form satisfies the bound too.
 * `test/dist_/declaration-emit` holds it.
 *
 * The cost: a value typed by the bound is not a `Type<unknown>`. Its `prune`
 * cannot be called, and it cannot be passed where `Type<unknown>` is asked for.
 *
 * NOTE — the trap is closed only for bounds written with `UnknownType`. A bound
 * written as `<C extends Type<unknown>>` still rejects a structurally emitted
 * codec, for the reason above; there either the bound is rewritten with
 * `UnknownType`, or the const is annotated
 * (`const X: Type<Shape> = record({ ... })`) so that the alias survives emit.
 * `type.test.mts` pins that the structural form satisfies `UnknownType` and not
 * `Type<unknown>`.
 */
// Inside this package, `asType` widens a value typed by the bound back to
// `Type<unknown>`.
export type UnknownType = StrictOmit<Type<unknown>, 'prune'> &
  Readonly<{ prune: (a: never) => unknown }>;

/**
 * @internal Reads a codec typed by the bound {@link UnknownType} as the
 * `Type<unknown>` it is, so that its `prune` can be called and it can be
 * passed where `Type<unknown>` is asked for.
 */
// A real call in `dist/`, like `structureOf` below: the strip pass removes
// identity calls by bare name in every library, and neither name is one no
// other package could give a function that does something.
export const asType = (type: UnknownType): Type<unknown> =>
  // The bound differs from `Type<unknown>` only in the parameter of `prune`,
  // which it types `never` for the sake of declaration emit. Every codec's
  // `prune` takes a value of its own type and is handed one that its own
  // `validate` / `is` accepted, or — in `prune` implementations — one the
  // caller's `B extends A` already vouches for.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  type as Type<unknown>;

/**
 * @internal The {@link TypeStructure} of a combinator whose member types are
 * typed by the bound {@link UnknownType}.
 *
 * `TypeStructure` is what a caller reads, so its members are `Type<unknown>`:
 * someone walking `type.structure` passes them on as codecs and may call
 * `prune` on them. A combinator holds its members by the bound, which says
 * less, and this is where the two meet.
 */
export const structureOf = (structure: StructureByBound): TypeStructure =>
  // As in `asType`: the two differ only in the parameter of `prune`.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  structure as TypeStructure;

export type TypeOf<A extends UnknownType> = A['defaultValue'];

/** {@link TypeStructure} with every member type typed by the bound. */
type StructureByBound = ByBound<TypeStructure>;

type ByBound<T> =
  T extends Type<unknown>
    ? UnknownType
    : T extends () => infer R
      ? () => ByBound<R>
      : T extends readonly (infer E)[]
        ? readonly ByBound<E>[]
        : T extends UnknownRecord
          ? Readonly<{ [K in keyof T]: ByBound<T[K]> }>
          : T;

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

/**
 * The shape a record type is built from: a record of property names to the
 * {@link Type} validating each one.
 *
 * It is what the `shape` argument of `record` / `strictRecord` takes, and the
 * type argument of the {@link WithShape} those return, so naming it is what
 * lets a caller write its own helper over a record type's shape.
 */
export type UnknownShape = ReadonlyRecord<string, Type<unknown>>;

/**
 * @internal {@link UnknownShape} as a bound: what `record` and
 * {@link WithShape} ask of a shape, its members typed by {@link UnknownType}
 * so that a shape written out structurally by declaration emit satisfies it.
 * Every `UnknownShape` is one.
 */
export type ShapeByBound = ReadonlyRecord<string, UnknownType>;

/**
 * The carrier of the shape a record type was built from.
 *
 * `record` and `strictRecord` expose the shape they were given, so that the
 * member types — and the constraints they carry — stay reachable from the
 * record type itself (`User.shape.age.constraints.max`, or the equivalent
 * `at(User, 'age').constraints.max`).
 */
export type WithShape<S extends ShapeByBound> = Readonly<{ shape: S }>;

/** @internal Shape structure that can represent union and intersection */
export type ShapeStructure = Readonly<
  | { kind: 'simple'; shape: UnknownShape }
  | { kind: 'union'; variants: readonly ShapeStructure[] }
  | { kind: 'intersection'; parts: readonly ShapeStructure[] }
>;

/**
 * @internal What the record operations (`pick`, `omit`, `at`, `mergeRecords`,
 * ...) read off a record type: its shapes and how it treats excess
 * properties. It is computed from the type's `structure` by
 * {@link recordViewOf}, not stored on the type.
 */
export type RecordView = Readonly<{
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

      return parts.includes(undefined)
        ? // Contains union - cannot flatten
          undefined
        : // No part is a union here.
          // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
          Obj.merge(...(parts as readonly UnknownShape[]));
    }
    case 'union': {
      // Union cannot be flattened to a single shape
      return undefined;
    }
  }
};

/**
 * @internal Upper bound on the number of concrete shapes that
 * {@link expandShapeStructure} may produce. Expanding an intersection of unions
 * multiplies the variant counts, so a deeply nested structure can grow
 * exponentially; this bound prevents excessive CPU/memory usage (mirrors the
 * guard in `mergeRecords`).
 */
const EXPAND_SHAPE_STRUCTURE_MAX_VARIANTS = 10_000;

/**
 * @internal Expands a ShapeStructure into all possible simple shapes.
 * For union structures, returns an array of all variant shapes.
 * For intersection structures, computes the cartesian product of all parts.
 *
 * Unlike {@link flattenShapeStructure}, this never returns `undefined`: a
 * union of records is represented as the list of its concrete member shapes.
 *
 * @throws If the intersection expansion would exceed
 *   {@link EXPAND_SHAPE_STRUCTURE_MAX_VARIANTS} concrete shapes.
 */
export const expandShapeStructure = (
  structure: ShapeStructure,
): readonly UnknownShape[] => {
  switch (structure.kind) {
    case 'simple': {
      return [structure.shape];
    }
    case 'union': {
      // Union: flatten all variants
      return structure.variants.flatMap(expandShapeStructure);
    }
    case 'intersection': {
      // Intersection: compute cartesian product of all parts
      const expandedParts = structure.parts.map(expandShapeStructure);

      // The cartesian product size is the product of the per-part variant
      // counts, which grows multiplicatively. Bound it before materializing to
      // avoid excessive CPU/memory usage.
      const estimatedVariantCount = expandedParts.reduce(
        (acc, shapes) => acc * shapes.length,
        1,
      );

      if (estimatedVariantCount > EXPAND_SHAPE_STRUCTURE_MAX_VARIANTS) {
        panic(
          `Expanding this record type would create ${estimatedVariantCount} variants, exceeding the limit of ${EXPAND_SHAPE_STRUCTURE_MAX_VARIANTS}. This could lead to excessive memory or CPU usage. Consider simplifying the record types or reducing union/intersection nesting.`,
        );
      }

      const combinations = Arr.cartesianProduct(expandedParts);

      return Arr.map(combinations, (shapes) => Obj.merge(...shapes));
    }
  }
};

/**
 * @internal The {@link RecordView} of a type, if it is a record: a `record`,
 * or a `union` / `intersection` whose members all are, or a `recursion` that
 * resolves to one (which runs its definition). A `recursion` reached again
 * while it is being resolved is not a record.
 */
export const recordViewOf = (type: UnknownType): RecordView | undefined =>
  recordViewOfImpl(type, new Set<() => UnknownType>());

/** @internal The element types of a `tuple`, if the type is one. */
export const tupleElementTypesOf = (
  type: UnknownType,
): readonly Type<unknown>[] | undefined =>
  type.structure?.kind === 'tuple' ? type.structure.elementTypes : undefined;

/**
 * @internal The members of a union with the unions nested directly in it
 * flattened in, or the type itself if it is not a union. A `recursion` is
 * not a union here even if it resolves to one, so that it is not run.
 */
export const unionMembersOf = (type: UnknownType): readonly UnknownType[] =>
  type.structure?.kind === 'union'
    ? type.structure.memberTypes.flatMap(unionMembersOf)
    : ([type] as const);

const recordViewOfImpl = (
  type: UnknownType,
  resolving: ReadonlySet<() => UnknownType>,
): RecordView | undefined => {
  const { structure } = type;

  if (structure?.kind === 'record') {
    return {
      shapeStructure: { kind: 'simple', shape: structure.shape },
      excessProperty: structure.excessProperty,
    };
  }

  if (structure?.kind === 'union' || structure?.kind === 'intersection') {
    const views = structure.memberTypes.map((member) =>
      recordViewOfImpl(member, resolving),
    );

    if (!views.every((view): view is RecordView => view !== undefined)) {
      return undefined;
    }

    const shapeStructures = views.map((view) => view.shapeStructure);

    return {
      shapeStructure: Arr.isFixedLengthTuple(1, shapeStructures)
        ? shapeStructures[0]
        : structure.kind === 'union'
          ? { kind: 'union', variants: shapeStructures }
          : { kind: 'intersection', parts: shapeStructures },
      excessProperty: views.some((view) => view.excessProperty === 'reject')
        ? 'reject'
        : 'allow',
    };
  }

  if (structure?.kind === 'recursion' && !resolving.has(structure.resolve)) {
    return recordViewOfImpl(
      structure.resolve(),
      new Set<() => UnknownType>([...resolving, structure.resolve]),
    );
  }

  return undefined;
};
