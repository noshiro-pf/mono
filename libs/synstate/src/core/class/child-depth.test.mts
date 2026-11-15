import { Optional } from 'ts-data-forge';
import { source } from '../create/index.mjs';
import { map } from '../operators/index.mjs';
import { createScope } from '../scope/index.mjs';
import type { Observable } from '../types/index.mjs';
import {
  createAsyncChildObservable,
  createSyncChildObservable,
  createTryUpdateNotImplemented,
} from './create-child-observable.mjs';

const creators = [
  ['createSyncChildObservable', createSyncChildObservable],
  ['createAsyncChildObservable', createAsyncChildObservable],
] as const;

/** A chain of `depth` observables under a source, the last at `depth`. */
const atDepth = (depth: number): Observable<number> =>
  depth <= 0 ? source<number>() : atDepth(depth - 1).pipe(map((x) => x));

describe.each(creators)('%s', (_, create) => {
  const child = (
    config: Readonly<{
      parents: readonly [Observable<number>];
      alsoAfter?: readonly Observable<unknown>[];
      depth?: number;
    }>,
  ): Observable<number> =>
    create(
      { ...config, initialValue: Optional.none },
      createTryUpdateNotImplemented,
    );

  test.each([
    ['equal to', 2],
    ['below', 1],
    ['at the root, below', 0],
  ] as const)(
    'throws for a depth %s the parent’s, naming both',
    (_label, depth) => {
      const parent = atDepth(2);

      assert.throws(
        () => child({ parents: [parent], depth }),
        `A child observable's depth (${depth}) has to be greater than that of every observable it follows: the deepest is at depth 2.`,
      );
    },
  );

  test('takes a depth above the parent’s', () => {
    assert.strictEqual(child({ parents: [atDepth(2)], depth: 5 }).depth, 5);
  });

  test('throws for a depth not above an observable in alsoAfter', () => {
    assert.throws(
      () => child({ parents: [atDepth(1)], alsoAfter: [atDepth(3)], depth: 3 }),
      'the deepest is at depth 3',
    );
  });

  test('alsoAfter makes the child deeper than each observable in it', () => {
    const side = atDepth(4);

    assert.strictEqual(
      child({ parents: [atDepth(1)], alsoAfter: [side] }).depth,
      5,
    );
  });

  describe('inside a scope with after', () => {
    // Built outside the scope, which would raise them to its floor too.
    const scope = createScope(undefined, { after: atDepth(6) });

    const parent = atDepth(2);

    const side = atDepth(9);

    test('a passed depth is checked against the parents, then raised to the floor', () => {
      assert.throws(() =>
        scope.run(() => child({ parents: [parent], depth: 2 })),
      );

      assert.strictEqual(
        scope.run(() => child({ parents: [parent], depth: 3 })).depth,
        7,
      );
    });

    test('alsoAfter deeper than the floor sets the depth', () => {
      assert.strictEqual(
        scope.run(() => child({ parents: [atDepth(1)], alsoAfter: [side] }))
          .depth,
        10,
      );
    });
  });
});
