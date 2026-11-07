import { getOwner, isObservable, type Owner } from 'synstate-next';
import {
  EffectClass,
  toNode,
  type ObservableClass,
} from 'synstate-next/internal';
import type { Bindable } from '../constant.mjs';
import {
  ControlDescription,
  type Description,
  type MountedNodes,
} from '../jsx/index.mjs';
import { mountDetached, mountOwned, removeRange } from './branch.mjs';

/**
 * Mounts `then` while `cond` is `true` and `else` while it is `false`; nothing
 * for an omitted `else`.
 *
 * Both branches are descriptions, so only the one chosen is mounted. A branch
 * is rebuilt only when `cond` flips, after the update that flipped it has
 * settled: the previous branch's owner is disposed and its nodes removed. A
 * constant `cond` mounts one branch once.
 */
export const If = ({
  cond,
  then,
  else: elseBranch,
}: Readonly<{
  cond: Bindable<boolean>;
  then: Description;
  else?: Description;
}>): Description =>
  new ControlDescription((out) => {
    if (!isObservable(cond)) {
      (cond ? then : elseBranch)?.mount(out);

      return;
    }

    const binding = new IfBinding(toNode(cond), then, elseBranch);

    binding.mountInto(out);
  });

class IfBinding extends EffectClass<boolean> {
  /** The branch's nodes are between `#start` and `#end`. */
  readonly #start: Comment;

  readonly #end: Comment;

  readonly #then: Description;

  readonly #else: Description | undefined;

  readonly #parent: Owner | undefined;

  #mut_shown: boolean;

  #mut_owner: Owner | undefined;

  constructor(
    cond: ObservableClass<boolean>,
    then: Description,
    elseBranch: Description | undefined,
  ) {
    super(cond);

    this.#start = document.createComment('');

    this.#end = document.createComment('');

    this.#then = then;

    this.#else = elseBranch;

    this.#parent = getOwner();

    this.#mut_shown = cond.current === true;

    this.#mut_owner = undefined;
  }

  #branch(): Description | undefined {
    return this.#mut_shown ? this.#then : this.#else;
  }

  mountInto(out: MountedNodes): void {
    out.push(this.#start);

    this.#mut_owner = mountOwned(this.#parent, this.#branch(), out);

    out.push(this.#end);
  }

  run(): void {
    const shown = this.source.current === true;

    if (shown === this.#mut_shown) {
      return;
    }

    this.#mut_shown = shown;

    this.#mut_owner?.dispose();

    const first = this.#start.nextSibling;

    const last = this.#end.previousSibling;

    if (first !== null && last !== null && first !== this.#end) {
      removeRange(first, last);
    }

    const [owner, nodes] = mountDetached(this.#parent, this.#branch());

    this.#mut_owner = owner;

    nodes.insertBefore(this.#end);
  }
}
