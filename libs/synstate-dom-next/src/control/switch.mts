import { isObservable, type Owner } from 'synstate-next';
import {
  EffectClass,
  disposeEach,
  keepFirst,
  noValue,
  throwFailure,
  toNode,
  type ObservableClass,
} from 'synstate-next/internal';
import type { Bindable } from '../constant.mjs';
import type { Description, MountedNodes } from '../jsx/index.mjs';
import { MountSite, removeRange } from './branch.mjs';

/**
 * Mounts the branch `branch(key, current)` for the key of `value`, appending
 * its nodes to `out`, and switches to another when the key changes: after the
 * update that changed it has settled, the previous branch's owner is disposed
 * and its nodes removed. While the key stays, the branch stays and follows
 * `value` through what it was given. A constant `value` mounts one branch once.
 * `If`, `MatchOptional` and `MatchResult` are this.
 *
 * A cleanup of the branch that goes that throws does not stop the switch: the
 * exception is thrown once the new branch is in place. A branch that throws
 * while mounting leaves the switch empty, and the next value mounts its branch,
 * whatever its key.
 */
export const mountSwitch = <V, K>(
  value: Bindable<V>,
  keyOf: (current: V) => K,
  branch: (key: K, current: V) => Description | undefined,
  out: MountedNodes,
): void => {
  if (!isObservable(value)) {
    // The constant's own value: a `Constant<V>` is `V` at run time.
    branch(keyOf(value), value)?.mount(out);

    return;
  }

  const binding = new SwitchBinding(toNode(value), keyOf, branch);

  binding.mountInto(out);
};

class SwitchBinding<V, K> extends EffectClass<V> {
  /** The branch's nodes are between `#start` and `#end`. */
  readonly #start: Comment;

  readonly #end: Comment;

  readonly #keyOf: (current: V) => K;

  readonly #branch: (key: K, current: V) => Description | undefined;

  readonly #site: MountSite;

  /** `noKey` before the first mount, and after a branch threw while mounting. */
  #mut_key: K | typeof noKey;

  #mut_owner: Owner | undefined;

  constructor(
    value: ObservableClass<V>,
    keyOf: (current: V) => K,
    branch: (key: K, current: V) => Description | undefined,
  ) {
    super(value);

    this.#start = document.createComment('');

    this.#end = document.createComment('');

    this.#keyOf = keyOf;

    this.#branch = branch;

    this.#site = new MountSite();

    this.#mut_key = noKey;

    this.#mut_owner = undefined;
  }

  mountInto(out: MountedNodes): void {
    out.push(this.#start);

    const current = currentOf(this.source);

    const key = this.#keyOf(current);

    this.#mut_key = key;

    this.#mut_owner = this.#site.mount(() => this.#branch(key, current), out);

    out.push(this.#end);
  }

  run(): void {
    const current = currentOf(this.source);

    const key = this.#keyOf(current);

    if (Object.is(key, this.#mut_key)) {
      return;
    }

    this.#mut_key = key;

    const first = this.#start.nextSibling;

    const last = this.#end.previousSibling;

    // The branch's nodes go before its cleanups run, as a `For` row's do.
    if (first !== null && last !== null && first !== this.#end) {
      removeRange(first, last);
    }

    // A cleanup of the branch that goes that throws does not stop the switch:
    // the exception is thrown once the new branch is in place.
    const failure = disposeEach([this.#mut_owner]);

    this.#mut_owner = undefined;

    try {
      const [owner, nodes] = this.#site.mountDetached(() =>
        this.#branch(key, current),
      );

      this.#mut_owner = owner;

      nodes.insertBefore(this.#end);
    } catch (error) {
      // A branch that throws while mounting leaves the switch empty, on no key,
      // so that the next value mounts its branch even when its key is the same.
      this.#mut_key = noKey;

      throwFailure(keepFirst(failure, error));
    }

    throwFailure(failure);
  }
}

/** The key of a switch that holds no branch: equal to no key. */
const noKey: unique symbol = Symbol('noKey');

/** The value of a `Bindable`'s observable, which always holds one. */
const currentOf = <V,>(node: ObservableClass<V>): V => {
  const v = node.current;

  if (v === noValue) {
    throw new Error('synstate-dom-next: a bound observable holds no value.');
  }

  return v;
};
