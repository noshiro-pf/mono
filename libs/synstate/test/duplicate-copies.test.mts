import type { FixedLengthTuple } from 'ts-type-forge';
import type * as Synstate from '../src/index.mjs';

// Each call loads a new module graph, standing for one more copy of synstate in
// the same program, as a bundle that resolves two installations has.
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

  test('an update passes through nodes of alternating copies', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    const [a$, setA] = copyA.createState(0);

    const last$ = a$
      .pipe(copyB.map((x) => x + 1))
      .pipe(copyA.map((x) => x * 10))
      .pipe(copyB.map((x) => x + 2));

    const mut_received: number[] = [];

    last$.subscribe((v) => {
      mut_received.push(v);
    });

    setA(1);

    assert.deepStrictEqual(mut_received, [12, 22]);
  });

  test('a child in one copy updates with a root in another that has issued fewer updates', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    // Copy A runs ahead, so that whatever copy A counts per update is past what
    // copy B counts.
    const [warmUp$, setWarmUp] = copyA.createState(0);

    warmUp$.subscribe(() => {});

    for (const i of [1, 2, 3, 4, 5]) {
      setWarmUp(i);
    }

    const [b$, setB] = copyB.createState(0);

    const doubled$ = b$.pipe(copyA.map((x) => x * 2));

    const mut_received: number[] = [];

    doubled$.subscribe((v) => {
      mut_received.push(v);
    });

    setB(1);

    setB(2);

    assert.deepStrictEqual(mut_received, [0, 2, 4]);
  });

  test('a child one copy creates during an update of another copy is not visited by it', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    // Copy B runs ahead, so that a node copy A creates looks older than the
    // update copy B starts, if the copies count updates separately.
    const [b$, setB] = copyB.createState(0);

    b$.subscribe(() => {});

    for (const i of [1, 2, 3, 4, 5]) {
      setB(i);
    }

    let mut_calls = 0;

    let mut_created = false;

    b$.subscribe((x) => {
      if (x !== 6 || mut_created) {
        return;
      }

      mut_created = true;

      b$.pipe(
        copyA.map((y) => {
          mut_calls += 1;

          return y;
        }),
      ).subscribe(() => {});
    });

    b$.pipe(copyB.map((x) => x)).subscribe(() => {});

    setB(6);

    // Once for the initial value; the update that created it does not run it
    // again.
    assert.strictEqual(mut_calls, 1);

    setB(7);

    assert.strictEqual(mut_calls, 2);
  });

  test('an update of one copy started inside an update of another loses no node of either', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    const [a$, setA] = copyA.createState(0);

    const [b$, setB] = copyB.createState(0);

    const p$ = b$.pipe(copyB.map((x) => x));

    const q$ = b$.pipe(copyB.map((x) => x));

    const r$ = b$.pipe(copyB.map((x) => x));

    // Depth 2, reached by copy B's update through `p$` and `q$`, and by copy
    // A's through `a$`.
    const c$ = copyA.combine([p$, q$, a$]);

    // Depth 2, after `c$` at its depth in copy B's update.
    const d$ = q$.pipe(copyB.map((x) => x));

    const mut_fromC: FixedLengthTuple<3, number>[] = [];

    c$.subscribe((v) => {
      mut_fromC.push(v);
    });

    const mut_fromD: number[] = [];

    d$.subscribe((v) => {
      mut_fromD.push(v);
    });

    // Runs once `p$` and `q$` have passed copy B's update on to `c$` and `d$`.
    r$.subscribe((x) => {
      if (x === 1) {
        setA(1);
      }
    });

    setB(1);

    assert.deepStrictEqual(mut_fromC, [
      [0, 0, 0],
      // copy A's update
      [1, 1, 1],
      // copy B's update
      [1, 1, 1],
    ]);

    assert.deepStrictEqual(mut_fromD, [0, 1]);
  });
});
