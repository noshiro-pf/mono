import { noValue, ObservableClass, view } from './observable-class.mjs';
import {
  afterNextRound,
  deferWrite,
  isDraining,
  isPending,
  type QueuedEmitter,
} from './scheduler.mjs';
import type { InitializedObservable, Observable } from './types.mjs';

/** A value that the application writes. */
export type State<A> = InitializedObservable<A> &
  Readonly<{
    /** Writes `value`; nothing happens when it equals the current one. */
    set: (value: A) => void;
    /**
     * Writes `fn(current)`. During propagation `fn` itself waits, so that it
     * reads the value the writes before it left.
     */
    update: (fn: (current: A) => A) => void;
  }>;

/** A stream of events: every `next` propagates, equal or not. */
export type Source<A> = Observable<A> &
  Readonly<{
    next: (value: A) => void;
  }>;

export type StateOptions<A> = Readonly<{
  /** Decides whether a write changes anything. Defaults to `Object.is`. */
  equals?: (a: A, b: A) => boolean;
}>;

/**
 * Creates a state holding `initial`.
 *
 * A write made while an update is propagating (inside a `map`, say) is applied
 * once that propagation ends; a write made by a subscriber starts the next
 * update. Neither interrupts the update under way.
 */
export const state = <A,>(initial: A, options?: StateOptions<A>): State<A> =>
  view(new StateClass(initial, options?.equals ?? Object.is));

/** Creates an event source, holding no value until its first `next`. */
export const source = <A,>(): Source<A> => view(new SourceClass<A>());

class StateClass<A> extends ObservableClass<A> {
  readonly #equals: (a: A, b: A) => boolean;

  constructor(initial: A, equals: (a: A, b: A) => boolean) {
    super(initial, 0);

    this.#equals = equals;
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

    const current = this.current;

    if (current !== noValue && this.#equals(current, value)) {
      return;
    }

    this.publish(value);
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
 * for its round (twice in a batch, or twice from effects) waits in `#mut_queue`
 * and is delivered in a round of its own, in order.
 */
class SourceClass<A> extends ObservableClass<A> {
  /** Values waiting for a round, each boxed: `A` may include `undefined`. */
  #mut_queue: { readonly value: A }[];

  /** The index in `#mut_queue` of the next value to deliver. */
  #mut_head: number;

  readonly #emitter: QueuedEmitter;

  constructor() {
    super(noValue, 0);

    this.#mut_queue = [];

    this.#mut_head = 0;

    this.#emitter = {
      emitNext: () => {
        this.#emitQueued();
      },
      drop: () => {
        this.#dropQueue();
      },
    };
  }

  #hasQueued(): boolean {
    return this.#mut_head < this.#mut_queue.length;
  }

  #emitQueued(): void {
    const head = this.#mut_queue[this.#mut_head];

    if (head === undefined || this.disposed) {
      this.#dropQueue();

      return;
    }

    this.#mut_head += 1;

    this.publish(head.value);

    if (this.#hasQueued()) {
      afterNextRound(this.#emitter);
    } else {
      this.#dropQueue();
    }
  }

  /** Empties the queue: delivered, or abandoned after an exception. */
  #dropQueue(): void {
    this.#mut_queue = [];

    this.#mut_head = 0;
  }

  next(value: A): void {
    if (isDraining()) {
      deferWrite(() => {
        this.next(value);
      });

      return;
    }

    if (this.disposed) {
      return;
    }

    if (this.#hasQueued()) {
      this.#mut_queue.push({ value });

      return;
    }

    if (isPending(this)) {
      this.#mut_queue.push({ value });

      afterNextRound(this.#emitter);

      return;
    }

    this.publish(value);
  }
}
