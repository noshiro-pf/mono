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
import {
  ControlDescription,
  type Description,
  type MountedNodes,
} from '../jsx/index.mjs';
import { MountSite, removeRange } from './branch.mjs';

/**
 * Mounts `children(key, value)` for the key of `value`, and replaces it when the
 * key changes: after the update that changed it has settled, the previous
 * branch's owner is disposed and its nodes removed. While the key stays, the
 * branch stays; one that follows the value does so through what it makes from
 * it (`toObservable(value)`). `children` returns `undefined` for a key with
 * nothing to show. A constant `value` mounts one branch once. `If`,
 * `MatchOptional` and `MatchResult` are this.
 *
 * Keys are compared with `Object.is`, so a key is a primitive (or an object
 * kept as it is): a key made afresh for each value (`[p.kind, p.id]`) mounts
 * the branch again on every value.
 *
 * No node made in a branch computes from a value whose key rules it out: `key`
 * is called in the drain, above the branch's nodes, and a branch that goes is
 * retired there (see `DrainCheck`). An observable the branch is given rather
 * than makes (one created where the description is written) is not the
 * branch's: it computes from every value, mounted or not.
 *
 * A `key` that throws in an update drops the branch and leaves the switch empty
 * until the next value; the exception is thrown as the switch's own. A cleanup
 * of the branch that goes that throws does not stop the switch: the exception
 * is thrown once the new branch is in place. A branch that throws while
 * mounting leaves the switch empty, and the next value mounts its branch,
 * whatever its key. A `key` or branch that throws while the switch first mounts
 * fails that mount.
 */
export const Switch = <V, K>({
  value,
  key,
  children,
}: Readonly<{
  value: Bindable<V>;
  key: (current: V) => K;
  children: (currentKey: K, current: V) => Description | undefined;
}>): Description =>
  new ControlDescription((out) => {
    if (!isObservable(value)) {
      // The constant's own value: a `Constant<V>` is `V` at run time.
      children(key(value), value)?.mount(out);

      return;
    }

    const binding = new SwitchBinding(toNode(value), key, children);

    binding.mountInto(out);
  });

class SwitchBinding<V, K> extends EffectClass<V> {
  /** The branch's nodes are between `#start` and `#end`. */
  readonly #start: Comment;

  readonly #end: Comment;

  readonly #keyOf: (current: V) => K;

  readonly #branch: (key: K, current: V) => Description | undefined;

  readonly #site: MountSite;

  /** `noKey` before the first mount, and after a branch threw while mounting. */
  #mut_key: K | typeof noKey;

  /**
   * The value the drain took the key of, and the key, which `run` does not
   * compute again; the key is `noKey` when the drain took none. Two fields
   * rather than an object, so that an update allocates nothing.
   */
  #mut_checkedValue: V | undefined;

  #mut_checkedKey: K | typeof noKey;

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

    this.#mut_checkedValue = undefined;

    this.#mut_checkedKey = noKey;

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
    this.#mut_checkedKey = noKey;

    if (this.#mut_owner === undefined || this.#mut_retired) {
      return;
    }

    const current = currentOf(this.source);

    const key = this.#keyOf(current);

    this.#mut_checkedValue = current;

    this.#mut_checkedKey = key;

    if (!Object.is(key, this.#mut_key)) {
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

    // A throw fails the mount, and whoever mounted the switch (`render`, a
    // branch, a row, `mountChild`) disposes the owner it is in, the switch with
    // it.
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

    const checkedKey = this.#mut_checkedKey;

    const key =
      checkedKey !== noKey && Object.is(this.#mut_checkedValue, current)
        ? checkedKey
        : this.#keyOf(current);

    this.#mut_checkedValue = undefined;

    this.#mut_checkedKey = noKey;

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
