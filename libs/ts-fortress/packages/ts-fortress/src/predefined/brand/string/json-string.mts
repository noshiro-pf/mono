import { isNonNullObject } from 'ts-data-forge';
import { type Brand, type NonEmptyString } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// A valid JSON string (an object or array literal) is always non-empty, so
// `JsonString` is branded on top of `NonEmptyString` and is assignable to it.
export type JsonString = Brand<NonEmptyString, 'JsonString'>;

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 */
export const jsonString = (
  options?: Partial<
    Readonly<{
      defaultValue: string;
    }>
  >,
): Type<JsonString> =>
  brand<NonEmptyString, readonly ['JsonString']>({
    baseType: string(options?.defaultValue ?? defaultJsonString, {
      nonempty: true,
    }),
    is: isJsonString,
    brandKeys: ['JsonString'],
    typeName: 'JsonString',
  });

const defaultJsonString = '{}';

const isJsonString = (str: string): str is JsonString => {
  try {
    return isNonNullObject(JSON.parse(str));
  } catch {
    return false;
  }
};

if (import.meta.vitest !== undefined) {
  test('defaultJsonString', () => {
    assert.isTrue(isJsonString(defaultJsonString));
  });
}
