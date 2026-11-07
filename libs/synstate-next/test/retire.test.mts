// cspell:ignore unstub
import {
  createDerived,
  createSource,
  createState,
  map,
  mergeMap,
  onCleanup,
  state,
  switchMap,
  type InitializedObservable,
  type Owner,
} from 'synstate-next';
import {
  DrainCheck,
  ownerBelow,
  retireOwner,
  toNode,
} from 'synstate-next/internal';

const noUpdate = (): void => {};

const noKey = new Error('no key');

const nodeFailure = new Error('node');

const unexpected = (): never => {
  throw new Error('the check threw');
};

describe(ownerBelow, () => {
  test('places the nodes made in it, and in its child owners, at its floor or deeper', () => {
    const [n$] = createState(0);

    const owner = ownerBelow(undefined, 5);

    const [shallow, deep, nested, inner] = owner.run(() => {
      const shallowInOwner = n$.pipe(map((n) => n));

      const deeper = state(0)
        .pipe(map((n) => n))
        .pipe(map((n) => n));

      const child = ownerBelow(undefined, 0);

      return [
        shallowInOwner,
        deeper,
        // An owner made by `ownerBelow` under no parent has its own floor.
        child.run(() => n$.pipe(map((n) => n))),
        ownerBelow(owner, 0).run(() => n$.pipe(map((n) => n))),
      ] as const;
    });

    assert.strictEqual(toNode(shallow).depth, 5);

    assert.strictEqual(toNode(deep).depth, 7);

    assert.strictEqual(toNode(nested).depth, 1);

    assert.strictEqual(toNode(inner).depth, 5);

    owner.dispose();
  });
});

describe(retireOwner, () => {
  test('a retired owner computes nothing more and runs no cleanup until it is disposed', () => {
    const [n$, setN] = createState(1);

    const mut_log: string[] = [];

    const mut_owner: { current: Owner | undefined } = { current: undefined };

    const check = new DrainCheck(
      toNode(n$),
      () => {
        if (n$.value < 0 && mut_owner.current !== undefined) {
          retireOwner(mut_owner.current);
        }
      },
      unexpected,
    );

    // Below the check, as a switch places its branch: a map made in it is
    // visited after the check, though it was registered with `n$` later.
    const owner = ownerBelow(undefined, check.branchDepth);

    mut_owner.current = owner;

    owner.run(() => {
      n$.pipe(
        map((n) => {
          mut_log.push(`map ${n.toString()}`);

          return n;
        }),
      ).subscribe((n) => {
        mut_log.push(`effect ${n.toString()}`);
      });

      onCleanup(() => {
        mut_log.push('cleanup');
      });
    });

    setN(2);

    setN(-1);

    setN(3);

    assert.deepStrictEqual(mut_log, ['map 1', 'effect 1', 'map 2', 'effect 2']);

    owner.dispose();

    assert.strictEqual(mut_log.at(-1), 'cleanup');
  });

  test('a node of a retired owner keeps its value', () => {
    const [n$, setN] = createState(1);

    const mut_owner: { current: Owner | undefined } = { current: undefined };

    const check = new DrainCheck(
      toNode(n$),
      () => {
        if (mut_owner.current !== undefined) {
          retireOwner(mut_owner.current);
        }
      },
      unexpected,
    );

    const owner = ownerBelow(undefined, check.branchDepth);

    mut_owner.current = owner;

    const doubled$ = owner.run(() => n$.pipe(map((n) => n * 2)));

    setN(2);

    assert.strictEqual(doubled$.value, 2);

    owner.dispose();
  });

  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)(
    'what a %s made in a retired owner projects is retired with it',
    (_name, flatten) => {
      const [n$, setN] = createState(1);

      const mut_log: string[] = [];

      const mut_owner: { current: Owner | undefined } = { current: undefined };

      const check = new DrainCheck(
        toNode(n$),
        () => {
          if (n$.value < 0 && mut_owner.current !== undefined) {
            retireOwner(mut_owner.current);
          }
        },
        unexpected,
      );

      const owner = ownerBelow(undefined, check.branchDepth);

      mut_owner.current = owner;

      // The projection's map belongs to the operator's own owner, not to
      // `owner`, and is shallower than the check unless placed below it.
      const [inner] = owner.run(() => {
        const [trigger$] = createState(0);

        const mut_inner: InitializedObservable<number>[] = [];

        trigger$
          .pipe(
            flatten(() => {
              const mapped = n$.pipe(
                map((n) => {
                  mut_log.push(`map ${n.toString()}`);

                  return n;
                }),
              );

              mut_inner.push(mapped);

              return mapped;
            }),
          )
          .subscribe(() => {});

        return mut_inner;
      });

      assert.isDefined(inner);

      assert.isAtLeast(toNode(inner).depth, check.branchDepth);

      setN(2);

      setN(-1);

      assert.deepStrictEqual(mut_log, ['map 1', 'map 2']);

      owner.dispose();
    },
  );
});

describe('what a custom node made in a retired owner sets up', () => {
  test.each([
    [
      'createDerived',
      (made: () => void) =>
        createDerived([state(0)], () => {
          made();

          return noUpdate;
        }),
    ],
    [
      'createSource',
      (made: () => void) =>
        createSource(() => {
          made();
        }),
    ],
  ] as const)('%s: is retired with it', (_name, custom) => {
    const [n$, setN] = createState(1);

    const mut_log: string[] = [];

    const mut_owner: { current: Owner | undefined } = { current: undefined };

    const check = new DrainCheck(
      toNode(n$),
      () => {
        if (n$.value < 0 && mut_owner.current !== undefined) {
          retireOwner(mut_owner.current);
        }
      },
      unexpected,
    );

    const owner = ownerBelow(undefined, check.branchDepth);

    mut_owner.current = owner;

    // The setup's map belongs to the node's own owner, not to `owner`.
    owner.run(() => {
      custom(() => {
        n$.pipe(
          map((n) => {
            mut_log.push(`map ${n.toString()}`);

            return n;
          }),
        ).subscribe(() => {});
      });
    });

    setN(2);

    setN(-1);

    assert.deepStrictEqual(mut_log, ['map 1', 'map 2']);

    owner.dispose();
  });
});

describe(DrainCheck, () => {
  test('a check that throws runs `failed` instead, and the update goes on', () => {
    const [n$, setN] = createState(1);

    const mut_log: string[] = [];

    const check = new DrainCheck(
      toNode(n$),
      () => {
        if (n$.value < 0) {
          throw noKey;
        }
      },
      () => {
        mut_log.push('failed');
      },
    );

    // Takes the failure as a switch's effect does.
    n$.subscribe((n) => {
      const failure = check.takeFailure();

      mut_log.push(
        `effect ${n.toString()}${failure === undefined ? '' : ', took it'}`,
      );
    });

    setN(-1);

    assert.isUndefined(check.takeFailure());

    setN(2);

    assert.deepStrictEqual(mut_log, [
      'effect 1',
      'failed',
      'effect -1, took it',
      'effect 2',
    ]);
  });

  test('a failure no effect takes is reported when the update ends', () => {
    const [n$, setN] = createState(1);

    const check = new DrainCheck(
      toNode(n$),
      () => {
        if (n$.value < 0) {
          throw noKey;
        }
      },
      () => {},
    );

    // A deeper node that throws in the same drain ends the update before any
    // effect could take the check's failure.
    n$.pipe(map((n) => n))
      .pipe(
        map((n) => {
          if (n < 0) {
            throw nodeFailure;
          }

          return n;
        }),
      )
      .subscribe(() => {});

    vi.stubGlobal('console', { ...console, error: vi.fn() });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    assert.throws(() => {
      setN(-1);
    }, nodeFailure);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(noKey);

    assert.isUndefined(check.takeFailure());

    setN(2);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(noKey);
  });
});
