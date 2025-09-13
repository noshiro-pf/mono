import * as t from 'ts-fortress';

const numberType = t.number();

// ✅ Correct usage - explicit type annotation required
const assertIsNumber: (a: unknown) => asserts a is number = numberType.assertIs;

const processValue = (value: unknown): void => {
  assertIsNumber(value);

  // After assertion, TypeScript knows value is a number
  assertType<number>(value);
};

try {
  processValue(42); // Works
  processValue('not a number'); // Throws error
} catch (error) {
  assert.deepStrictEqual(
    error,
    new Error(`\nExpected <number>, got <string> type value "not a number".`),
  );
}

// Example with complex types
const User = t.record({
  id: t.string(),
  name: t.string(),
});

type User = t.TypeOf<typeof User>;

// Explicit type annotation for the assertion function
const assertIsUser: (a: unknown) => asserts a is User = User.assertIs;

const processUser = (data: unknown): void => {
  assertIsUser(data);

  // TypeScript now knows data is User type
  assertType<User>(data);
};

// embed-sample-code-ignore-below
try {
  processUser({ id: 'id', name: 'name' }); // Works
  processUser({ id: 123, name: 'name' }); // Throws error
} catch (error) {
  assert.deepStrictEqual(
    error,
    new Error(`\nExpected <string> at id, got <number> type value \`123\`.`),
  );
}
