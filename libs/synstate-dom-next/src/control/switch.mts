import { isObservable, type Owner } from 'synstate-next';
import {
  EffectClass,
  noValue,
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

  #mut_key: K;

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

    this.#mut_key = keyOf(currentOf(value));

    this.#mut_owner = undefined;
  }

  mountInto(out: MountedNodes): void {
    out.push(this.#start);

    const key = this.#mut_key;

    const current = currentOf(this.source);

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

    this.#mut_owner?.dispose();

    const first = this.#start.nextSibling;

    const last = this.#end.previousSibling;

    if (first !== null && last !== null && first !== this.#end) {
      removeRange(first, last);
    }

    const [owner, nodes] = this.#site.mountDetached(() =>
      this.#branch(key, current),
    );

    this.#mut_owner = owner;

    nodes.insertBefore(this.#end);
  }
}

/** The value of a `Bindable`'s observable, which always holds one. */
const currentOf = <V,>(node: ObservableClass<V>): V => {
  const v = node.current;

  if (v === noValue) {
    throw new Error('synstate-dom-next: a bound observable holds no value.');
  }

  return v;
};
