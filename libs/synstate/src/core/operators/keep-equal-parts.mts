// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import {
  Optional,
  replaceEqualDeep,
  type ReplaceEqualDeepOptions,
} from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import type {
  KeepEqualPartsOperatorObservable,
  KeepInitialValueOperator,
  Observable,
  UpdateToken,
} from '../types/index.mjs';

/**
 * Passes on each value with every part deeply equal to the same part of the
 * value passed on before replaced by that part, and skips a value deeply
 * equal to it altogether (structural sharing). A reader of a part that did
 * not change keeps the object it has, so `skipIfNoChange()` with `Object.is`
 * stops it. Superset of `skipIfNoChange(fastDeepEqual)`.
 *
 * **Prefer keeping references where the value is written** — compare before
 * `setState`, and skip it when nothing changed — so that nothing downstream
 * has anything to undo. The `keepEqualParts` option of `createState` and
 * `createReducer` does it for a state written whole, and `replaceEqualDeep`
 * of ts-data-forge does it for any other write. This operator lets every
 * update that changes nothing reach the source and everything up to it, and
 * walks the whole value again on each one; reach for it when the source is
 * not yours to change (a stream that arrives whole from outside).
 *
 * Array items are matched by index; pass `{ key }` to match them by key, an
 * item for which `key` returns `undefined` being matched by index. Only plain
 * objects and arrays are walked into; a `Map`, a `Set`, a `Date` or a class
 * instance is compared and kept whole. The values must not be changed after
 * they are passed on, because the parts kept are shared by later values.
 *
 * @template A - The type of values from the source
 * @param options - `key`, to match array items by key rather than by index
 * @returns An operator that keeps the parts that did not change
 *
 * @example
 * ```ts
 * type Board = DeepReadonly<{
 *   title: string;
 *   cards: { id: number; text: string }[];
 * }>;
 *
 * // A stream that arrives whole from outside (a WebSocket, say), each
 * // message a new object even when nothing changed. A state you write
 * // yourself takes `createState(initial, { keepEqualParts: true })`
 * // instead.
 * const message$ = source<Board>();
 *
 * const board$ = message$.pipe(keepEqualParts());
 *
 * const firstCard$ = board$.pipe(map((board) => board.cards[0]));
 *
 * const boardHistory: Board[] = [];
 *
 * board$.subscribe((board) => {
 *   boardHistory.push(board);
 * });
 *
 * const firstCardHistory: unknown[] = [];
 *
 * firstCard$.subscribe((card) => {
 *   firstCardHistory.push(card);
 * });
 *
 * message$.next({ title: 'todo', cards: [{ id: 1, text: 'a' }] });
 *
 * // Equal to the last one: nothing is passed on.
 * message$.next({ title: 'todo', cards: [{ id: 1, text: 'a' }] });
 *
 * assert.strictEqual(boardHistory.length, 1);
 *
 * // A card added: a new board, but the first card is the one passed on
 * // before, so `firstCard$` is not told of it.
 * message$.next({
 *   title: 'todo',
 *   cards: [
 *     { id: 1, text: 'a' },
 *     { id: 2, text: 'b' },
 *   ],
 * });
 *
 * assert.strictEqual(boardHistory.length, 2);
 *
 * assert.strictEqual(boardHistory[1]?.cards[0], boardHistory[0]?.cards[0]);
 *
 * assert.strictEqual(firstCardHistory.length, 1);
 * ```
 */
export const keepEqualParts = <A,>(
  options?: ReplaceEqualDeepOptions,
): KeepInitialValueOperator<A, A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    new KeepEqualPartsObservableClass(
      parentObservable,
      options,
    )) as KeepInitialValueOperator<A, A>;

class KeepEqualPartsObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements KeepEqualPartsOperatorObservable<A>
{
  readonly #options: ReplaceEqualDeepOptions | undefined;
  #mut_previousValue: Optional<A>;

  constructor(
    parentObservable: Observable<A>,
    options: ReplaceEqualDeepOptions | undefined,
  ) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_previousValue = parentObservable.getSnapshot();

    this.#options = options;

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    const prev = this.#mut_previousValue;

    if (Optional.isNone(prev)) {
      this.#mut_previousValue = sn;

      this.setNext(sn.value, updateToken);

      return;
    }

    const kept = replaceEqualDeep(prev.value, sn.value, this.#options);

    if (Object.is(kept, prev.value)) {
      return;
    }

    // Updated before `setNext`, which can lead back here.
    this.#mut_previousValue = Object.is(kept, sn.value)
      ? sn
      : Optional.some(kept);

    this.setNext(kept, updateToken);
  }
}
