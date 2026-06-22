import { isNonNullObject } from 'ts-data-forge';
import { type Brand } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// A valid JSON string (an object or array literal) is always non-empty, so it
// also satisfies `NonEmptyString`.
export type JsonString = Brand<string, 'JsonString' | 'NonEmptyString'>;

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
  brand({
    baseType: string(options?.defaultValue ?? defaultJsonString),
    is: isJsonString,
    defaultValue: options?.defaultValue ?? defaultJsonString,
    brandKeys: ['JsonString', 'NonEmptyString'],
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
