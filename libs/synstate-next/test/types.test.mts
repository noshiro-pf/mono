import {
  batch,
  createDerived,
  createOwner,
  createSource,
  derive,
  filter,
  keepEqualParts,
  map,
  onCleanup,
  pairwise,
  scan,
  skip,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  source,
  state,
  take,
  takeUntil,
  takeWhile,
  untracked,
  withBufferedFrom,
  withCurrentValueFrom,
  withInitialValue,
  zip,
  type DropInitialValueOperator,
  type InitializedObservable,
  type KeepInitialValueOperator,
  type Observable,
  type ObservableValue,
  type ProvideInitialValueOperator,
  type Source,
  type State,
  type ValuesOf,
} from 'synstate-next';
import { Arr, expectType, isNotUndefined } from 'ts-data-forge';
import { Optional, type Some } from 'ts-std-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

describe('types', () => {
  test('pipe keeps, drops or provides the initial value', () => {
    const s = state(0);

    const e = source<number>();

    const kept = s.pipe(map((x) => x + 1));

    expectType<typeof kept, InitializedObservable<number>>('=');

    const _dropped = s.pipe(map((x) => x + 1)).pipe(filter((x) => x > 0));

    expectType<typeof _dropped, Observable<number>>('=');

    const inc = map((x: number) => x + 1);

    // One operator type-checks, so the error below is about the second.
    const _one = s.pipe(inc);

    expectType<typeof _one, InitializedObservable<number>>('=');

    // One operator per call: chain `pipe` for more.
    // @ts-expect-error pipe takes one operator
    const _variadic = (): unknown => s.pipe(inc, inc);

    // An operator's type is what it returns, so one that claims a value it may
    // not hold does not type-check.
    const lie: ProvideInitialValueOperator<number, number> = (o) =>
      // @ts-expect-error a filter's result may hold no value
      o.pipe(filter(() => true));

    const keepLie: KeepInitialValueOperator<number, number> = (o) =>
      // @ts-expect-error a filter's result may hold no value
      o.pipe(filter(() => true));

    // What the two lines above return, which is why they are refused: a
    // filter's result is an `Observable` whether its source may hold no value
    // (`lie`'s) or holds one (`keepLie`'s), and an `Observable` is not an
    // `InitializedObservable`.
    const _filteredOfNone = e.pipe(filter(() => true));

    const _filteredOfOne = s.pipe(filter(() => true));

    expectType<typeof _filteredOfNone, Observable<number>>('=');

    expectType<typeof _filteredOfOne, Observable<number>>('=');

    expectType<Observable<number>, InitializedObservable<number>>('!<=');

    assert.isFunction(lie);

    assert.isFunction(keepLie);

    const honestKeep: KeepInitialValueOperator<number, string> = (o) =>
      o.pipe(map(String));

    const honestDrop: DropInitialValueOperator<number, number> = (o) =>
      o.pipe(filter((x) => x > 0));

    const _keptByOwn = s.pipe(honestKeep);

    expectType<typeof _keptByOwn, InitializedObservable<string>>('=');

    const _droppedByOwn = s.pipe(honestDrop);

    expectType<typeof _droppedByOwn, Observable<number>>('=');

    // Inline operators, whose source type comes from `pipe`'s overloads.
    const _inlineDrop = s.pipe((o) => o.pipe(filter((x) => x > 0)));

    expectType<typeof _inlineDrop, Observable<number>>('=');

    const _inlineKeep = s.pipe((o) => o.pipe(map(String)));

    expectType<typeof _inlineKeep, Observable<string>>('=');

    const _inlineProvide = s.pipe((o) => o.pipe(withInitialValue(0)));

    expectType<typeof _inlineProvide, InitializedObservable<number>>('=');

    const _keptOfNone = e.pipe(honestKeep);

    expectType<typeof _keptOfNone, Observable<string>>('=');

    const _provided = e
      .pipe(filter((x) => x > 0))
      .pipe(scan((acc: number, x) => acc + x, 0));

    expectType<typeof _provided, InitializedObservable<number>>('=');

    const notYet = e.pipe(map((x) => x.toString()));

    expectType<typeof notYet, Observable<string>>('=');

    const _withInitial = e.pipe(withInitialValue(undefined));

    expectType<typeof _withInitial, InitializedObservable<number | undefined>>(
      '=',
    );

    const _both = derive([s, kept], (x, y) => x + y);

    expectType<typeof _both, InitializedObservable<number>>('=');

    const _partial = derive([s, e], (x, y) => [x, y] as const);

    expectType<typeof _partial, Observable<FixedLengthTuple<2, number>>>('=');

    // Covariant: a narrower observable goes where a wider one is expected.
    const wide: Observable<number | string> = kept;

    assert.deepStrictEqual(wide.getSnapshot(), Optional.some(1));

    assert.isTrue(Optional.isSome(kept.getSnapshot()));

    // An observable that always holds a value reads it as a `Some`.
    const _keptValue = kept.getSnapshot();

    expectType<typeof _keptValue, Some<number>>('=');

    expectType<ReturnType<typeof kept.getSnapshot>, Some<number>>('=');

    const _notYetValue = notYet.getSnapshot();

    expectType<typeof _notYetValue, Optional<string>>('=');

    assert.isTrue(Optional.isNone(notYet.getSnapshot()));

    assert.isTrue(Optional.isNone(notYet.getSnapshot()));
  });

  test('the synchronous operators keep or drop the initial value', () => {
    const s = state(0);

    const e = source<string>();

    const taken = s
      .pipe(take(2))
      .pipe(takeUntil(e))
      .pipe(skipIfNoChange())
      .pipe(keepEqualParts());

    expectType<typeof taken, InitializedObservable<number>>('=');

    const _skipped = s.pipe(skip(1));

    expectType<typeof _skipped, Observable<number>>('=');

    const _whiles = s
      .pipe(takeWhile((x) => x > 0))
      .pipe(skipWhile((x) => x > 0));

    expectType<typeof _whiles, Observable<number>>('=');

    const _inclusive = s.pipe(takeWhile((x) => x > 0, { inclusive: true }));

    expectType<typeof _inclusive, InitializedObservable<number>>('=');

    const _inclusiveFromEvent = source<number>().pipe(
      takeWhile((x) => x > 0, { inclusive: true }),
    );

    expectType<typeof _inclusiveFromEvent, Observable<number>>('=');

    const _notInclusive = s.pipe(takeWhile((x) => x > 0, { inclusive: false }));

    expectType<typeof _notInclusive, Observable<number>>('=');

    const _explicit = s.pipe(
      takeWhile<number>((x) => x > 0, { inclusive: true }),
    );

    expectType<typeof _explicit, InitializedObservable<number>>('=');

    expectType<Observable<number>['settled'], boolean>('=');

    const _untilGo = s.pipe(skipUntil(e));

    expectType<typeof _untilGo, Observable<number>>('=');

    const _pairs = s.pipe(pairwise());

    expectType<typeof _pairs, Observable<FixedLengthTuple<2, number>>>('=');

    const _withCurrent = s.pipe(withCurrentValueFrom(s));

    expectType<typeof _withCurrent, Observable<FixedLengthTuple<2, number>>>(
      '=',
    );

    const _buffered = s.pipe(withBufferedFrom(e));

    expectType<
      typeof _buffered,
      InitializedObservable<readonly [number, readonly string[]]>
    >('=');

    const _zipped = zip([s, s.pipe(map(String))]);

    expectType<
      typeof _zipped,
      InitializedObservable<readonly [number, string]>
    >('=');

    const _zippedEvents = zip([s, e]);

    expectType<typeof _zippedEvents, Observable<readonly [number, string]>>(
      '=',
    );

    assert.isTrue(Optional.isSome(taken.getSnapshot()));
  });

  test('filter narrows the values by a type guard', () => {
    const s = state<number | undefined>(0);

    const narrowed = s.pipe(filter(isNotUndefined));

    expectType<typeof narrowed, Observable<number>>('=');

    assert.deepStrictEqual(narrowed.getSnapshot(), Optional.some(0));

    const _kept = s.pipe(filter((x) => x !== 0));

    expectType<typeof _kept, Observable<number | undefined>>('=');
  });

  test('ObservableValue names the type of the values an observable holds', () => {
    const s = state(0);

    const _e = source<string>();

    const mapped = s.pipe(map((x) => [x] as const));

    expectType<ObservableValue<typeof s>, number>('=');

    expectType<ObservableValue<typeof _e>, string>('=');

    expectType<ObservableValue<typeof mapped>, readonly [number]>('=');

    expectType<
      ObservableValue<Observable<number | undefined>>,
      number | undefined
    >('=');

    expectType<ObservableValue<InitializedObservable<boolean>>, boolean>('=');

    expectType<ObservableValue<never>, unknown>('=');

    expectType<
      ValuesOf<readonly [never, Observable<number>]>,
      readonly [unknown, number]
    >('=');

    expectType<
      ObservableValue<Observable<number> | InitializedObservable<string>>,
      number | string
    >('=');

    // @ts-expect-error a union with a member that is not an observable
    expectType<ObservableValue<Observable<number> | undefined>, number>('=');

    assert.strictEqual(mapped.value[0], s.value);
  });

  test('derive spreads the values of an array narrowed by Arr.isNonEmpty', () => {
    const total = (values: readonly number[]): number => Arr.sum(values);

    const parents: readonly InitializedObservable<number>[] = [
      state(1),
      state(2),
    ] as const;

    assert.isTrue(Arr.isNonEmpty(parents));

    if (Arr.isNonEmpty(parents)) {
      assert.strictEqual(
        derive(parents, (...values) => total(values)).value,
        3,
      );
    }
  });

  test('the functions of an observable need it as their this', () => {
    const count = state(0);

    const clicks = source<number>();

    const doubled = count.pipe(map((n) => n * 2));

    const { set, update } = count;

    const { emit } = clicks;

    const { getSnapshot, subscribe, dispose } = doubled;

    assert.throws(() => {
      // @ts-expect-error set is a method of the state
      set(1);
    });

    assert.throws(() => {
      // @ts-expect-error update is a method of the state
      update((n) => n + 1);
    });

    assert.throws(() => {
      // @ts-expect-error emit is a method of the source
      emit(1);
    });

    // @ts-expect-error getSnapshot is a method of the observable
    assert.throws(() => getSnapshot());

    // @ts-expect-error subscribe is a method of the observable
    assert.throws(() => subscribe(() => {}));

    assert.throws(() => {
      // @ts-expect-error dispose is a method of the observable
      dispose();
    });

    // subscribe calls its function at once, with the current value.
    // @ts-expect-error subscribe gives its function a this of unknown
    assert.throws(() => doubled.subscribe(count.set));

    const owner = createOwner();

    owner.run(() => {
      // @ts-expect-error onCleanup gives its function a this of unknown
      onCleanup(doubled.dispose);
    });

    // A cleanup is called with no `this`, so the method throws.
    assert.throws(() => {
      owner.dispose();
    });

    // @ts-expect-error untracked gives its function a this of unknown
    assert.throws(() => untracked(count.getSnapshot));

    // @ts-expect-error batch gives its function a this of unknown
    assert.throws(() => batch(count.getSnapshot));

    const runOwner = createOwner();

    // @ts-expect-error run gives its function a this of unknown
    assert.throws(() => runOwner.run(count.getSnapshot));

    runOwner.dispose();

    // Typed only: each would throw when its owner is disposed.
    const _givenToContexts = (): void => {
      createSource<number>((ctx) => {
        // @ts-expect-error ctx.onCleanup gives its function a this of unknown
        ctx.onCleanup(doubled.dispose);
      });

      createDerived<number>([count], (ctx) => {
        // @ts-expect-error ctx.onCleanup gives its function a this of unknown
        ctx.onCleanup(doubled.dispose);

        return () => {
          ctx.set(count.value);
        };
      });

      // @ts-expect-error a returned function is called with no this
      createDerived<number>([count], () => doubled.dispose);

      // @ts-expect-error update is called on the object returned, not the state
      createDerived<number>([count], () => ({ update: count.dispose }));

      createDerived<number>([count], () => ({
        // @ts-expect-error a function that needs a this of its own
        update(this: Readonly<{ own: true }>) {},
      }));

      createDerived<number>([count], () => ({
        update: () => {},
        // @ts-expect-error a function that needs a this of its own
        settled(this: Readonly<{ own: true }>) {
          return true;
        },
      }));

      // A class's methods, which declare no this, type-check; called on the
      // instance (`Following` in ported/authoring.test.mts runs one).
      class Counting {
        #mut_n = 0;

        update(): void {
          this.#mut_n += 1;
        }

        settled(): boolean {
          return this.#mut_n > 0;
        }
      }

      createDerived<number>([count], () => new Counting());
    };

    expectType<typeof _givenToContexts, () => void>('=');

    // Wrapped, it is a function of its own.
    const mirror = state(-1);

    count.subscribe((n) => {
      mirror.set(n);
    });

    assert.strictEqual(mirror.value, 0);
  });

  test('the this of the functions keeps Observable covariant', () => {
    expectType<Observable<1>, Observable<number>>('<=');

    expectType<InitializedObservable<1>, InitializedObservable<number>>('<=');

    expectType<InitializedObservable<number>, Observable<number>>('<=');

    expectType<State<1>, State<number>>('!<=');

    expectType<State<number>, State<1>>('!<=');

    expectType<Source<1>, Source<number>>('!<=');

    assert.isTrue(true);
  });
});
