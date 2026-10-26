import * as t from 'ts-fortress';

const Config = t.strictRecord({
  name: t.annotate(t.string('app'), {
    description: 'The name the service registers under.',
  }),
  retries: t.optional(
    t.annotate(t.uint32(), {
      description: 'How many times a failed request is retried.',
      examples: [t.asUint32(3)],
    }),
  ),
  id: t.uuid(),
});

const schema = t.toJsonSchema(
  t.annotate(Config, { title: 'Service configuration' }),
  { includeSchemaUri: false },
);

assert.deepStrictEqual(
  schema,
  t.Result.ok({
    title: 'Service configuration',
    type: 'object',
    properties: {
      name: {
        description: 'The name the service registers under.',
        type: 'string',
      },
      retries: {
        description: 'How many times a failed request is retried.',
        type: 'integer',
        minimum: 0,
        exclusiveMaximum: 4_294_967_296,
        'x-brand': 'Uint32',
        examples: [3],
      },
      // `uuid()` carries the `uuid` format of its own
      id: { type: 'string', minLength: 1, 'x-brand': 'Uuid', format: 'uuid' },
    },
    required: ['name', 'id'],
    additionalProperties: false,
  }),
);

// Annotations never change what is valid
assert.isTrue(t.annotate(t.string(), { format: 'email' }).is('not an e-mail'));
