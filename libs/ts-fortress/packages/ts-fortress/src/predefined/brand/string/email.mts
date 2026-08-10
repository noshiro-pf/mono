import { type Brand, type NonEmptyString } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

// A valid e-mail address is always non-empty, so `Email` is branded on top of
// `NonEmptyString` and is assignable to it.
export type Email = Brand<NonEmptyString, 'Email'>;

/**
 * @link https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 */
export const email = (
  options?: Partial<
    Readonly<{
      defaultValue: string;
    }>
  >,
): Type<Email> =>
  brand<NonEmptyString, readonly ['Email']>({
    baseType: string(options?.defaultValue ?? defaultEmail, {
      nonempty: true,
    }),
    is: (s): s is Email => regexpEmailAddress.test(s),
    brandKeys: ['Email'],
    typeName: 'Email',
  });

const defaultEmail = 'ts-f.o.r.t.r.e.s.s@gmail.com';

const regexpEmailAddress =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/u;

if (import.meta.vitest !== undefined) {
  test('defaultEmail', () => {
    expect(defaultEmail).toMatch(regexpEmailAddress);
  });
}
