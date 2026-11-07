import { isObservable, type Owner } from 'synstate-next';
import {
  DrainCheck,
  EffectClass,
  disposeEach,
  keepFirst,
  keepFirstOf,
  noValue,
  retireOwner,
  throwFailure,
  toNode,
  type Failure,
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
 * No node made in a branch computes from a value whose key rules it out: the
 * key is checked in the drain, above the branch's nodes, and a branch that goes
 * is retired there (see `DrainCheck`). An observable the branch is given rather
 * than makes (one created where the description is written) is not the
 * branch's: it computes from every value, mounted or not.
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

  /** Whether `#mut_owner` was retired; it is replaced however the key ends. */
  #mut_retired: boolean;

  readonly #check: DrainCheck;

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

    this.#mut_retired = false;

    this.#check = new DrainCheck(
      value,
      () => {
        this.#retireIfRuledOut();
      },
      () => {
        this.#retireBranch();
      },
    );
  }

  /**
   * Called in the drain when the value emits: retires the branch if the new
   * value's key is not the branch's, before the drain reaches the branch.
   */
  #retireIfRuledOut(): void {
    if (
      this.#mut_owner !== undefined &&
      !this.#mut_retired &&
      !Object.is(this.#keyOf(currentOf(this.source)), this.#mut_key)
    ) {
      this.#retireBranch();
    }
  }

  /** Retires the mounted branch, if any; `run` replaces it. */
  #retireBranch(): void {
    const owner = this.#mut_owner;

    if (owner === undefined || this.#mut_retired) {
      return;
    }

    this.#mut_retired = true;

    retireOwner(owner);
  }

  /**
   * Removes the branch's nodes, then disposes its owner, as a `For` row goes.
   * Returns what a cleanup threw; see `disposeEach`.
   */
  #drop(): Failure {
    const first = this.#start.nextSibling;

    const last = this.#end.previousSibling;

    if (first !== null && last !== null && first !== this.#end) {
      removeRange(first, last);
    }

    const failure = disposeEach([this.#mut_owner]);

    this.#mut_owner = undefined;

    this.#mut_retired = false;

    return failure;
  }

  mountInto(out: MountedNodes): void {
    out.push(this.#start);

    const current = currentOf(this.source);

    const key = this.#keyOf(current);

    this.#mut_key = key;

    this.#mut_owner = this.#site.mount(
      () => this.#branch(key, current),
      out,
      this.#check.branchDepth,
    );

    out.push(this.#end);
  }

  run(): void {
    const keyFailure = this.#check.takeFailure();

    if (keyFailure !== undefined) {
      // `keyOf` threw in the drain, which retired the branch: the branch goes,
      // the switch is left empty, and the exception is this effect's.
      this.#mut_key = noKey;

      throwFailure(keepFirstOf(keyFailure, this.#drop()));

      return;
    }

    const current = currentOf(this.source);

    const key = this.#keyOf(current);

    // A retired branch is replaced even when the key came back to its own: its
    // nodes no longer follow anything.
    if (Object.is(key, this.#mut_key) && !this.#mut_retired) {
      return;
    }

    this.#mut_key = key;

    // A cleanup of the branch that goes that throws does not stop the switch:
    // the exception is thrown once the new branch is in place.
    const failure = this.#drop();

    try {
      const [owner, nodes] = this.#site.mountDetached(
        () => this.#branch(key, current),
        this.#check.branchDepth,
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
