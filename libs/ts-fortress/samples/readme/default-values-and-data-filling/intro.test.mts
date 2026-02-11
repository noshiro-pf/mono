import * as t from 'ts-fortress';

// Every type requires a default value
const UserProfile = t.record({
  name: t.string('Anonymous'), // Default: 'Anonymous'
  age: t.number(), // Default: 0
  email: t.optional(t.string()), // Optional field with default ''
  preferences: t.record({
    theme: t.string('light'), // Default: 'light'
    notifications: t.boolean(true), // Default: true
  }),
  tags: t.array(t.string()), // Default: empty array []
});

// The fill() function automatically provides missing values
const partialData = {
  name: 'John Doe',
  preferences: {
    theme: 'dark',
    // notifications missing - will be filled with default
  },
  // age, email, tags missing - will be filled with defaults
} as const;

const filledData = UserProfile.fill(partialData);

assert.deepStrictEqual(filledData, {
  name: 'John Doe',
  age: 0, // ← Filled with default
  email: '', // ← Filled with default
  preferences: {
    theme: 'dark',
    notifications: true, // ← Filled with default
  },
  tags: [], // ← Filled with default
});

// fill() is type-safe and always returns a complete object
type UserProfile = t.TypeOf<typeof UserProfile>;

// Important: Default value filling only occurs when fill() is called
// The is() and validate() functions can still detect missing keys
assert.isFalse(UserProfile.is(partialData)); // missing required keys

const result = UserProfile.validate(partialData);

assert.isTrue(t.Result.isErr(result));

assert.deepStrictEqual(
  t.validationErrorsToMessages(
    result.value satisfies readonly t.ValidationError[],
  ),
  [
    `Error at age: missing required key "age".`,
    `Error at preferences.notifications: missing required key "notifications".`,
    `Error at tags: missing required key "tags".`,
  ],
);
