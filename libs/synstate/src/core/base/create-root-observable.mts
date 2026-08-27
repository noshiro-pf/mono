import { Optional } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { isRootObservable, type RootObservable } from '../types/index.mjs';
import {
  assembleObservable,
  createManagerObservableParts,
  createObservableBaseHandle,
  createTryUpdateNotImplemented,
} from './create-observable-base.mjs';

/**
 * The internal tools a root leaf factory (`source`, `timer`, `fromPromise`, …)
 * receives — the replacement for the `protected` methods a subclass of
 * `RootObservableClass` used to inherit.
 */
export type RootObservableTools<A> = Readonly<{
  /** Emits `nextValue` and propagates the update to all descendants. */
  startUpdate: (nextValue: A) => void;

  isCompleted: () => boolean;

  /** Completes this observable (leaf teardown included). */
  complete: () => void;
}>;

export type RootObservableConfig<A> = Readonly<{
  initialValue: Optional<A>;

  /**
   * Leaf teardown (clear timers, abort requests, …), run at the beginning of
   * `complete()` — the closure replacement for
   * `override complete() { teardown(); super.complete(); }`.
   */
  onComplete?: () => void;
}>;

/**
 * Creates a root observable — the classless replacement for extending
 * `RootObservableClass`.
 *
 * The optional `init` callback receives the internal tools and returns extra
 * public members to merge into the observable (e.g. `next` for `source`,
 * `start` for `timer`). `init` runs during construction; it may register
 * asynchronous callbacks that use the tools, and may call `complete`
 * synchronously, but the observable object itself does not exist yet at that
 * point.
 */
export const createRootObservable = <
  A,
  Extension extends ReadonlyRecord<string, unknown> = ReadonlyRecord<
    never,
    never
  >,
>(
  { initialValue, onComplete }: RootObservableConfig<A>,
  init: (tools: RootObservableTools<A>) => Extension,
): Extension & RootObservable<A> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  const { addDescendant, startUpdate } = createManagerObservableParts(handle);

  const complete = (): void => {
    onComplete?.();

    handle.completeBase();
  };

  const tryComplete = (): void => {
    if (!handle.hasSubscriber() && !handle.hasActiveChild()) {
      complete();
    }
  };

  const extension: Extension = init({
    startUpdate,
    isCompleted: handle.isCompleted,
    complete,
  });

  return assembleObservable({
    kind: 'root',
    depth: 0,
    handle,
    tryUpdate: createTryUpdateNotImplemented,
    tryComplete,
    complete,
    extra: {
      ...extension,
      addDescendant,
    },
  });
};

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    assert.isTrue(
      isRootObservable(
        createRootObservable({ initialValue: Optional.some(0) }, () => ({})),
      ),
    );
  });
}
