import { isNonNullObject } from 'ts-data-forge';
import { brandedString } from '../../../brand/index.mjs';
import { type Type } from '../../../type.mjs';

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 */
export const jsonString = (
  defaultValue: string = defaultJsonString,
): Type<JsonString> =>
  brandedString({
    is: isJsonString,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    defaultValue: defaultValue as JsonString,
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
    expect(isJsonString(defaultJsonString)).toBe(true);
  });
}
