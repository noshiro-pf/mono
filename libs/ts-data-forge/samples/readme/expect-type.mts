/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('main', () => {
    type User = Readonly<{ id: number; name: string }>;

    type Admin = Readonly<{ id: number; name: string; role: 'admin' }>;

    // Assert that Admin extends User
    expectType<Admin, User>('<=');

    // Assert that User does not extend Admin
    expectType<User, Admin>('!<=');

    // Assert exact type equality
    expectType<Readonly<{ x: number }>, Readonly<{ x: number }>>('=');

    // The following would cause a compile-time error:
    // expectType<User, Admin>("="); // Error: Type 'User' is not strictly equal to type 'Admin'.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectType<User, any>('!='); // Error: Comparisons with `any` are also strictly checked.

    // embed-sample-code-ignore-below
  });
}
