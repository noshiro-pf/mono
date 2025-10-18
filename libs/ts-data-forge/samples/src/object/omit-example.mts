// Example: src/object/object.mts (omit)
import { Obj, pipe } from 'ts-data-forge';

// embed-sample-code-ignore-above
const user = {
  id: 1,
  name: 'Charlie',
  email: 'charlie@example.com',
  password: 'secret123',
  internalNote: 'VIP customer',
};

// Direct usage - remove sensitive fields
const safeUser = Obj.omit(user, ['password', 'internalNote']);
assert.deepStrictEqual(safeUser, {
  id: 1,
  name: 'Charlie',
  email: 'charlie@example.com',
});

// Curried usage with pipe
const withoutEmail = pipe(user).map(Obj.omit(['email', 'password'])).value;

assert.deepStrictEqual(withoutEmail, {
  id: 1,
  name: 'Charlie',
  internalNote: 'VIP customer',
});
