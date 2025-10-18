// Example: src/object/object.mts (pick)
import { Obj, pipe } from 'ts-data-forge';

// embed-sample-code-ignore-above
const user = {
  id: 1,
  name: 'Bob',
  email: 'bob@example.com',
  password: 'secret',
  role: 'admin',
};

// Direct usage
const publicInfo = Obj.pick(user, ['id', 'name', 'role']);
assert.deepStrictEqual(publicInfo, {
  id: 1,
  name: 'Bob',
  role: 'admin',
});

// Curried usage with pipe
const nameAndEmail = pipe(user).map(Obj.pick(['name', 'email'])).value;

assert.deepStrictEqual(nameAndEmail, {
  name: 'Bob',
  email: 'bob@example.com',
});
