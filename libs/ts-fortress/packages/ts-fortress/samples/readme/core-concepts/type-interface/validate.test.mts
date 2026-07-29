import * as t from 'ts-fortress';

const User = t.record({
  name: t.string(),
  age: t.number(),
});

// Success case - validates correctly
const validData = { name: 'Alice', age: 30 } as const;

const result = User.validate(validData);

assert.isTrue(t.Result.isOk(result));

// In strip mode (default), a new object is created even without excess properties
assert.deepStrictEqual(result.value, { name: 'Alice', age: 30 });

assert.notStrictEqual(result.value, validData);

// Error case - provides detailed error information
const invalidData = { name: 'Bob', age: 'thirty' } as const;

const errorResult = User.validate(invalidData);

assert.isTrue(t.Result.isErr(errorResult));

assert.deepStrictEqual(errorResult.value, [
  {
    path: ['age'],
    actualValue: 'thirty',
    expectedType: 'number',
    typeName: 'number',
    details: undefined,
  },
]);

assert.deepStrictEqual(t.validationErrorsToMessages(errorResult.value), [
  'Error at age: expected <number> type but <string> type value "thirty" was passed.',
]);
