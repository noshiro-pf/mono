import { source } from '../create/index.mjs';
import {
  map,
  withBufferedFrom,
  withCurrentValueFrom,
} from '../operators/index.mjs';
import type { Observable } from '../types/index.mjs';
import { createScope } from './scope.mjs';

describe('createScope with after', () => {
  test('an observable derived in the scope updates after `after`, however shallow it is', () => {
    const user$ = source<string | undefined>();

    const mut_order: string[] = [];

    const cond$ = user$.pipe(map((u) => u)).pipe(
      map((u) => {
        mut_order.push('cond');

        return u !== undefined;
      }),
    );

    const scope = createScope(undefined, { after: cond$ });

    scope.run(() =>
      user$.pipe(
        map((u) => {
          mut_order.push('branch');

          return u;
        }),
      ),
    );

    user$.next('a');

    assert.deepStrictEqual(mut_order, ['cond', 'branch']);
  });

  test('a branch disposed on hearing `after` never computes the value that rules it out', () => {
    const user$ = source<string | undefined>();

    const mut_seen: (string | undefined)[] = [];

    const cond$ = user$.pipe(map((u) => u)).pipe(map((u) => u !== undefined));

    const scope = createScope(undefined, { after: cond$ });

    scope.run(() => {
      user$.pipe(
        map((u) => {
          mut_seen.push(u);

          return u;
        }),
      );
    });

    cond$.subscribe((present) => {
      if (!present) {
        scope.dispose();
      }
    });

    user$.next('a');

    user$.next(undefined);

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test('a child scope inherits the floor, and a derived observable of a derived one stays below its parent', () => {
    const a$ = source<number>();

    const deep$ = a$
      .pipe(map((x) => x))
      .pipe(map((x) => x))
      .pipe(map((x) => x));

    const parent = createScope(undefined, { after: deep$ });

    const child = createScope(parent);

    const [b$, c$] = child.run(() => {
      const b = a$.pipe(map((x) => x));

      return [b, b.pipe(map((x) => x))] as const;
    });

    assert.isTrue(b$.depth > deep$.depth);

    assert.isTrue(c$.depth > b$.depth);
  });

  test('without after, depth is one below the deepest parent', () => {
    const a$ = source<number>();

    const scope = createScope();

    const b$ = scope.run(() => a$.pipe(map((x) => x)));

    assert.strictEqual(b$.depth, 1);
  });

  test.each([
    {
      name: 'withCurrentValueFrom',
      pipe: (a$: Observable<number>, b$: Observable<number>) =>
        a$.pipe(withCurrentValueFrom(b$)),
    },
    {
      name: 'withBufferedFrom',
      pipe: (a$: Observable<number>, b$: Observable<number>) =>
        a$.pipe(withBufferedFrom(b$)),
    },
  ])(
    'an explicit depth, as $name passes, is raised to the floor too',
    ({ pipe }) => {
      const a$ = source<number>();

      const b$ = source<number>();

      const deep$ = a$
        .pipe(map((x) => x))
        .pipe(map((x) => x))
        .pipe(map((x) => x));

      const scope = createScope(undefined, { after: deep$ });

      const paired$ = scope.run(() => pipe(a$, b$));

      assert.isTrue(paired$.depth > deep$.depth);
    },
  );
});
