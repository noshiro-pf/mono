// embed-sample-code-ignore-above

import * as t from 'ts-fortress';

const User = t.record({
  name: t.string(),
  age: t.number(),
});

type User = t.TypeOf<typeof User>;

const invalidData = { name: 123, age: 'not a number' };

const result = User.validate(invalidData);

assert.isTrue(t.Result.isErr(result));

// result.value is an array of ValidationError objects

assert.deepStrictEqual(result.value, [
  {
    actualValue: 123,
    expectedType: 'string',
    path: ['name'],
    typeName: 'string',
    details: undefined,
  },
  {
    actualValue: 'not a number',
    expectedType: 'number',
    path: ['age'],
    typeName: 'number',
    details: undefined,
  },
] satisfies t.ValidationError[]);

// Convert to string messages
const messages = t.validationErrorsToMessages(result.value);

assert.deepStrictEqual(messages, [
  'Error at name: expected <string> type but <number> type value `123` was passed.',
  'Error at age: expected <number> type but <string> type value "not a number" was passed.',
]);

const assertIsUser: (a: unknown) => asserts a is User = User.assertIs;

// Using assertions (throws on invalid data)
try {
  assertIsUser(invalidData);
} catch (error) {
  assert.deepStrictEqual(
    error,
    new Error(
      '\nError at name: expected <string> type but <number> type value `123` was passed.,\nError at age: expected <number> type but <string> type value "not a number" was passed.',
    ),
  );
}

// Excess property validation example
const StrictType = t.record(
  {
    name: t.string(),
    age: t.number(),
  },
  {
    excessPropertyValidation: 'error',
    excessPropertyFill: 'strip',
  },
);

const dataWithExcess = { name: 'John', age: 30, extra: 'not allowed' };

const strictResult = StrictType.validate(dataWithExcess);

assert.isTrue(t.Result.isErr(strictResult));

assert.deepStrictEqual(strictResult.value, [
  {
    path: ['extra'],
    actualValue: 'not allowed',
    expectedType: '{ name: string, age: number }',
    typeName: '{ name: string, age: number }',
    details: {
      kind: 'excess-key',
      key: 'extra',
    },
  },
]);
