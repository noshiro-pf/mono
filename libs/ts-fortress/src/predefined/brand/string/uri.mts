import { type Brand } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// An absolute URI/URL always has a non-empty scheme, so it also satisfies `NonEmptyString`.
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

// `URL.canParse` trims leading/trailing ASCII whitespace per the WHATWG URL parser, so
// surrounding whitespace must be rejected explicitly to avoid accepting e.g. " https://example.com ".
const isUri = (s: string): s is Uri => s === s.trim() && URL.canParse(s);

if (import.meta.vitest !== undefined) {
  test('defaultUri', () => {
    assert.isTrue(isUri(defaultUri));
  });
}
