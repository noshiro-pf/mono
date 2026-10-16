import { Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { isRootObservable, type RootObservable } from '../types/index.mjs';
import {
  assembleObservable,
  createManagerObservableParts,
  createObservableBaseHandle,
  createTryUpdateNotImplemented,
  isPropagating,
} from './create-observable-base.mjs';

/**
 * The internal tools a root leaf factory (`source`, `timer`, `fromPromise`, …)
 * receives — the replacement for the `protected` methods a subclass of
 * `RootObservableClass` used to inherit.
 */
export type RootObservableTools<A> = Readonly<{
  /** Emits `nextValue` and propagates the update to all descendants. */
  startUpdate: (nextValue: A) => void;

  getSnapshot: () => Optional<A>;

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
  // The default is deliberately empty: a root leaf without `init` adds no members.
  // eslint-disable-next-line @typescript-eslint/no-generated-empty-object-type
  Extension extends ReadonlyRecord<string, unknown> = ReadonlyRecord<
    never,
    never
  >,
>(
  { initialValue, onComplete }: RootObservableConfig<A>,
  init: (tools: RootObservableTools<A>) => Extension,
): Extension & RootObservable<A> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  const { addDescendant, deleteDescendant, startUpdate } =
    createManagerObservableParts(handle);

  const complete = (): void => {
    onComplete?.();

    handle.completeBase();
  };

  // A root created while an update propagates (inside a `switchMap`
  // projection, say) may emit synchronously while `init` runs, as
  // `fromSubscribable` does for a synchronous source. Nothing is derived from
  // it yet, so that is its initial value rather than a write (#2336).
  let mut_isInitializing = true;

  let mut_hasWarned = false;

  const startUpdateWithWarning = (nextValue: A): void => {
    if (!mut_isInitializing && !mut_hasWarned && isPropagating()) {
      mut_hasWarned = true;

      console.warn(writeDuringPropagationWarning);
    }

    startUpdate(nextValue);
  };

  const extension: Extension = init({
    startUpdate: startUpdateWithWarning,
    getSnapshot: handle.getSnapshot,
    isCompleted: handle.isCompleted,
    complete,
  });

  mut_isInitializing = false;

  return assembleObservable({
    kind: 'root',
    depth: 0,
    handle,
    tryUpdate: createTryUpdateNotImplemented,
    tryComplete: tryCompleteRoot,
    complete,
    // A root has no parents to keep out of it.
    dispose: complete,
    extra: {
      ...extension,
      addDescendant,
      deleteDescendant,
    },
  });
};

/**
 * Shown once per root observable, the first time it is written to (`next`,
 * `setState`, `dispatch`, …) while another update is still propagating —
 * from a subscriber or a projection. The write still propagates immediately,
 * as it always has; the warning is there because the pattern is wrong, not
 * because anything was refused.
 */
export const writeDuringPropagationWarning =
  'synstate: an observable was written to (next / setState / dispatch) while an update was propagating, so subscribers can see intermediate states. Derive the value with map / combine instead of writing from a subscriber or a projection.';

/**
 * `tryComplete` is how a completed parent reaches its children. A root has no
 * parents, and a child completing never completes it (#2133), so only its own
 * `complete()` ends it.
 */
const tryCompleteRoot = (): void => {};

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    assert.isTrue(
      isRootObservable(
        createRootObservable({ initialValue: Optional.some(0) }, () => ({})),
      ),
    );
  });
}
