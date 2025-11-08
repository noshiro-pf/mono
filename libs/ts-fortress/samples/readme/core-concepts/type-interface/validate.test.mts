import * as t from 'ts-fortress';

const User = t.record({
  name: t.string(),
  age: t.number(),
});

// Success case - returns the same object reference
const validData = { name: 'Alice', age: 30 } as const;
const result = User.validate(validData);

assert(t.Result.isOk(result));
assert(result.value === validData); // true - same reference!

assert.deepStrictEqual(result.value, { name: 'Alice', age: 30 });

// Error case - provides detailed error information
const invalidData = { name: 'Bob', age: 'thirty' } as const;
const errorResult = User.validate(invalidData);

assert(t.Result.isErr(errorResult));

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
  'Expected <number> at age, got <string> type value "thirty".',
]);
