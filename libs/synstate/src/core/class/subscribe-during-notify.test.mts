// cspell:ignore unstub
import { createState } from '../../utils/index.mjs';
import { source } from '../create/index.mjs';
import { mergeMap, switchMap, withBufferedFrom } from '../operators/index.mjs';
import { createScope } from '../scope/index.mjs';

describe('a subscriber added while subscribers are called', () => {
  test('is given the value once, by subscribe', () => {
    const s$ = source<number>();

    const mut_history: string[] = [];

    let mut_added = false;

    s$.subscribe((v) => {
      mut_history.push(`outer ${v}`);

      if (mut_added) {
        return;
      }

      mut_added = true;

      s$.subscribe((w) => {
        mut_history.push(`inner ${w}`);
      });
    });

    s$.next(1);

    s$.next(2);

    assert.deepStrictEqual(mut_history, [
      'outer 1',
      'inner 1',
      'outer 2',
      'inner 2',
    ]);
  });

  test('the same in a scope', () => {
    const [state, setState] = createState(0);

    const mut_history: string[] = [];

    const scope = createScope();

    state.subscribe((v) => {
      mut_history.push(`outer ${v}`);

      if (v === 1) {
        scope.run(() => {
          state.subscribe((w) => {
            mut_history.push(`inner ${w}`);
          });
        });
      }
    });

    setState(1);

    setState(2);

    assert.deepStrictEqual(mut_history, [
      'outer 0',
      'outer 1',
      'inner 1',
      'outer 2',
      'inner 2',
    ]);

    scope.dispose();
  });

  test('is still given a value written inside the call that added it', () => {
    const s$ = source<number>();

    const mut_history: string[] = [];

    let mut_added = false;

    s$.subscribe((v) => {
      if (mut_added) {
        return;
      }

      mut_added = true;

      s$.subscribe((w) => {
        mut_history.push(`inner ${w}`);
      });

      s$.next(v + 10);
    });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    // A write from a subscriber warns once per root.
    vi.stubGlobal('console', { ...console, warn: vi.fn() });

    s$.next(1);

    assert.deepStrictEqual(mut_history, ['inner 1', 'inner 11']);
  });

  // The operators subscribe through `subscribe` as anyone does, so the rule is
  // the tests above; these pin that it reaches them, one path each.
  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)(
    '%s subscribing to its inner observable meanwhile emits the value once',
    (_name, flatten) => {
      const inner$ = source<number>();

      const [key$] = createState(0);

      const mut_history: string[] = [];

      let mut_added = false;

      inner$.subscribe((v) => {
        mut_history.push(`outer ${v}`);

        if (mut_added) {
          return;
        }

        mut_added = true;

        // The operator subscribes to `inner$` while `inner$` calls its
        // subscribers.
        key$.pipe(flatten(() => inner$)).subscribe((w) => {
          mut_history.push(`flattened ${w}`);
        });
      });

      inner$.next(1);

      inner$.next(2);

      assert.deepStrictEqual(mut_history, [
        'outer 1',
        'flattened 1',
        'outer 2',
        'flattened 2',
      ]);
    },
  );

  test('withBufferedFrom subscribing meanwhile buffers the value once', () => {
    const data$ = source<string>();

    const [trigger$, setTrigger] = createState(0);

    const mut_history: (readonly [number, readonly string[]])[] = [];

    let mut_added = false;

    data$.subscribe(() => {
      if (mut_added) {
        return;
      }

      mut_added = true;

      trigger$.pipe(withBufferedFrom(data$)).subscribe((v) => {
        mut_history.push(v);
      });
    });

    data$.next('a');

    setTrigger(1);

    assert.deepStrictEqual(mut_history, [
      [0, ['a']],
      [1, []],
    ]);
  });

  test('a subscriber unsubscribed by an earlier one is not called', () => {
    const s$ = source<number>();

    const mut_history: string[] = [];

    const mut_second: { unsubscribe: (() => void) | undefined } = {
      unsubscribe: undefined,
    };

    s$.subscribe((v) => {
      mut_history.push(`first ${v}`);

      mut_second.unsubscribe?.();
    });

    mut_second.unsubscribe = s$.subscribe((v) => {
      mut_history.push(`second ${v}`);
    }).unsubscribe;

    s$.next(1);

    assert.deepStrictEqual(mut_history, ['first 1']);
  });
});
