import { expectType } from 'ts-data-forge';
import { type MinLengthString, type NonEmptyString } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { type Email } from './email.mjs';
import { type Iso8601 } from './iso-8601.mjs';
import { type JsonString } from './json-string.mjs';
import { nonEmptyString } from './non-empty-string.mjs';
import { type Uuid, type Uuid4, type Uuid6, type Uuid7 } from './uuid.mjs';

describe(nonEmptyString, () => {
  const baseType = nonEmptyString();

  type NonEmptyStringType = TypeOf<typeof baseType>;

  expectType<NonEmptyStringType, string>('<=');

  expectType<NonEmptyStringType, NonEmptyString>('=');

  expectType<typeof baseType.defaultValue, NonEmptyStringType>('=');

  // The other string brand types in this directory never produce empty
  // strings, so they must also be assignable to `NonEmptyString`.
  expectType<Email, NonEmptyString>('<=');

  expectType<Iso8601, NonEmptyString>('<=');

  expectType<JsonString, NonEmptyString>('<=');

  expectType<Uuid, NonEmptyString>('<=');

  expectType<Uuid4, NonEmptyString>('<=');

  expectType<Uuid6, NonEmptyString>('<=');

  expectType<Uuid7, NonEmptyString>('<=');

  test('uses a non-empty default value', () => {
    assert.isTrue(baseType.is(baseType.defaultValue));
  });

  test.each(['a', ' ', 'hello', '0'] as const)('accepts %o', (s) => {
    assert.isTrue(baseType.is(s));
  });

  test('rejects the empty string', () => {
    assert.isFalse(baseType.is(''));
  });

  test('accepts a custom default value', () => {
    const t = nonEmptyString('default');

    expect(t.defaultValue).toBe('default');
  });
});

describe('nonEmptyString with extra constraints', () => {
  test('forwards constraints to string and still enforces non-emptiness', () => {
    const t = nonEmptyString('abcd', { minLength: 3 });

    // Length constraints (e.g. `minLength`) refine the result type with the
    // corresponding length-constrained brand.
    expectType<TypeOf<typeof t>, NonEmptyString & MinLengthString<3>>('=');

    assert.isTrue(t.is('abcd'));

    assert.isTrue(t.is('abc'));

    assert.isFalse(t.is('ab')); // shorter than minLength

    assert.isFalse(t.is('')); // empty string is still rejected
  });

  test('throws when the default value violates a nonEmpty constraint', () => {
    expect(() => nonEmptyString('')).toThrow(
      /^defaultValue "" for string does not satisfy the constraint nonempty = true$/u,
    );
  });

  test('throws when the default value violates a forwarded constraint', () => {
    expect(() => nonEmptyString('ab', { minLength: 3 })).toThrow(
      /^defaultValue "ab" for string does not satisfy the constraint minLength = 3$/u,
    );
  });

  test('refines the result type for startsWith', () => {
    const t = nonEmptyString('a-thing', { startsWith: 'a' });

    // `startsWith` refines the result type, just like `string` does.
    expectType<TypeOf<typeof t>, NonEmptyString & `a${string}`>('=');

    assert.isTrue(t.is('a-thing'));

    assert.isFalse(t.is('b-thing'));
  });
});
