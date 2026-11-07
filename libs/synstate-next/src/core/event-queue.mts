import {
  afterNextRound,
  awaitsEffects,
  deferEmission,
  isDraining,
  isPending,
  type DerivedNode,
  type QueuedEmitter,
} from './scheduler.mjs';

/**
 * Whether `node`, whose emissions are events, can publish a value now: the
 * graph is not draining, and no emission of the node waits for a round or for
 * the round's effects to read it. Otherwise the value goes to an `EventQueue`.
 */
export const canPublishNow = (node: DerivedNode): boolean =>
  !isDraining() && !isPending(node) && !awaitsEffects(node);

/**
 * Delivers every value pushed to it, each in a round of its own and in order,
 * for a node whose emissions are events, where a state would keep only the
 * last. A value waits here while the graph drains, while the node's previous
 * value waits for its round, or while the round's effects have yet to read it.
 * Made on the first value that has to wait (see `canPublishNow`), so a node
 * that never queues pays nothing. Used by `source`, `mergeMap` and the
 * asynchronous sources.
 */
export class EventQueue<A> implements QueuedEmitter {
  readonly #node: DerivedNode;

  readonly #publish: (value: A) => void;

  /** Values waiting for a round, each boxed: `A` may include `undefined`. */
  #mut_queue: { readonly value: A }[];

  /** The index in `#mut_queue` of the next value to deliver. */
  #mut_head: number;

  constructor(node: DerivedNode, publish: (value: A) => void) {
    this.#node = node;

    this.#publish = publish;

    this.#mut_queue = [];

    this.#mut_head = 0;
  }

  /** Whether a value waits to be delivered. */
  get waiting(): boolean {
    return this.#mut_head < this.#mut_queue.length;
  }

  /** Publishes `value` now, or queues it behind what has to come first. */
  push(value: A): void {
    if (this.waiting) {
      this.#mut_queue.push({ value });

      return;
    }

    if (canPublishNow(this.#node)) {
      this.#publish(value);

      return;
    }

    this.#mut_queue.push({ value });

    if (isPending(this.#node)) {
      afterNextRound(this);
    } else {
      // Draining, or the round's effects have yet to read the previous value:
      // delivered as a write deferred now would be, in order with those.
      deferEmission(this);
    }
  }

  /** Publishes the value at the head, unless the node still waits for a round. */
  emitNext(): void {
    const head = this.#mut_queue[this.#mut_head];

    if (head === undefined || this.#node.disposed) {
      this.drop();

      return;
    }

    if (isPending(this.#node)) {
      afterNextRound(this);

      return;
    }

    this.#mut_head += 1;

    this.#publish(head.value);

    if (this.waiting) {
      afterNextRound(this);
    } else {
      this.drop();
    }
  }

  /** Empties the queue: delivered, abandoned after an exception, or disposed. */
  drop(): void {
    this.#mut_queue = [];

    this.#mut_head = 0;
  }
}
