import * as t from 'ts-fortress';

// Define object schemas
const Person = t.record({
  firstName: t.string(),
  lastName: t.string(),
  age: t.number(),
  address: t.record({
    street: t.string(),
    city: t.string(),
    zipCode: t.string(),
  }),
});

type Person = t.TypeOf<typeof Person>;

// Optional fields
const UserProfile = t.record({
  username: t.string(),
  bio: t.optional(t.string()), // Optional field
  settings: t.partial(
    t.record({
      // Partial record (all fields optional)
      theme: t.string('light'),
      notifications: t.boolean(true),
    }),
  ),
});

// Strict validation (disallow excess properties)
const StrictUserType = t.record(
  {
    id: t.string(),
    name: t.string(),
  },
  {
    excessPropertyValidation: 'error', // Reject any properties not defined in schema
    excessPropertyFill: 'strip',
  },
);

// Alternatively, use the strictRecord alias for cleaner syntax
const StrictUserTypeAlias = t.strictRecord({
  id: t.string(),
  name: t.string(),
});

// Permissive validation (allow excess properties) - this is the default
const PermissiveUserType = t.record(
  {
    id: t.string(),
    name: t.string(),
  },
  {
    excessPropertyValidation: 'allow', // Allow additional properties (default behavior)
    excessPropertyFill: 'allow',
  },
);

// Example usage - both StrictUserType and StrictUserTypeAlias behave identically
const strictData = { id: '123', name: 'John', extra: 'not allowed' } as const;

assert.isFalse(StrictUserType.is(strictData)); // 'extra' property causes rejection

assert.isFalse(StrictUserTypeAlias.is(strictData)); // same as above

const permissiveData = { id: '123', name: 'John', extra: 'allowed' } as const;

assert.isTrue(PermissiveUserType.is(permissiveData)); // 'extra' property is allowed

// strictRecord provides cleaner syntax for strict validation
const UserSchema = t.strictRecord({
  name: t.string(),
  email: t.string(),
  age: t.number(),
});

// Validation examples
UserSchema.is({ name: 'John', email: 'john@example.com', age: 30 }); // ✅ true

UserSchema.is({
  name: 'John',
  email: 'john@example.com',
  age: 30,
  role: 'admin',
}); // ❌ false - excess property

// embed-sample-code-ignore-below
export { Person, UserProfile };
