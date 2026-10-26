import * as t from 'ts-fortress';

const Config = t.strictRecord({
  name: t.string('app', { minLength: 1 }),
  retries: t.optional(t.uint32()),
  mode: t.enumType(['fast', 'safe']),
});

const schema = t.toJsonSchema(Config);

assert.deepStrictEqual(
  schema,
  t.Result.ok({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      retries: {
        type: 'integer',
        minimum: 0,
        exclusiveMaximum: 4_294_967_296,
        'x-brand': 'Uint32',
      },
      mode: { enum: ['fast', 'safe'] },
    },
    required: ['name', 'mode'],
    additionalProperties: false,
  }),
);

// A part that has no JSON form is an error, named by where it would go
const WithBigint = t.record({ id: t.bigint() });

assert.deepStrictEqual(
  t.toJsonSchema(WithBigint),
  t.Result.err([
    {
      kind: 'not-json',
      schemaPath: '/properties/id',
      typeName: 'bigint',
      message: 'no JSON value is of the kind `bigint`',
    },
  ]),
);
