import { isRegExp } from '@sindresorhus/is';
import {
  Arr,
  asUint32,
  isBoolean,
  isNumber,
  isString,
  Obj,
  Result,
} from 'ts-data-forge';
import type {
  JsonPrimitive,
  JsonValue,
  ReadonlyRecord,
  RelaxedExtract,
} from 'ts-type-forge';
import { hasConstraints } from '../constraints/index.mjs';
import { JsonValue as JsonValueType } from '../predefined/index.mjs';
import type {
  TypeAnnotations,
  TypeStructure,
  TypeStructureKind,
  UnknownType,
} from '../type.mjs';

/**
 * Converts a type to a JSON Schema (draft 2020-12, the dialect OpenAPI 3.1
 * uses) describing the JSON values the type accepts.
 *
 * The schema is read off each type's `structure` and `constraints`, so it
 * says what the type was built from:
 *
 * - `string` / `number` constraints become `minLength`, `pattern`, `minimum`,
 *   `multipleOf` and the like; `int` and `safeInteger` make it an `integer`.
 * - `record` becomes `properties` and `required` (every member not wrapped in
 *   `optional`), with `additionalProperties: false` for `strictRecord`.
 * - `union` becomes `anyOf`, or `oneOf` with an OpenAPI `discriminator` when
 *   every member is a record with a distinct literal at the same key.
 *   `intersection` becomes `allOf`.
 * - `literal` becomes `const`, `enumType` becomes `enum`, and the integer
 *   ranges an `integer` with `minimum` / `maximum`.
 * - The arrays become `items` (and `minItems` / `maxItems` for the
 *   length-constrained ones), `tuple` becomes `prefixItems` with
 *   `items: false`, and `keyValueRecord` becomes `propertyNames` and
 *   `additionalProperties`.
 * - `recursion` becomes a `$defs` entry named after its `typeName`, and a
 *   `$ref` to it wherever it is used.
 * - `brand` is its base type's schema with `x-brand` set to its name. The
 *   predefined branded numbers say what their brand keys mean (`Int` is an
 *   `integer`, `>=0` a `minimum` of 0, `< 2^32` an `exclusiveMaximum`, ...),
 *   so `uint32()` is an integer from 0 to 2^32 - 1.
 *
 * What a predicate checks cannot be written down: `refine`, `templateLiteral`
 * and the `uppercase` / `lowercase` string constraints add their names to
 * `x-refined`, and the schema accepts more than the type does there. The type
 * stays the authority on what is valid; the schema is what other tools read.
 *
 * The annotations `annotate` adds — `title`, `description`, `format`,
 * `examples` and `deprecated` — are written under the keywords of the same
 * names, beside the schema of the type they are on. An example the type does
 * not accept, or one that is not JSON, is an error.
 *
 * Default values are not written as `default`: every type has one, so
 * writing it would tell a client that every property may be left out.
 *
 * A type no JSON value can be of — `bigint`, `symbol`, `undefinedType`,
 * `MapType`, `SetType` — is an error, and so is a type without a `structure`
 * (one written by hand rather than built by this package). As a union
 * member it is left out instead, since a JSON value is never of it:
 * `nullable(t.string())` is a string.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const User = t.strictRecord({
 *   name: t.string('a', { minLength: 1 }),
 *   age: t.optional(t.uint32()),
 * });
 *
 * const schema = t.toJsonSchema(User);
 *
 * assert.deepStrictEqual(
 *   schema,
 *   t.Result.ok({
 *     $schema: 'https://json-schema.org/draft/2020-12/schema',
 *     type: 'object',
 *     properties: {
 *       name: { type: 'string', minLength: 1 },
 *       age: {
 *         type: 'integer',
 *         minimum: 0,
 *         exclusiveMaximum: 4_294_967_296,
 *         'x-brand': 'Uint32',
 *       },
 *     },
 *     required: ['name'],
 *     additionalProperties: false,
 *   }),
 * );
 * ```
 */
export const toJsonSchema = (
  type: UnknownType,
  options?: Partial<
    Readonly<{
      /**
       * Whether the root carries `$schema`. Leave it out for a schema that is
       * embedded in another document, such as an OpenAPI component.
       * @default true
       */
      includeSchemaUri: boolean;
    }>
  >,
): Result<JsonSchema, readonly JsonSchemaConversionError[]> => {
  const defs = createDefs();

  const root = convert(type, defs, []);

  if (Result.isErr(root)) {
    return root;
  }

  const entries = defs.entries();

  const $defs: JsonSchema = Object.fromEntries(entries);

  return Result.ok({
    ...(options?.includeSchemaUri === false
      ? {}
      : { $schema: JSON_SCHEMA_DIALECT }),
    ...root.value,
    ...(Arr.isNonEmpty(entries) ? { $defs } : {}),
  });
};

/** A JSON Schema object. */
export type JsonSchema = ReadonlyRecord<string, JsonValue>;

/** Why a type, or a part of it, has no JSON Schema. */
export type JsonSchemaConversionError = Readonly<{
  /**
   * - `'not-json'` — no JSON value is of the type (`bigint`, `symbol`,
   *   `undefinedType`, `MapType`, `SetType`, or a literal or enum value of
   *   those).
   * - `'opaque'` — the type has no `structure` to read.
   * - `'unsatisfiable'` — the type accepts no value that the schema could
   *   state (a `multipleOf` of 0).
   * - `'invalid-example'` — one of the type's `examples` is not of the type.
   *   An example that is not JSON is `'not-json'`.
   */
  kind: 'not-json' | 'opaque' | 'unsatisfiable' | 'invalid-example';
  /** JSON Pointer to where in the schema the type's schema would go. */
  schemaPath: string;
  typeName: string;
  message: string;
}>;

/** The `$schema` of the schemas {@link toJsonSchema} writes. */
export const JSON_SCHEMA_DIALECT =
  'https://json-schema.org/draft/2020-12/schema';

/** The `$defs` of the schema being written, one for each `recursion`. */
type Defs = Readonly<{
  /** The name given to the recursion that `resolve` defines, if any yet. */
  nameOf: (resolve: () => UnknownType) => string | undefined;
  /**
   * Gives the recursion a name: `typeName` with the characters a JSON
   * Pointer or a URI fragment would have to escape replaced, and numbered
   * when another recursion has it already.
   */
  name: (resolve: () => UnknownType, typeName: string) => string;
  define: (name: string, schema: JsonSchema) => void;
  entries: () => readonly (readonly [string, JsonSchema])[];
}>;

const createDefs = (): Defs => {
  const mut_names = new Map<() => UnknownType, string>();

  const mut_schemas = new Map<string, JsonSchema>();

  return {
    nameOf: (resolve) => mut_names.get(resolve),
    name: (resolve, typeName) => {
      const base = typeName.replaceAll(/[^\w.-]/gu, '_');

      const taken = new Set(mut_names.values());

      const name = taken.has(base)
        ? (Arr.seq(asUint32(taken.size + 1))
            .map((i) => `${base}_${i + 2}`)
            .find((candidate) => !taken.has(candidate)) ?? base)
        : base;

      mut_names.set(resolve, name);

      return name;
    },
    define: (name, schema) => {
      mut_schemas.set(name, schema);
    },
    entries: () => Array.from(mut_schemas),
  };
};

type StructureOf<K extends TypeStructureKind> = RelaxedExtract<
  TypeStructure,
  Readonly<{ kind: K }>
>;

type ConversionResult = Result<
  JsonSchema,
  readonly JsonSchemaConversionError[]
>;

const convert = (
  type: UnknownType,
  defs: Defs,
  path: readonly string[],
): ConversionResult => {
  const schema = convertStructure(type, defs, path);

  const { annotations } = type;

  if (annotations === undefined || Result.isErr(schema)) {
    return schema;
  }

  return Result.map(annotationsSchema(type, annotations, path), (keywords) => ({
    // `title` and `description` first, where a reader looks for them; then
    // every annotation of the type's own over the one its base type's schema
    // has already (an `annotate` of a `uuid()` replacing its `format`, say).
    ...Obj.filter(keywords, (_value, key) => LEADING_KEYWORDS.has(key)),
    ...schema.value,
    ...keywords,
  }));
};

const LEADING_KEYWORDS: ReadonlySet<string> = new Set<string>([
  'title',
  'description',
]);

const convertStructure = (
  type: UnknownType,
  defs: Defs,
  path: readonly string[],
): ConversionResult => {
  const { structure } = type;

  if (structure === undefined) {
    return failure(
      'opaque',
      type,
      path,
      'the type has no `structure`; only types built by ts-fortress can be converted',
    );
  }

  switch (structure.kind) {
    case 'string':
      return Result.ok(stringSchema(type));

    case 'number':
      return numberSchema(type, path);

    case 'boolean':
      return Result.ok({ type: 'boolean' });

    case 'null':
      return Result.ok({ type: 'null' });

    case 'unknown':
      return Result.ok({});

    case 'bigint':
    case 'symbol':
    case 'undefined':
    case 'map':
    case 'set':
      return failure(
        'not-json',
        type,
        path,
        `no JSON value is of the kind \`${structure.kind}\``,
      );

    case 'templateLiteral':
      return Result.ok({ type: 'string', 'x-refined': [type.typeName] });

    case 'literal':
      return isJsonPrimitive(structure.value)
        ? Result.ok({ const: structure.value })
        : failure('not-json', type, path, 'a bigint literal is not JSON');

    case 'enum': {
      const values = structure.values.filter(isJsonPrimitive);

      return values.length === structure.values.length
        ? Result.ok({ enum: values })
        : failure(
            'not-json',
            type,
            path,
            'an enum value is not a JSON primitive',
          );
    }

    case 'integerRange':
      return Result.ok({
        type: 'integer',
        minimum: structure.min,
        maximum: structure.max,
      });

    case 'record':
      return recordSchema(structure, defs, path);

    case 'keyValueRecord':
      return keyValueRecordSchema(structure, defs, path);

    case 'array':
      return arraySchema(structure, defs, path);

    case 'tuple':
      return tupleSchema(structure, defs, path);

    case 'union':
      return unionSchema(type, structure, defs, path);

    case 'intersection':
      return collect(
        structure.memberTypes.map((member, i) =>
          convert(member, defs, [...path, 'allOf', i.toString()]),
        ),
        (allOf) => ({ allOf }),
      );

    case 'refine':
      return Result.map(convert(structure.baseType, defs, path), (base) =>
        withRefined(base, [type.typeName]),
      );

    case 'brand':
      return Result.map(convert(structure.baseType, defs, path), (base) => ({
        ...brandedNumberSchema(base, structure),
        'x-brand': type.typeName,
      }));

    case 'recursion':
      return recursionSchema(structure, defs);
  }
};

// --- annotations ---

const annotationsSchema = (
  type: UnknownType,
  annotations: TypeAnnotations,
  path: readonly string[],
): ConversionResult => {
  const { title, description, format, deprecated, examples } = annotations;

  const errors = (examples ?? []).flatMap((example, i) => {
    const examplePath = [...path, 'examples', i.toString()] as const;

    return !JsonValueType.is(example)
      ? [
          conversionError(
            'not-json',
            type,
            examplePath,
            'the example is not JSON',
          ),
        ]
      : !type.is(example)
        ? [
            conversionError(
              'invalid-example',
              type,
              examplePath,
              'the example is not of the type',
            ),
          ]
        : [];
  });

  return Arr.isNonEmpty(errors)
    ? Result.err(errors)
    : Result.ok({
        ...(title === undefined ? {} : { title }),
        ...(description === undefined ? {} : { description }),
        ...(format === undefined ? {} : { format }),
        ...(deprecated === undefined ? {} : { deprecated }),
        ...(examples === undefined
          ? {}
          : { examples: examples.filter(JsonValueType.is) }),
      });
};

// --- records and collections ---

const recordSchema = (
  structure: StructureOf<'record'>,
  defs: Defs,
  path: readonly string[],
): ConversionResult => {
  const entries = Object.entries(structure.shape);

  return collect(
    entries.map(([key, member]) =>
      convert(member, defs, [...path, 'properties', key]),
    ),
    (schemas) => ({
      type: 'object',
      properties: Object.fromEntries(
        entries.map(([key], i) => [key, schemas[i] ?? {}] as const),
      ),
      required: entries
        .filter(([, member]) => member.optional !== true)
        .map(([key]) => key),
      ...(structure.excessProperty === 'reject'
        ? { additionalProperties: false }
        : {}),
    }),
  );
};

const keyValueRecordSchema = (
  structure: StructureOf<'keyValueRecord'>,
  defs: Defs,
  path: readonly string[],
): ConversionResult =>
  collect(
    [
      convert(structure.keyType, defs, Arr.toPushed(path, 'propertyNames')),
      convert(
        structure.valueType,
        defs,
        Arr.toPushed(path, 'additionalProperties'),
      ),
    ],
    ([propertyNames, additionalProperties]) => ({
      type: 'object',
      // Every property name is a string; saying only that says nothing.
      ...(propertyNames === undefined || isPlainStringSchema(propertyNames)
        ? {}
        : { propertyNames }),
      additionalProperties: additionalProperties ?? {},
    }),
  );

const arraySchema = (
  structure: StructureOf<'array'>,
  defs: Defs,
  path: readonly string[],
): ConversionResult =>
  Result.map(
    convert(structure.elementType, defs, Arr.toPushed(path, 'items')),
    (items) => ({
      type: 'array',
      items,
      ...(structure.minLength === undefined || structure.minLength <= 0
        ? {}
        : { minItems: structure.minLength }),
      ...(structure.maxLength === undefined
        ? {}
        : { maxItems: structure.maxLength }),
    }),
  );

const tupleSchema = (
  structure: StructureOf<'tuple'>,
  defs: Defs,
  path: readonly string[],
): ConversionResult =>
  collect(
    structure.elementTypes.map((element, i) =>
      convert(element, defs, [...path, 'prefixItems', i.toString()]),
    ),
    (prefixItems) => ({
      type: 'array',
      prefixItems,
      items: false,
      minItems: prefixItems.length,
      maxItems: prefixItems.length,
    }),
  );

// --- unions ---

const unionSchema = (
  type: UnknownType,
  structure: StructureOf<'union'>,
  defs: Defs,
  path: readonly string[],
): ConversionResult => {
  // A union nested directly in this one contributes its members, as it does
  // for validation.
  const members = flattenUnionMembers(structure.memberTypes);

  const converted = members.map((member) => ({
    member,
    result: convert(member, defs, path),
  }));

  // A member no JSON value can be of never matches a JSON value, so it adds
  // nothing to the union's schema — unless it is all the union has.
  const representable = converted.filter(
    ({ result }) =>
      Result.isOk(result) ||
      result.value.some(({ kind }) => kind !== 'not-json'),
  );

  if (!Arr.isNonEmpty(representable)) {
    return failure(
      'not-json',
      type,
      path,
      'no member of the union is of a JSON kind',
    );
  }

  const keyword = discriminatorOf(representable.map(({ member }) => member));

  return collect(
    representable.map(({ result }, i) =>
      // Re-pointed: the members were converted before their index was known.
      Result.mapErr(result, (errors) =>
        errors.map((error) => ({
          ...error,
          schemaPath: toPointer([
            ...path,
            keyword === undefined ? 'anyOf' : 'oneOf',
            i.toString(),
          ]),
        })),
      ),
    ),
    (schemas) =>
      Arr.isFixedLengthTuple(1, schemas)
        ? schemas[0]
        : keyword === undefined
          ? { anyOf: schemas }
          : {
              // Every member is a record here.
              type: 'object',
              oneOf: schemas,
              discriminator: { propertyName: keyword },
            },
  );
};

const flattenUnionMembers = (
  members: readonly UnknownType[],
): readonly UnknownType[] =>
  members.flatMap((member) =>
    // An annotated union keeps its own place, so that its annotations do.
    member.structure?.kind === 'union' && member.annotations === undefined
      ? flattenUnionMembers(member.structure.memberTypes)
      : [member],
  );

/**
 * The key at which every member is a record with a required literal, each
 * member's literal different from the others', if there is one: the members
 * are then mutually exclusive, which is what `oneOf` and an OpenAPI
 * `discriminator` say.
 */
const discriminatorOf = (
  members: readonly UnknownType[],
): string | undefined => {
  const shapes = members.map((member) =>
    member.structure?.kind === 'record' ? member.structure.shape : undefined,
  );

  if (shapes.length < 2 || shapes.includes(undefined)) {
    return undefined;
  }

  const [first] = shapes;

  if (first === undefined) {
    return undefined;
  }

  return Object.keys(first).find((key) => {
    const literals = shapes.map((shape) => {
      const member = shape?.[key];

      return member?.optional !== true && member?.structure?.kind === 'literal'
        ? member.structure.value
        : undefined;
    });

    const distinct = new Set(literals);

    return !literals.includes(undefined) && distinct.size === literals.length;
  });
};

// --- recursion ---

const recursionSchema = (
  structure: StructureOf<'recursion'>,
  defs: Defs,
): ConversionResult => {
  const known = defs.nameOf(structure.resolve);

  if (known !== undefined) {
    return Result.ok({ $ref: refTo(known) });
  }

  // Named before the definition is converted, so that a reference to itself
  // inside it finds the name instead of converting it again.
  const name = defs.name(structure.resolve, structure.typeName);

  const definition = convert(structure.resolve(), defs, ['$defs', name]);

  if (Result.isErr(definition)) {
    return definition;
  }

  defs.define(name, definition.value);

  return Result.ok({ $ref: refTo(name) });
};

const refTo = (name: string): string => `#/$defs/${name}` as const;

// --- strings ---

const stringSchema = (type: UnknownType): JsonSchema => {
  const c = constraintsOf(type);

  const minLength = Math.max(
    c['nonempty'] === true ? 1 : 0,
    isNumber(c['minLength']) ? c['minLength'] : 0,
  );

  const maxLength = c['maxLength'];

  const regex = c['regex'];

  const regexPattern =
    isRegExp(regex) && !/[ims]/u.test(regex.flags) ? regex.source : undefined;

  const patterns = [
    ...(isString(c['startsWith'])
      ? ([`^${escapeRegExp(c['startsWith'])}`] as const)
      : ([] as const)),
    ...(isString(c['endsWith'])
      ? ([`${escapeRegExp(c['endsWith'])}$`] as const)
      : ([] as const)),
    ...(isString(c['includes'])
      ? ([escapeRegExp(c['includes'])] as const)
      : ([] as const)),
    ...(regexPattern === undefined ? ([] as const) : ([regexPattern] as const)),
  ] as const;

  const refined = [
    ...(c['uppercase'] === true ? (['uppercase'] as const) : ([] as const)),
    ...(c['lowercase'] === true ? (['lowercase'] as const) : ([] as const)),
    // A pattern has no flags, so a case-insensitive or multiline regex is
    // checked by the type alone.
    ...(regexPattern === undefined && isRegExp(regex)
      ? ([`regex ${regex.toString()}`] as const)
      : ([] as const)),
  ] as const;

  const [firstPattern, ...otherPatterns] = patterns;

  return withRefined(
    {
      type: 'string',
      ...(minLength > 0 ? { minLength } : {}),
      ...(isNumber(maxLength) ? { maxLength } : {}),
      ...(firstPattern === undefined ? {} : { pattern: firstPattern }),
      ...(Arr.isNonEmpty(otherPatterns)
        ? { allOf: otherPatterns.map((pattern) => ({ pattern })) }
        : {}),
    },
    refined,
  );
};

/** Escapes what a `u`-flag pattern, which JSON Schema patterns are, reads. */
const escapeRegExp = (s: string): string =>
  s.replaceAll(/[\\^$.*+?()[\]{}|/]/gu, String.raw`\$&`);

// --- numbers ---

const numberSchema = (
  type: UnknownType,
  path: readonly string[],
): ConversionResult => {
  const c = constraintsOf(type);

  const steps = [c['multipleOf'], c['step']].filter(isNumber);

  if (steps.includes(0)) {
    return failure(
      'unsatisfiable',
      type,
      path,
      'a multiple of 0 accepts no number, and JSON Schema cannot say so with `multipleOf`',
    );
  }

  const [firstStep, ...otherSteps] = Arr.uniq(steps.map(Math.abs));

  const bounds = tighten(NO_BOUNDS, {
    minimum: [
      numberOrUndefined(c['min']),
      numberOrUndefined(c['gte']),
      c['nonNegative'] === true ? 0 : undefined,
      c['safeInteger'] === true ? Number.MIN_SAFE_INTEGER : undefined,
    ],
    exclusiveMinimum: [
      numberOrUndefined(c['gt']),
      c['positive'] === true ? 0 : undefined,
    ],
    maximum: [
      numberOrUndefined(c['max']),
      numberOrUndefined(c['lte']),
      c['nonPositive'] === true ? 0 : undefined,
      c['safeInteger'] === true ? Number.MAX_SAFE_INTEGER : undefined,
    ],
    exclusiveMaximum: [
      numberOrUndefined(c['lt']),
      c['negative'] === true ? 0 : undefined,
    ],
  });

  return Result.ok({
    type: c['int'] === true || c['safeInteger'] === true ? 'integer' : 'number',
    ...boundsSchema(bounds),
    ...(firstStep === undefined ? {} : { multipleOf: firstStep }),
    ...(c['nonZero'] === true && !excludesZero(bounds)
      ? { not: { const: 0 } }
      : {}),
    ...(Arr.isNonEmpty(otherSteps)
      ? { allOf: otherSteps.map((multipleOf) => ({ multipleOf })) }
      : {}),
  });
};

/**
 * `base` narrowed by what the brand keys of a predefined branded number
 * state. The keys are the ones `ts-type-forge` defines its number brands by
 * (`Int` is `Brand<number, 'Finite' | 'Int', 'NaNValue'>`), so a brand that
 * carries one claims what it means. A schema that is not a number's is
 * returned as it is.
 */
const brandedNumberSchema = (
  base: JsonSchema,
  structure: StructureOf<'brand'>,
): JsonSchema => {
  if (base['type'] !== 'number' && base['type'] !== 'integer') {
    return base;
  }

  const implied = [
    ...structure.brandKeys.map((key) => BRAND_KEY_MEANINGS.get(key)),
    ...structure.brandFalseKeys.map((key) => BRAND_FALSE_KEY_MEANINGS.get(key)),
  ].filter((meaning) => meaning !== undefined);

  const bounds = tighten(boundsOf(base), {
    minimum: implied.map((meaning) => meaning.minimum),
    exclusiveMinimum: implied.map((meaning) => meaning.exclusiveMinimum),
    maximum: implied.map((meaning) => meaning.maximum),
    exclusiveMaximum: implied.map((meaning) => meaning.exclusiveMaximum),
  });

  return {
    ...base,
    ...(implied.some((meaning) => meaning.integer === true)
      ? { type: 'integer' }
      : {}),
    ...boundsSchema(bounds),
    ...(implied.some((meaning) => meaning.nonZero === true) &&
    !excludesZero(bounds)
      ? { not: { const: 0 } }
      : {}),
  };
};

type BrandKeyMeaning = Readonly<{
  integer?: true;
  nonZero?: true;
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
}>;

/** `Finite` means nothing here: a JSON number is always finite. */
const BRAND_KEY_MEANINGS: ReadonlyMap<string, BrandKeyMeaning> = new Map<
  string,
  BrandKeyMeaning
>([
  ['Int', { integer: true }],
  [
    'SafeInt',
    {
      integer: true,
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
    },
  ],
  ['>=0', { minimum: 0 }],
  ['<=0', { maximum: 0 }],
  ['!=0', { nonZero: true }],
  ['>= -2^15', { minimum: -(2 ** 15) }],
  ['>= -2^31', { minimum: -(2 ** 31) }],
  ['> -2^16', { exclusiveMinimum: -(2 ** 16) }],
  ['> -2^32', { exclusiveMinimum: -(2 ** 32) }],
  ['< 2^15', { exclusiveMaximum: 2 ** 15 }],
  ['< 2^16', { exclusiveMaximum: 2 ** 16 }],
  ['< 2^31', { exclusiveMaximum: 2 ** 31 }],
  ['< 2^32', { exclusiveMaximum: 2 ** 32 }],
] as const);

/** What a key in `brandFalseKeys` — one the value does _not_ have — means. */
const BRAND_FALSE_KEY_MEANINGS: ReadonlyMap<string, BrandKeyMeaning> = new Map<
  string,
  BrandKeyMeaning
>([
  ['>=0', { exclusiveMaximum: 0 }],
  ['<=0', { exclusiveMinimum: 0 }],
] as const);

type Bounds = Readonly<{
  minimum: number | undefined;
  exclusiveMinimum: number | undefined;
  maximum: number | undefined;
  exclusiveMaximum: number | undefined;
}>;

const NO_BOUNDS: Bounds = {
  minimum: undefined,
  exclusiveMinimum: undefined,
  maximum: undefined,
  exclusiveMaximum: undefined,
} as const;

/** Each bound as the tightest of `bounds`' and the candidates. */
const tighten = (
  bounds: Bounds,
  candidates: ReadonlyRecord<keyof Bounds, readonly (number | undefined)[]>,
): Bounds =>
  ({
    minimum: tightest(
      Math.max,
      Arr.toUnshifted(bounds.minimum)(candidates.minimum),
    ),
    exclusiveMinimum: tightest(
      Math.max,
      Arr.toUnshifted(bounds.exclusiveMinimum)(candidates.exclusiveMinimum),
    ),
    maximum: tightest(
      Math.min,
      Arr.toUnshifted(bounds.maximum)(candidates.maximum),
    ),
    exclusiveMaximum: tightest(
      Math.min,
      Arr.toUnshifted(bounds.exclusiveMaximum)(candidates.exclusiveMaximum),
    ),
  }) as const;

const tightest = (
  pick: (...values: readonly number[]) => number,
  values: readonly (number | undefined)[],
): number | undefined => {
  const defined = values.filter(isNumber);

  return Arr.isNonEmpty(defined) ? pick(...defined) : undefined;
};

const boundsOf = (schema: JsonSchema): Bounds =>
  ({
    minimum: numberOrUndefined(schema['minimum']),
    exclusiveMinimum: numberOrUndefined(schema['exclusiveMinimum']),
    maximum: numberOrUndefined(schema['maximum']),
    exclusiveMaximum: numberOrUndefined(schema['exclusiveMaximum']),
  }) as const;

/**
 * The bounds as keywords, a bound left out where the other one on the same
 * side is at least as tight.
 */
const boundsSchema = ({
  minimum,
  exclusiveMinimum,
  maximum,
  exclusiveMaximum,
}: Bounds): JsonSchema => {
  const lowerIsExclusive =
    exclusiveMinimum !== undefined &&
    (minimum === undefined || exclusiveMinimum >= minimum);

  const upperIsExclusive =
    exclusiveMaximum !== undefined &&
    (maximum === undefined || exclusiveMaximum <= maximum);

  return {
    ...(lowerIsExclusive
      ? { exclusiveMinimum }
      : minimum === undefined
        ? {}
        : { minimum }),
    ...(upperIsExclusive
      ? { exclusiveMaximum }
      : maximum === undefined
        ? {}
        : { maximum }),
  };
};

/** Whether the bounds already leave 0 out, so that `!= 0` says nothing more. */
const excludesZero = ({
  minimum,
  exclusiveMinimum,
  maximum,
  exclusiveMaximum,
}: Bounds): boolean =>
  (minimum !== undefined && minimum > 0) ||
  (exclusiveMinimum !== undefined && exclusiveMinimum >= 0) ||
  (maximum !== undefined && maximum < 0) ||
  (exclusiveMaximum !== undefined && exclusiveMaximum <= 0);

// --- utilities ---

const constraintsOf = (type: UnknownType): ReadonlyRecord<string, unknown> =>
  hasConstraints(type) ? type.constraints : ({} as const);

/** `schema` with `names` added to its `x-refined`. */
const withRefined = (
  schema: JsonSchema,
  names: readonly string[],
): JsonSchema => {
  const existing = schema['x-refined'] ?? undefined;

  const all = [
    ...(Arr.isArray(existing) ? existing.filter(isString) : ([] as const)),
    ...names,
  ] as const;

  return Arr.isNonEmpty(all) ? { ...schema, 'x-refined': all } : schema;
};

const isPlainStringSchema = (schema: JsonSchema): boolean =>
  Arr.isFixedLengthArray(1, Object.keys(schema)) && schema['type'] === 'string';

const isJsonPrimitive = (value: unknown): value is JsonPrimitive =>
  isString(value) || isNumber(value) || isBoolean(value) || value === null;

const numberOrUndefined = (value: unknown): number | undefined =>
  isNumber(value) ? value : undefined;

/**
 * Every result's schema, combined by `combine`, or every error any of them
 * had.
 */
const collect = (
  results: readonly ConversionResult[],
  combine: (schemas: readonly JsonSchema[]) => JsonSchema,
): ConversionResult => {
  const errors = results.flatMap((result) =>
    Result.isErr(result) ? result.value : [],
  );

  return Arr.isNonEmpty(errors)
    ? Result.err(errors)
    : Result.ok(
        combine(
          Arr.generate(function* () {
            for (const result of results) {
              if (Result.isOk(result)) {
                yield result.value;
              }
            }
          }),
        ),
      );
};

const failure = (
  kind: JsonSchemaConversionError['kind'],
  type: UnknownType,
  path: readonly string[],
  message: string,
): ConversionResult => Result.err([conversionError(kind, type, path, message)]);

const conversionError = (
  kind: JsonSchemaConversionError['kind'],
  type: UnknownType,
  path: readonly string[],
  message: string,
): JsonSchemaConversionError =>
  ({
    kind,
    schemaPath: toPointer(path),
    typeName: type.typeName,
    message,
  }) as const;

const toPointer = (path: readonly string[]): string =>
  path
    .map((segment) => `/${segment.replaceAll('~', '~0').replaceAll('/', '~1')}`)
    .join('');
