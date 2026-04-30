/// <reference types="ts-type-forge" />

import { brandedString } from '../../../brand/index.mjs';
import { type Type } from '../../../type.mjs';

export type Email = Brand<string, 'Email'>;

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
  brandedString({
    is: (s): s is Email => regexpEmailAddress.test(s),
    defaultValue: options?.defaultValue ?? defaultEmail,
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
