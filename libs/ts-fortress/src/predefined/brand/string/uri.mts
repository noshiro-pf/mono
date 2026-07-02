import { type Brand } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// A valid URI always has a non-empty scheme, so it also satisfies `NonEmptyString`.
export type Uri = Brand<string, 'Uri' | 'NonEmptyString'>;

/**
 * @link https://url.spec.whatwg.org/
 */
export const uri = (
  options?: Partial<
    Readonly<{
      defaultValue: string;
    }>
  >,
): Type<Uri> =>
  brand({
    baseType: string(options?.defaultValue ?? defaultUri),
    is: isUri,
    defaultValue: options?.defaultValue ?? defaultUri,
    brandKeys: ['Uri', 'NonEmptyString'],
    typeName: 'Uri',
  });

const defaultUri = 'https://example.com';

const isUri = (s: string): s is Uri => URL.canParse(s);

if (import.meta.vitest !== undefined) {
  test('defaultUri', () => {
    assert.isTrue(isUri(defaultUri));
  });
}
