import {
  DerivedClass,
  isPending,
  noValue,
  toNode,
  view,
  type Observable,
  type ObservableClass,
} from '../core/index.mjs';
import type { DerivedOf, ValuesOf } from './derive.mjs';

/**
 * Emits the `n`-th values of all `parents` as a tuple, once each of them has
 * emitted its `n`-th. The values the parents hold at the start count as their
 * first. Values wait in a queue per parent until the slowest catches up.
 */
export const zip = <const P extends readonly Observable<unknown>[]>(
  parents: P,
): DerivedOf<P, ValuesOf<P>> =>
  // The type follows the parents'; the class is the same either way.
  view(new ZipClass(parents.map(toNode)));

/** The values of one parent waiting to be zipped. */
// transformer-ignore-next-line convert-to-readonly
type Queue = {
  values: unknown[];
  /** The index in `values` of the next value to zip. */
  head: number;
};

class ZipClass extends DerivedClass<readonly unknown[]> {
  readonly #queues: readonly Queue[];

  constructor(parents: readonly ObservableClass<unknown>[]) {
    super(parents, noValue);

    this.#queues = parents.map((parent): Queue => ({
      values: parent.current === noValue ? [] : [parent.current],
      head: 0,
    }));

    this.current = this.#takeRow() ?? noValue;
  }

  /** The next value of every queue, taken out, or `undefined` if one is empty. */
  #takeRow(): readonly unknown[] | undefined {
    const queues = this.#queues;

    for (const queue of queues) {
      if (queue.head >= queue.values.length) {
        return undefined;
      }
    }

    const mut_row: unknown[] = [];

    for (const mut_queue of queues) {
      mut_row.push(mut_queue.values[mut_queue.head]);

      mut_queue.head += 1;

      // A parent that stays ahead never empties its queue: drop the values
      // taken once they are half of it. An emptied queue keeps its array.
      if (mut_queue.head * 2 < mut_queue.values.length) {
        continue;
      }

      mut_queue.values.splice(0, mut_queue.head);

      mut_queue.head = 0;
    }

    return mut_row;
  }

  /**
   * Settled also once a settled parent has nothing waiting: no row can be
   * completed without it.
   */
  override get settled(): boolean {
    if (super.settled) {
      return true;
    }

    if (isPending(this)) {
      return false;
    }

    for (const [i, parent] of this.parents.entries()) {
      const queue = this.#queues[i];

      if (
        queue !== undefined &&
        queue.head >= queue.values.length &&
        parent.settled
      ) {
        return true;
      }
    }

    return false;
  }

  override recompute(): boolean {
    for (const [i, parent] of this.parents.entries()) {
      const v = parent.current;

      if (v !== noValue && this.emittedNow(parent)) {
        this.#queues[i]?.values.push(v);
      }
    }

    const row = this.#takeRow();

    if (row === undefined) {
      return false;
    }

    this.current = row;

    return true;
  }
}
