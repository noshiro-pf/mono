import {
  getOwner,
  state,
  type InitializedObservable,
  type State,
} from 'synstate-next';
import {
  EffectClass,
  noValue,
  toNode,
  type ObservableClass,
} from 'synstate-next/internal';

/** What {@link selector} returns. */
export type Selector<K> = Readonly<{
  /** An observable that is `true` while the source holds `key`. */
  is: (key: K) => InitializedObservable<boolean>;
}>;

/**
 * Selection in a list: `selector(selected).is(id)` is `true` while `selected`
 * holds `id`. When `selected` changes, only the observables of the old and the
 * new key are written, however many keys are watched, where a
 * `selected.pipe(map((s) => s === id))` per row recomputes every row.
 *
 * The writes start an update of their own, after the one that changed
 * `selected`. An `is` observable belongs to the owner it was made in, and is
 * forgotten when that owner is disposed.
 */
export const selector = <K,>(source: InitializedObservable<K>): Selector<K> => {
  const binding = new SelectorBinding(toNode(source));

  return {
    is: (key) => binding.is(key),
  };
};

class SelectorBinding<K> extends EffectClass<K> {
  readonly #mut_watchers: Map<K, Set<State<boolean>>>;

  #mut_selected: K | typeof noValue;

  constructor(source: ObservableClass<K>) {
    super(source);

    // transformer-ignore-next-line convert-to-readonly
    this.#mut_watchers = new Map<K, Set<State<boolean>>>();

    this.#mut_selected = source.current;
  }

  is(key: K): InitializedObservable<boolean> {
    const watcher = state(Object.is(key, this.#mut_selected));

    const watchers = this.#mut_watchers.get(key);

    if (watchers === undefined) {
      this.#mut_watchers.set(key, new Set<State<boolean>>([watcher]));
    } else {
      watchers.add(watcher);
    }

    getOwner()?.onCleanup(() => {
      const set = this.#mut_watchers.get(key);

      set?.delete(watcher);

      if (set?.size === 0) {
        this.#mut_watchers.delete(key);
      }
    });

    return watcher;
  }

  run(): void {
    const next = this.source.current;

    const previous = this.#mut_selected;

    if (Object.is(next, previous)) {
      return;
    }

    this.#mut_selected = next;

    if (previous !== noValue) {
      for (const watcher of this.#mut_watchers.get(previous) ?? []) {
        watcher.set(false);
      }
    }

    if (next !== noValue) {
      for (const watcher of this.#mut_watchers.get(next) ?? []) {
        watcher.set(true);
      }
    }
  }
}
