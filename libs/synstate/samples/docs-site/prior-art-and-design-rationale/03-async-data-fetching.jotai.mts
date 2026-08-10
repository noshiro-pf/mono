import { atom } from 'jotai';

type UserData = Readonly<{ name: string }>;

const authAtom = atom<Readonly<{ id: string }>>({ id: '1' });

const fetchUser = (_id: string): Promise<UserData> =>
  Promise.resolve({ name: 'Alice' });

// embed-sample-code-ignore-above

const userDataAtom = atom(async (get) => fetchUser(get(authAtom).id));

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('async data fetching (jotai)', () => {
    assert.strictEqual(typeof userDataAtom.read, 'function');
  });
}
