import { isNonNullObject } from 'ts-data-forge';
import { type Brand } from 'ts-type-forge';
import { brandedString } from '../../../brand/index.mjs';
import { type Type } from '../../../type.mjs';

export type JsonString = Brand<string, 'JsonString'>;

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
  brandedString({
    is: isJsonString,
    defaultValue: options?.defaultValue ?? defaultJsonString,
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
