import {
  createScope,
  createState,
  isObservable,
  just,
  map,
  source,
} from '../src/index.mjs';

describe(isObservable, () => {
  test('accepts root, sync child and async child observables', () => {
    const [count$] = createState(0);

    assert.isTrue(isObservable(count$));

    assert.isTrue(isObservable(source<number>()));

    assert.isTrue(isObservable(just(1)));

    assert.isTrue(isObservable(count$.pipe(map((n) => n * 2))));
  });

  test('accepts completed and disposed observables', () => {
    const [count$] = createState(0);

    const doubled$ = count$.pipe(map((n) => n * 2));

    doubled$.dispose();

    assert.isTrue(isObservable(doubled$));

    count$.complete();

    assert.isTrue(isObservable(count$));
  });

  test('accepts an observable created inside a scope', () => {
    const scope = createScope();

    const created = scope.run(() => source<number>());

    scope.dispose();

    assert.isTrue(isObservable(created));
  });

  test('rejects values that only look like an observable', () => {
    assert.isFalse(isObservable({ subscribe: () => {} }));

    assert.isFalse(
      isObservable({
        subscribe: () => {},
        pipe: () => {},
        getSnapshot: () => {},
      }),
    );

    assert.isFalse(isObservable(() => {}));
  });

  test('rejects primitives, null and undefined', () => {
    assert.isFalse(isObservable(0));

    assert.isFalse(isObservable('a'));

    assert.isFalse(isObservable(null));

    assert.isFalse(isObservable(undefined));
  });
});
