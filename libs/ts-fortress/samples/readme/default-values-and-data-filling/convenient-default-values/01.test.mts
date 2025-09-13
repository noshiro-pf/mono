import * as t from 'ts-fortress';

// Most common types have built-in defaults
const Schema = t.record({
  name: t.string(), // defaults to ""
  age: t.number(), // defaults to 0
  active: t.boolean(), // defaults to false
  tags: t.array(t.string()), // defaults to []
  config: t.record({
    debug: t.nullable(t.boolean()), // defaults to false
  }), // defaults to { debug: false }
});

// embed-sample-code-ignore-below
assert.deepStrictEqual(Schema.defaultValue, {
  name: '',
  age: 0,
  active: false,
  tags: [],
  config: { debug: false },
} satisfies t.TypeOf<typeof Schema>);
