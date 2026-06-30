import { isNonEmptyString } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export type { NonEmptyString } from 'ts-type-forge';

export const nonEmptyString = (
  defaultValue: string = ' ',
): Type<NonEmptyString> =>
  brand({
    baseType: string(defaultValue),
    is: isNonEmptyString,
    defaultValue,
    brandKeys: ['NonEmptyString'],
    typeName: 'NonEmptyString',
  });

if (import.meta.vitest !== undefined) {
  test('defaultValue', () => {
    // eslint-disable-next-line ts-data-forge/no-unnecessary-type-guard
    assert.isTrue(isNonEmptyString(' '));
  });
}
