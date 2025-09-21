import { brandedString } from '../../../brand/index.mjs';
import { type Type } from '../../../type.mjs';

/**
 * @link https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 */
export const email = (defaultValue?: string): Type<Email> =>
  brandedString({
    is: (s): s is Email => regexpEmailAddress.test(s),
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    defaultValue: (defaultValue ?? defaultEmail) as Email,
    typeName: 'Email',
  });

const defaultEmail = 'ts-f.o.r.t.r.e.s.s@gmail.com';

const regexpEmailAddress =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gu;

if (import.meta.vitest !== undefined) {
  test('defaultEmail', () => {
    expect(defaultEmail).toMatch(regexpEmailAddress);
  });
}
