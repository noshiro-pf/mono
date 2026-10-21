// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Arr, type Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { RootObservable } from '../types/index.mjs';
import { RootObservableClass } from './root-observable-class.mjs';

/**
 * The tools a custom root's `init` receives: the `protected` methods a
 * subclass of `RootObservableClass` inherits.
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
 * Creates a root observable, for a custom creator written without a class
 * of its own.
 *
 * `init` runs during construction, receives the tools, and returns extra
 * public members to merge into the observable (e.g. `next` for a source,
 * `start` for a timer). It may register asynchronous callbacks that use the
 * tools, and may call `complete` synchronously.
 */
export const createRootObservable = <
  A,
  // The default is deliberately empty: a root without `init` adds no members.
  // eslint-disable-next-line @typescript-eslint/no-generated-empty-object-type
  Extension extends ReadonlyRecord<string, unknown> = ReadonlyRecord<
    never,
    never
  >,
>(
  { initialValue }: RootObservableConfig<A>,
  init: (tools: RootObservableTools<A>) => Extension,
): Extension & RootObservable<A> =>
  // The members `init` returned are assigned to the observable.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  new CustomRootObservableClass(initialValue, init) as unknown as Extension &
    RootObservable<A>;

/* implementation */

class CustomRootObservableClass<A> extends RootObservableClass<A> {
  #mut_teardowns: readonly (() => void)[] | undefined;

  constructor(
    initialValue: Optional<A>,
    init: (tools: RootObservableTools<A>) => ReadonlyRecord<string, unknown>,
  ) {
    super({ initialValue });

    this.#mut_teardowns = undefined;

    const extension = init({
      startUpdate: (nextValue) => {
        this.startUpdate(nextValue);
      },
      getSnapshot: () => this.getSnapshot(),
      isCompleted: () => this.isCompleted,
      complete: () => {
        this.complete();
      },
      onComplete: (teardown) => {
        if (this.isCompleted) {
          teardown();
        } else {
          this.#mut_teardowns = Arr.toPushed(
            this.#mut_teardowns ?? [],
            teardown,
          );
        }
      },
    });

    Object.assign(this, extension);
  }

  protected override teardown(): void {
    for (const teardown of this.#mut_teardowns ?? []) {
      teardown();
    }
  }
}
