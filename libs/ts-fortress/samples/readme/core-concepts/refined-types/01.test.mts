/* eslint-disable import-x/first */
const IGNORE_EMBEDDING = (..._args: readonly unknown[]): void => {};

// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

// Create refined types
const Uuid = t.refine({
  baseType: t.string(),
  // Define custom validation logic
  is: (value: string): value is string =>
    /^[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}$/iu.test(
      value,
    ),
  defaultValue: '00000000-1111-2222-3333-444444444444',
  typeName: 'Uuid',
});

type Uuid = t.TypeOf<typeof Uuid>; // string (with runtime validation)

const PositiveNumber = t.refine({
  baseType: t.number(1),
  is: (value: number): value is number => value > 0,
  defaultValue: 1,
  typeName: 'PositiveNumber',
});

type PositiveNumber = t.TypeOf<typeof PositiveNumber>; // number (with runtime validation)

const EvenNumber = t.refine({
  baseType: t.number(),
  is: (value: number): value is number => value % 2 === 0,
  defaultValue: 0,
  typeName: 'EvenNumber',
});

// Usage in validation
const uuidResult = Uuid.validate('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b');

assert(t.Result.isOk(uuidResult));

if (t.Result.isOk(uuidResult)) {
  const validUuid = uuidResult.value; // string, guaranteed to be valid Uuid format

  IGNORE_EMBEDDING(validUuid);
}

const positiveResult = PositiveNumber.validate(42);

assert(t.Result.isOk(positiveResult));

if (t.Result.isOk(positiveResult)) {
  const positiveNum = positiveResult.value; // number, guaranteed to be > 0

  IGNORE_EMBEDDING(positiveNum);
}

// Invalid cases
assert(!Uuid.is('invalid-uuid'));

assert(!PositiveNumber.is(-5));

assert(!EvenNumber.is(7));

// Use in record schemas
const UserProfile = t.record({
  id: Uuid, // refined uuid validation
  score: PositiveNumber, // must be positive
  level: EvenNumber, // must be even
});

type UserProfile = t.TypeOf<typeof UserProfile>;

// The refined types maintain their validation in composite types
const userData = {
  id: '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b', // ✅ valid uuid format
  score: 85, // ✅ positive number
  level: 4, // ✅ even number
} as const satisfies UserProfile;

assert(UserProfile.is(userData));

const invalidData = {
  id: 'user123', // ❌ invalid uuid format
  score: -10, // ❌ negative number
  level: 3, // ❌ odd number
} as const;

const result = UserProfile.validate(invalidData);

assert(t.Result.isErr(result));

assert.deepStrictEqual(
  t.validationErrorsToMessages(
    result.value satisfies readonly t.ValidationError[],
  ),
  [
    'Error at id: expected <Uuid> value but <string> type value "user123" was passed.',
    'Error at score: expected <PositiveNumber> value but <number> type value `-10` was passed.',
    'Error at level: expected <EvenNumber> value but <number> type value `3` was passed.',
  ],
);
