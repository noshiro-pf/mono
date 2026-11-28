import {
  currentDepthFloor,
  disposeReporting,
  noValue,
  ownerBelow,
  retireOwner,
  view,
  type InitializedObservable,
  type NoValue,
  type Observable,
  type Owner,
} from '../core/index.mjs';
import { AsyncSourceClass } from './async-source-class.mjs';

/**
 * Creates a source that emits by itself, from another library or an event: a
 * creator written outside the package. `setup` runs once, at creation. The
 * source holds `initialValue` if given, and nothing until it first emits
 * otherwise. It belongs to the current owner as every observable does. `setup`
 * runs with the source as the current owner, so what it creates and the
 * cleanups it registers (`ctx.onCleanup`, or `onCleanup`) belong to the source.
 * Disposing it runs the cleanups, newest first, and then disposes what `setup`
 * created, as an owner does. A cleanup is registered, not returned.
 *
 * ```ts
 * const fromEvent = (target: EventTarget, type: string): Observable<Event> =>
 *   createSource((ctx) => {
 *     target.addEventListener(type, ctx.emit);
 *
 *     ctx.onCleanup(() => {
 *       target.removeEventListener(type, ctx.emit);
 *     });
 *   });
 * ```
 */
export function createSource<A>(
  setup: (ctx: SourceContext<A>) => void,
  options: Readonly<{ initialValue: A }>,
): InitializedObservable<A>;

export function createSource<A>(
  setup: (ctx: SourceContext<A>) => void,
): Observable<A>;

export function createSource<A>(
  setup: (ctx: SourceContext<A>) => void,
  options?: Readonly<{ initialValue: A }>,
): Observable<A> {
  return view(
    new CustomSourceClass(
      setup,
      options === undefined ? noValue : options.initialValue,
    ),
  );
}

/** What `createSource` gives the source it builds. */
export type SourceContext<A> = Readonly<{
  /**
   * Passes `value` on in an update of its own, after the one under way if any.
   * Every value given is passed on, in order; nothing once it is disposed or
   * has ended.
   */
  emit: (value: A) => void;
  /** Says it will emit no more: it settles once its last value is passed on. */
  end: () => void;
  /**
   * Registers `cleanup` to run when the source is disposed; at once if it is
   * disposed already.
   */
  onCleanup: (cleanup: (this: unknown) => void) => void;
}>;

class CustomSourceClass<A> extends AsyncSourceClass<A> {
  /** What `setup` made and registered; disposed with the source. */
  readonly #owner: Owner;

  constructor(setup: (ctx: SourceContext<A>) => void, initial: A | NoValue) {
    super(initial);

    // Not a child of the current owner: this source disposes it. What it makes
    // is as deep as this source's own floor, so that a switch above retires it
    // in time.
    this.#owner = ownerBelow(undefined, currentDepthFloor());

    try {
      this.#owner.run(() => {
        setup({
          emit: (value) => {
            if (!this.done) {
              this.deliver(value, false);
            }
          },
          end: () => {
            this.finish();
          },
          onCleanup: (cleanup) => {
            this.#owner.onCleanup(cleanup);
          },
        });
      });
    } catch (error) {
      // The cleanups it registered run, and the source is let go of.
      disposeReporting(this);

      throw error;
    }
  }

  protected override retireHeld(): void {
    retireOwner(this.#owner);
  }

  protected override teardown(): void {
    try {
      this.#owner.dispose();
    } finally {
      super.teardown();
    }
  }
}
