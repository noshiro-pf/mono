/* transformer-ignore convert-to-readonly */
/* eslint-disable @typescript-eslint/consistent-type-definitions, vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line convert-interface-to-type
interface User {
  id: number;
  name: string;
}

// After
type User2 = {
  id: number;
  name: string;
};

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('convert-interface-to-type-example', () => {
    expectType<User, { id: number; name: string }>('=');

    expectType<User2, { id: number; name: string }>('=');
  });
}
