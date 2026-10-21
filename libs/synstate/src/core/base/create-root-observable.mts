import { Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { isRootObservable, type RootObservable } from '../types/index.mjs';
import {
  addTeardown,
  adoptIntoCurrentScope,
  completeNode,
  isPropagating,
  startUpdate,
} from './create-observable-base.mjs';
import { createNodeRecord } from './node-class.mjs';
import { asMutable } from './observable-node.mjs';

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

  /**
   * Registers a teardown (clear timers, abort requests, remove listeners, …)
   * to run at the beginning of `complete()`, in the order registered. Called
   * from `init`, it lets the teardown close over what `init` creates.
   * Registered once the observable has completed — `init` may complete it
   * synchronously first — the teardown runs at once.
   */
  onComplete: (teardown: () => void) => void;
}>;

export type RootObservableConfig<A> = Readonly<{
  initialValue: Optional<A>;
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
  { initialValue }: RootObservableConfig<A>,
  init: (tools: RootObservableTools<A>) => Extension,
): Extension & RootObservable<A> => {
  const node = createNodeRecord('root', 0, undefined, initialValue);

  // A root created while an update propagates (inside a `switchMap`
  // projection, say) may emit synchronously while `init` runs, as
  // `fromSubscribable` does for a synchronous source. Nothing is derived from
  // it yet, so that is its initial value rather than a write (#2336).
  let mut_isInitializing = true;

  let mut_hasWarned = false;

  const extension: Extension = init({
    startUpdate: (nextValue) => {
      if (!mut_isInitializing && !mut_hasWarned && isPropagating()) {
        mut_hasWarned = true;

        console.warn(writeDuringPropagationWarning);
      }

      startUpdate(node, nextValue);
    },
    getSnapshot: () => node.snapshot,
    isCompleted: () => node.isCompleted,
    complete: () => {
      completeNode(node);
    },
    onComplete: (teardown) => {
      addTeardown(node, teardown);
    },
  });

  mut_isInitializing = false;

  // The leaf's own members (`next`, `start`, …) go on the record itself.
  const mut_node = asMutable(node);

  Object.assign(mut_node, extension);

  adoptIntoCurrentScope(node);

  return (
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    node as unknown as Extension & RootObservable<A>
  );
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

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    assert.isTrue(
      isRootObservable(
        createRootObservable({ initialValue: Optional.some(0) }, () => ({})),
      ),
    );
  });
}
