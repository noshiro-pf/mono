// ajv publishes its draft 2020-12 validator only at this path, and has no
// `exports` map to name it otherwise.
// eslint-disable-next-line import-x/no-internal-modules, import-x/extensions
import { Ajv2020 } from 'ajv/dist/2020.js';
import { hasKey, Result } from 'ts-data-forge';
import * as t from '../src/index.mjs';

describe(t.toJsonSchema, () => {
  describe('primitives', () => {
    test.each([
      ['string', t.string(), { type: 'string' }],
      ['number', t.number(), { type: 'number' }],
      ['boolean', t.boolean(), { type: 'boolean' }],
      ['null', t.nullType, { type: 'null' }],
      ['unknown', t.unknown(), {}],
      ['a string literal', t.literal('a'), { const: 'a' }],
      ['a number literal', t.literal(1), { const: 1 }],
      ['an enum', t.enumType(['a', 'b', 3]), { enum: ['a', 'b', 3] }],
    ] as const)('%s', (_, type, expected) => {
      assert.deepStrictEqual(schemaOf(type), expected);
    });

    test('puts $schema on the root unless told not to', () => {
      const schema = t.toJsonSchema(t.string());

      assert.isTrue(Result.isOk(schema));

      assert.deepStrictEqual(schema.value, {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'string',
      });
    });
  });

  describe('string constraints', () => {
    test('lengths', () => {
      assert.deepStrictEqual(
        schemaOf(t.string('ab', { nonempty: true, maxLength: 8 })),
        { type: 'string', minLength: 1, maxLength: 8 },
      );

      assert.deepStrictEqual(
        schemaOf(t.string('abc', { nonempty: true, minLength: 3 })),
        { type: 'string', minLength: 3 },
      );
    });

    test('patterns, the first as `pattern` and the others under `allOf`', () => {
      assert.deepStrictEqual(
        schemaOf(
          t.string('a.b$c', {
            startsWith: 'a.',
            endsWith: '$c',
            regex: /^[a-z.$]+$/u,
          }),
        ),
        {
          type: 'string',
          pattern: String.raw`^a\.`,
          allOf: [{ pattern: String.raw`\$c$` }, { pattern: '^[a-z.$]+$' }],
        },
      );
    });

    test('what a pattern cannot say goes to x-refined', () => {
      assert.deepStrictEqual(
        schemaOf(t.string('AB', { uppercase: true, regex: /^ab$/iu })),
        { type: 'string', 'x-refined': ['uppercase', 'regex /^ab$/iu'] },
      );
    });
  });

  describe('number constraints', () => {
    test('bounds and integers', () => {
      assert.deepStrictEqual(
        schemaOf(t.number(0, { int: true, min: 0, max: 120 })),
        { type: 'integer', minimum: 0, maximum: 120 },
      );

      assert.deepStrictEqual(
        schemaOf(t.number(1, { gt: 0, lt: 10, gte: 0.5, multipleOf: 0.5 })),
        {
          type: 'number',
          minimum: 0.5,
          exclusiveMaximum: 10,
          multipleOf: 0.5,
        },
      );
    });

    test('the sign constraints', () => {
      assert.deepStrictEqual(schemaOf(t.number(1, { positive: true })), {
        type: 'number',
        exclusiveMinimum: 0,
      });

      assert.deepStrictEqual(schemaOf(t.number(1, { nonZero: true })), {
        type: 'number',
        not: { const: 0 },
      });

      assert.deepStrictEqual(
        schemaOf(t.number(1, { safeInteger: true, nonNegative: true })),
        { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
      );
    });

    test('a multiple of 0 is an error', () => {
      const schema = t.toJsonSchema(t.number(0, { multipleOf: 0 }));

      assert.isTrue(Result.isErr(schema));

      assert.strictEqual(schema.value[0]?.kind, 'unsatisfiable');
    });
  });

  describe('branded and ranged numbers', () => {
    test.each([
      ['int', t.int(), { type: 'integer', 'x-brand': 'Int' }],
      [
        'uint32',
        t.uint32(),
        {
          type: 'integer',
          minimum: 0,
          exclusiveMaximum: 2 ** 32,
          'x-brand': 'Uint32',
        },
      ],
      [
        'positiveInt',
        t.positiveInt(1),
        { type: 'integer', exclusiveMinimum: 0, 'x-brand': 'PositiveInt' },
      ],
      [
        'negativeInt',
        t.negativeInt(-1),
        { type: 'integer', exclusiveMaximum: 0, 'x-brand': 'NegativeInt' },
      ],
      [
        'safeInt',
        t.safeInt(),
        {
          type: 'integer',
          minimum: Number.MIN_SAFE_INTEGER,
          maximum: Number.MAX_SAFE_INTEGER,
          'x-brand': 'SafeInt',
        },
      ],
      [
        'int16',
        t.int16(),
        {
          type: 'integer',
          minimum: -(2 ** 15),
          exclusiveMaximum: 2 ** 15,
          'x-brand': 'Int16',
        },
      ],
      ['int8', t.int8(), { type: 'integer', minimum: -128, maximum: 127 }],
      [
        'uintRangeInclusive',
        t.uintRangeInclusive(1, 5),
        { type: 'integer', minimum: 1, maximum: 5 },
      ],
    ] as const)('%s', (_, type, expected) => {
      assert.deepStrictEqual(schemaOf(type), expected);
    });

    test('keeps the range constraints of the base number', () => {
      assert.deepStrictEqual(schemaOf(t.uint32(5, { min: 1, max: 10 })), {
        type: 'integer',
        minimum: 1,
        maximum: 10,
        'x-brand': 'Uint32',
      });
    });

    test('a brand of a string says only its name', () => {
      assert.deepStrictEqual(schemaOf(t.email()), {
        type: 'string',
        minLength: 1,
        'x-brand': 'Email',
      });
    });
  });

  describe('records', () => {
    test('required members, optional ones and excess properties', () => {
      assert.deepStrictEqual(
        schemaOf(
          t.record({
            id: t.string(),
            note: t.optional(t.string()),
          }),
        ),
        {
          type: 'object',
          properties: { id: { type: 'string' }, note: { type: 'string' } },
          required: ['id'],
        },
      );

      assert.deepStrictEqual(schemaOf(t.strictRecord({ id: t.string() })), {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
        additionalProperties: false,
      });
    });

    test('the record operations describe the record they build', () => {
      const User = t.strictRecord({ id: t.string(), age: t.number() });

      assert.deepStrictEqual(schemaOf(t.partial(User)), {
        type: 'object',
        properties: { id: { type: 'string' }, age: { type: 'number' } },
        required: [],
        additionalProperties: false,
      });

      assert.deepStrictEqual(schemaOf(t.pick(User, ['age'])), {
        type: 'object',
        properties: { age: { type: 'number' } },
        required: ['age'],
        additionalProperties: false,
      });
    });

    test('keyValueRecord', () => {
      assert.deepStrictEqual(schemaOf(t.keyValueRecord(t.string(), t.int())), {
        type: 'object',
        additionalProperties: { type: 'integer', 'x-brand': 'Int' },
      });

      assert.deepStrictEqual(
        schemaOf(
          t.keyValueRecord(t.string('a', { startsWith: 'a' }), t.boolean()),
        ),
        {
          type: 'object',
          propertyNames: { type: 'string', pattern: '^a' },
          additionalProperties: { type: 'boolean' },
        },
      );
    });
  });

  describe('arrays', () => {
    test.each([
      ['array', t.array(t.string()), {}],
      ['nonEmptyArray', t.nonEmptyArray(t.string()), { minItems: 1 }],
      [
        'fixedLengthArray',
        t.fixedLengthArray(3, t.string()),
        { minItems: 3, maxItems: 3 },
      ],
      [
        'boundedLengthTuple',
        t.boundedLengthTuple(1, 4, t.string()),
        { minItems: 1, maxItems: 4 },
      ],
      ['maxLengthArray', t.maxLengthArray(2, t.string()), { maxItems: 2 }],
    ] as const)('%s', (_, type, lengths) => {
      assert.deepStrictEqual(schemaOf(type), {
        type: 'array',
        items: { type: 'string' },
        ...lengths,
      });
    });

    test('tuple', () => {
      assert.deepStrictEqual(schemaOf(t.tuple([t.string(), t.number()])), {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: false,
        minItems: 2,
        maxItems: 2,
      });
    });
  });

  describe('unions and intersections', () => {
    test('anyOf, with nested unions flattened', () => {
      assert.deepStrictEqual(
        schemaOf(t.union([t.string(), t.union([t.number(), t.nullType])])),
        {
          anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
        },
      );
    });

    test('leaves out members no JSON value is of', () => {
      assert.deepStrictEqual(schemaOf(t.nullable(t.string())), {
        type: 'string',
      });

      const schema = t.toJsonSchema(t.union([t.undefinedType, t.bigint()]));

      assert.isTrue(Result.isErr(schema));

      assert.strictEqual(schema.value[0]?.kind, 'not-json');
    });

    test('oneOf with a discriminator when a literal key tells members apart', () => {
      assert.deepStrictEqual(
        schemaOf(
          t.union([
            t.record({ kind: t.literal('a'), a: t.string() }),
            t.record({ kind: t.literal('b'), b: t.number() }),
          ]),
        ),
        {
          type: 'object',
          oneOf: [
            {
              type: 'object',
              properties: { kind: { const: 'a' }, a: { type: 'string' } },
              required: ['kind', 'a'],
            },
            {
              type: 'object',
              properties: { kind: { const: 'b' }, b: { type: 'number' } },
              required: ['kind', 'b'],
            },
          ],
          discriminator: { propertyName: 'kind' },
        },
      );
    });

    test('no discriminator when two members share the literal', () => {
      const schema = schemaOf(
        t.union([
          t.record({ kind: t.literal('a'), a: t.string() }),
          t.record({ kind: t.literal('a'), b: t.number() }),
        ]),
      );

      assert.isTrue(hasKey(schema, 'anyOf'));
    });

    test('allOf', () => {
      const A = t.record({ a: t.string() });

      const B = t.record({ b: t.number() });

      assert.deepStrictEqual(
        schemaOf(
          t.intersection([A, B], t.record({ a: t.string(), b: t.number() })),
        ),
        { allOf: [schemaOf(A), schemaOf(B)] },
      );
    });
  });

  describe('recursion', () => {
    test('a $defs entry and a $ref to it', () => {
      type Tree = Readonly<{ value: number; children: readonly Tree[] }>;

      const Tree: t.Type<Tree> = t.recursion('Tree<number>', () =>
        t.record({ value: t.number(), children: t.array(Tree) }),
      );

      const schema = t.toJsonSchema(t.record({ root: t.optional(Tree) }));

      assert.isTrue(Result.isOk(schema));

      assert.deepStrictEqual(schema.value, {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: { root: { $ref: '#/$defs/Tree_number_' } },
        required: [],
        $defs: {
          Tree_number_: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              children: {
                type: 'array',
                items: { $ref: '#/$defs/Tree_number_' },
              },
            },
            required: ['value', 'children'],
          },
        },
      });
    });

    test('JsonValue', () => {
      const schema = t.toJsonSchema(t.JsonValue);

      assert.isTrue(Result.isOk(schema));

      assert.deepStrictEqual(schema.value, {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $ref: '#/$defs/JsonValue',
        $defs: {
          JsonValue: {
            anyOf: [
              { type: 'null' },
              { type: 'number' },
              { type: 'string' },
              { type: 'boolean' },
              {
                type: 'object',
                additionalProperties: { $ref: '#/$defs/JsonValue' },
              },
              { type: 'array', items: { $ref: '#/$defs/JsonValue' } },
            ],
          },
        },
      });
    });

    test('numbers two recursions that share a name', () => {
      const A: t.Type<unknown> = t.recursion('X', () => t.string());

      const B: t.Type<unknown> = t.recursion('X', () => t.number());

      const schema = t.toJsonSchema(t.tuple([A, B]), {
        includeSchemaUri: false,
      });

      assert.isTrue(Result.isOk(schema));

      assert.deepStrictEqual(schema.value, {
        type: 'array',
        prefixItems: [{ $ref: '#/$defs/X' }, { $ref: '#/$defs/X_2' }],
        items: false,
        minItems: 2,
        maxItems: 2,
        $defs: { X: { type: 'string' }, X_2: { type: 'number' } },
      });
    });
  });

  describe('predicates', () => {
    test('refine and templateLiteral add their names to x-refined', () => {
      const Even = t.refine({
        baseType: t.number(0, { min: 0 }),
        is: (n): n is number => n % 2 === 0,
        defaultValue: 0,
        typeName: 'Even',
      });

      assert.deepStrictEqual(schemaOf(Even), {
        type: 'number',
        minimum: 0,
        'x-refined': ['Even'],
      });

      const Path = t.templateLiteral<`/${string}`>({
        is: (s): s is `/${string}` =>
          typeof s === 'string' && s.startsWith('/'),
        typeName: 'Path',
        defaultValue: '/',
      });

      assert.deepStrictEqual(schemaOf(Path), {
        type: 'string',
        'x-refined': ['Path'],
      });
    });
  });

  describe('errors', () => {
    test('names every part that has no schema, by where it would go', () => {
      const schema = t.toJsonSchema(
        t.record({
          ok: t.string(),
          big: t.bigint(),
          list: t.array(t.SetType(t.string())),
        }),
      );

      assert.isTrue(Result.isErr(schema));

      assert.deepStrictEqual(
        schema.value.map(({ kind, schemaPath }) => [kind, schemaPath]),
        [
          ['not-json', '/properties/big'],
          ['not-json', '/properties/list/items'],
        ],
      );
    });

    test('a type written by hand is opaque', () => {
      const { structure: _, ...handWritten } = t.string();

      const schema = t.toJsonSchema(handWritten);

      assert.isTrue(Result.isErr(schema));

      assert.strictEqual(schema.value[0]?.kind, 'opaque');
    });

    test('escapes a member name in the schema path', () => {
      const schema = t.toJsonSchema(t.record({ 'a/b~c': t.undefinedType }));

      assert.isTrue(Result.isErr(schema));

      assert.strictEqual(schema.value[0]?.schemaPath, '/properties/a~1b~0c');
    });
  });

  describe('agrees with validate on JSON values', () => {
    const ajv = new Ajv2020({ strict: true, discriminator: true });

    ajv.addKeyword('x-brand');

    ajv.addKeyword('x-refined');

    const cases = [
      [t.uint32(), [0, 1, 2 ** 32 - 1, 2 ** 32, -1, 1.5, '1']],
      [t.negativeInt(-1), [-1, 0, 1, -1.5]],
      [t.int16(), [-(2 ** 15), 2 ** 15 - 1, 2 ** 15, -(2 ** 15) - 1]],
      [
        t.number(1, { gt: 0, lte: 10, multipleOf: 0.5 }),
        [0, 0.5, 10, 10.5, 0.25],
      ],
      [
        t.string('a.', { minLength: 2, startsWith: 'a', includes: '.' }),
        ['a.', 'a', 'b.', 'a.b'],
      ],
      [
        t.strictRecord({ a: t.string(), b: t.optional(t.int()) }),
        [
          { a: '' },
          { a: '', b: 1 },
          { a: '', b: 1.5 },
          { b: 1 },
          { a: '', c: 0 },
        ],
      ],
      [
        t.union([
          t.record({ kind: t.literal('a'), a: t.string() }),
          t.record({ kind: t.literal('b'), b: t.number() }),
        ]),
        [
          { kind: 'a', a: '' },
          { kind: 'b', b: 0 },
          { kind: 'a', b: 0 },
          { kind: 'c' },
        ],
      ],
      [
        t.tuple([t.string(), t.number()]),
        [['a', 1], ['a'], ['a', 1, 2], [1, 'a']],
      ],
      [t.nonEmptyArray(t.boolean()), [[true], [], [1]]],
      [t.JsonValue, [{ a: [1, 'b', { c: null }] }, [], 'x']],
      [t.enumType(['a', 1]), ['a', 1, 'b', true]],
    ] as const satisfies readonly (readonly [
      t.Type<unknown>,
      readonly unknown[],
    ])[];

    test.each(cases)('%#', (type, values) => {
      const schema = t.toJsonSchema(type);

      assert.isTrue(Result.isOk(schema));

      const validate = ajv.compile(schema.value);

      assert.deepStrictEqual(
        values.map((value) => [value, validate(value)]),
        values.map((value) => [value, type.is(value)]),
      );
    });
  });
});

describe('structure', () => {
  test('optional keeps the structure of the type it wraps', () => {
    assert.deepStrictEqual(t.optional(t.string()).structure, {
      kind: 'string',
    });
  });

  test('a recursion is not resolved to read its structure', () => {
    const mut_calls: unknown[] = [];

    const Lazy = t.recursion('Lazy', () => {
      mut_calls.push(0);

      return t.string();
    });

    assert.strictEqual(Lazy.structure?.kind, 'recursion');

    assert.deepStrictEqual(mut_calls, []);
  });

  test('a brand records whether a predicate narrows it', () => {
    const Plain = t.brandedString({ typeName: 'Plain', defaultValue: '' });

    assert.isTrue(
      Plain.structure?.kind === 'brand' && !Plain.structure.refined,
    );

    const { structure } = t.int();

    assert.isTrue(structure?.kind === 'brand' && structure.refined);
  });
});

const schemaOf = (type: t.Type<unknown>): t.JsonSchema => {
  const schema = t.toJsonSchema(type, { includeSchemaUri: false });

  assert.isTrue(Result.isOk(schema));

  return schema.value;
};
