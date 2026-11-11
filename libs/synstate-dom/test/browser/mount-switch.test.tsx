import { createScope, createState, map } from 'synstate';
import { mountSwitch, toNodes } from 'synstate-dom';

type User = Readonly<{ name: string }>;

describe(mountSwitch, () => {
  // Moved from synstate-router-dom, whose `Routes` switches on `router.match`,
  // which nothing a page reads is shallower than: so the switch is tested here,
  // with a value derived in more steps than the branch's own.
  test('disposes a branch before what it derived computes a value that rules it out (#3605)', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const mut_seen: (string | undefined)[] = [];

    // Two steps from the source, so that the key is deeper than the branch's node.
    const value$ = user$.pipe(map((u) => u)).pipe(map((u) => u !== undefined));

    const scope = createScope();

    const container = document.createElement('p');

    container.append(
      ...toNodes(
        scope.run(() =>
          mountSwitch(
            value$,
            (defined) => defined,
            (defined) =>
              defined ? (
                <b>
                  {user$.pipe(
                    map((u) => {
                      mut_seen.push(u?.name);

                      // The switch rules `undefined` out; reaching it here is the bug.
                      return u === undefined ? 'unreachable' : u.name;
                    }),
                  )}
                </b>
              ) : undefined,
          ),
        ),
      ),
    );

    setUser({ name: 'b' });

    assert.strictEqual(container.textContent, 'b');

    setUser(undefined);

    assert.strictEqual(container.textContent, '');

    assert.deepStrictEqual(mut_seen, ['a', 'b']);

    scope.dispose();
  });
});
