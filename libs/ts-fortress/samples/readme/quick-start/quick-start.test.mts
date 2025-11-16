import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

// Define a schema
const User = t.record({
  id: t.string(),
  name: t.string(),
  age: t.number(),
  email: t.optional(t.string()),
  isActive: t.boolean(),
});

// Infer TypeScript type
type User = t.TypeOf<typeof User>;

expectType<
  User,
  Readonly<{
    id: string;
    name: string;
    age: number;
    email?: string;
    isActive: boolean;
  }>
>('=');

// Validate data
const userData = {
  id: '123',
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  isActive: true,
} as const;

assert(User.is(userData));

if (User.is(userData)) {
  // userData is now typed as User
  userData satisfies User;

  assert.equal(
    `User: ${userData.name}, Age: ${userData.age}`,
    'User: John Doe, Age: 30',
  );
}

// Get validation result with error details
const result = User.validate(userData);

if (t.Result.isOk(result)) {
  result.value satisfies User; // typed as User
} else {
  console.error(
    'Validation errors:',
    result.value satisfies readonly t.ValidationError[],
  );
}
