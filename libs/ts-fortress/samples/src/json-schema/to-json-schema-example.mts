import * as t from 'ts-fortress';

const User = t.strictRecord({
  name: t.string('a', { minLength: 1 }),
  age: t.optional(t.uint32()),
});

const schema = t.toJsonSchema(User);

assert.deepStrictEqual(
  schema,
  t.Result.ok({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      age: {
        type: 'integer',
        minimum: 0,
        exclusiveMaximum: 4_294_967_296,
        'x-brand': 'Uint32',
      },
    },
    required: ['name'],
    additionalProperties: false,
  }),
);
