import { type Brand, type NonEmptyString } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// An absolute URI/URL always has a non-empty scheme, so `Uri` is branded on
// top of `NonEmptyString` and is assignable to it.
export type Uri = Brand<NonEmptyString, 'Uri'>;

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
  brand<NonEmptyString, readonly ['Uri']>({
    baseType: string(options?.defaultValue ?? defaultUri, { nonempty: true }),
    is: isUri,
    brandKeys: ['Uri'],
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
