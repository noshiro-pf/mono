import type * as Synstate from '../src/index.mjs';

// Each call loads a new module graph, standing for one more copy of synstate
// in the same program, as a bundle that resolves two installations has.
const loadCopy = async (): Promise<typeof Synstate> => {
  vi.resetModules();

  return import('../src/index.mjs');
};

describe('two copies of synstate in one program', () => {
  test('each load is a distinct copy', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    assert.notStrictEqual(copyA.source, copyB.source);
  });

  test('merge picks the parent the update came from', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    const b$ = copyB.source<string>();

    const a$ = copyA.source<string>();

    const merged$ = copyA.merge([b$, a$]);

    const mut_received: string[] = [];

    merged$.subscribe((value) => {
      mut_received.push(value);
    });

    // Two updates of b$ bring copy B's last update token to the one copy A
    // issues next, if the copies count separately.
    b$.next('b1');

    b$.next('b2');

    a$.next('a1');

    assert.deepStrictEqual(mut_received, ['b1', 'b2', 'a1']);
  });

  test('a copy keeps nothing on globalThis', async () => {
    const before = Reflect.ownKeys(globalThis);

    const copy = await loadCopy();

    copy.source<number>().next(1);

    assert.deepStrictEqual(Reflect.ownKeys(globalThis), before);
  });
});
