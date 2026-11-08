import { replaceEqualDeep, type ReplaceEqualDeepOptions } from 'ts-data-forge';
import { noValue, ObservableClass, view } from './observable-class.mjs';
import { deferWrite, isDraining } from './scheduler.mjs';
import type { InitializedObservable, Observable } from './types.mjs';

/** A value that the application writes. */
export type State<A> = InitializedObservable<A> &
  Readonly<{
    /** Writes `value`; nothing happens when it equals the current one. */
    set: (value: A) => void;
    /**
     * Writes `fn(current)`. Called inside an operator such as `map` or
     * `derive`, while an update is recomputing values, `fn` itself waits with
     * the write, so that it reads the value the writes before it left.
     */
    update: (fn: (current: A) => A) => void;
  }>;

/** A stream of events: every `next` propagates, equal or not. */
export type Source<A> = Observable<A> &
  Readonly<{
    next: (value: A) => void;
  }>;

export type StateOptions<A> = Readonly<{
  /**
   * Decides whether a write changes anything, given the value held first and
   * the next one second (after `keepEqualParts`). A write it finds equal passes
   * nothing on and keeps the value held, identity included. Defaults to
   * `Object.is`; pass `() => false` to pass on every write. What follows the
   * state still sees the writes made before one round as one, the value it
   * holds when the round starts: an event that must arrive however often it is
   * given goes through `source`.
   */
  equals?: (current: A, next: A) => boolean;
  /**
   * Whether a write keeps the parts of the value it did not change: every part
   * of the written value deeply equal to the same part of the current one is
   * replaced by that part (`replaceEqualDeep` of ts-data-forge), so a reader of
   * an unchanged part keeps its object, and a deeply equal value passes nothing
   * on. For a value written whole from a source that answers with a new object
   * each time. Array items are matched by index, or by `{ key }`. Defaults to
   * `false`.
   */
  keepEqualParts?: boolean | ReplaceEqualDeepOptions;
}>;

/**
 * Creates a state holding `initial`.
 *
 * A write made inside an operator such as `map` or `derive`, while an update is
 * recomputing values, is applied once the subscribers and bindings of the
 * update under way have run; a write made by a subscriber or a binding is
 * applied at once. Either propagates in the next update, and neither interrupts
 * the update under way.
 */
export const state = <A,>(initial: A, options?: StateOptions<A>): State<A> =>
  view(
    new StateClass(
      initial,
      options?.equals ?? Object.is,
      keepOptionsOf(options?.keepEqualParts ?? false),
    ),
  );

/** Creates an event source, holding no value until its first `next`. */
export const source = <A,>(): Source<A> => view(new SourceClass<A>());

class StateClass<A> extends ObservableClass<A> {
  readonly #equals: (current: A, next: A) => boolean;

  /** `replaceEqualDeep`'s options, or `false` to write values as given. */
  readonly #keep: ReplaceEqualDeepOptions | false;

  constructor(
    initial: A,
    equals: (current: A, next: A) => boolean,
    keep: ReplaceEqualDeepOptions | false,
  ) {
    super(initial, 0);

    this.#equals = equals;

    this.#keep = keep;
  }

  set(value: A): void {
    if (isDraining()) {
      deferWrite(() => {
        this.set(value);
      });

      return;
    }

    if (this.disposed) {
      return;
    }

    // A state always holds a value, so `value` does not throw.
    const current = this.value;

    const next =
      this.#keep === false
        ? value
        : replaceEqualDeep(current, value, this.#keep);

    if (!this.#equals(current, next)) {
      this.publish(next);
    }
  }

  update(fn: (current: A) => A): void {
    if (isDraining()) {
      deferWrite(() => {
        this.update(fn);
      });

      return;
    }

    // A state always holds a value, so `value` does not throw.
    this.set(fn(this.value));
  }
}

/**
 * Every `next` propagates. A value written while the previous one still waits
 * for its round (twice in a batch, or twice from effects) is delivered in a
 * round of its own, in order; see `publishEvent`.
 */
class SourceClass<A> extends ObservableClass<A> {
  constructor() {
    super(noValue, 0);
  }

  next(value: A): void {
    if (this.disposed) {
      return;
    }

    this.publishEvent(value);
  }
}

const keepOptionsOf = (
  keepEqualParts: boolean | ReplaceEqualDeepOptions,
): ReplaceEqualDeepOptions | false =>
  keepEqualParts === true ? ({} as const) : keepEqualParts;
