/* eslint-disable import-x/first */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const useState = <T,>(_defaultValue: T): [T, (v: T) => void] => [
  _defaultValue,
  () => {},
];
const IGNORE_EMBEDDING = (..._args: readonly unknown[]): void => {};
// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

const User = t.record({
  id: t.string(),
  name: t.string('Guest'),
  score: t.number(),
});

type User = t.TypeOf<typeof User>;

// Use defaultValue for initialization
const newUser: User = { ...User.defaultValue, id: 'user-123' };
// This default value filling process can also be written as follows:
const newUser2: User = User.fill({ id: 'user-456' });

assert.deepStrictEqual(newUser, { id: 'user-123', name: 'Guest', score: 0 });
assert.deepStrictEqual(newUser2, { id: 'user-456', name: 'Guest', score: 0 });

// Useful for React state initialization
const UserForm = () => {
  const [formData, setFormData] = useState<User>(User.defaultValue);
  // ...
  IGNORE_EMBEDDING(formData, setFormData);
};

// embed-sample-code-ignore-below
export { UserForm };
