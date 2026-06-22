import { expectType } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';
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
