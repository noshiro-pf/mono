import { getOwner, Owner } from 'synstate-next';
import {
  currentNamespace,
  MountedNodes,
  mountInNamespace,
  type Description,
  type Namespace,
} from '../jsx/index.mjs';

/**
 * Where a binding mounts what it mounts later (an `If`'s branch, a `For`'s
 * rows): the owner and the namespace current when the binding was made. They
 * are taken together, so that a binding cannot keep one and lose the other.
 */
export class MountSite {
  readonly #parent: Owner | undefined;

  readonly #namespace: Namespace;

  constructor() {
    this.#parent = getOwner();

    this.#namespace = currentNamespace();
  }

  /** A new owner under the site's owner. */
  newOwner(): Owner {
    return new Owner(this.#parent);
  }

  /**
   * Runs `mount` in `owner`, made by `newOwner`, and in the site's namespace.
   * The caller disposes the owner when what was mounted goes.
   */
  run<R>(owner: Owner, mount: () => R): R {
    return this.#namespace === currentNamespace()
      ? owner.run(mount)
      : mountInNamespace(this.#namespace, () => owner.run(mount));
  }

  /**
   * Makes a description with `make` and mounts it, both in a new owner by
   * `run`, appending the nodes to `out`: what `make` creates (the observables a
   * `MatchOptional` hands its branch) goes with the branch. The caller disposes
   * the owner when the branch goes.
   */
  mount(make: () => Description | undefined, out: MountedNodes): Owner {
    const owner = this.newOwner();

    this.run(owner, () => {
      make()?.mount(out);
    });

    return owner;
  }

  /** As `mount`, and returns the owner and the nodes. */
  mountDetached(
    make: () => Description | undefined,
  ): readonly [Owner, MountedNodes] {
    const out = new MountedNodes();

    return [this.mount(make, out), out];
  }
}

/**
 * Removes the nodes a mount appended to `out`, and everything between the first
 * and the last of them, which takes in what an `If` or a `For` among them
 * inserted since: their markers are the first and last nodes they mount, and
 * stay.
 */
export const removeMounted = (out: MountedNodes): void => {
  const first = out.list.at(0);

  const last = out.list.at(-1);

  if (first !== undefined && last !== undefined) {
    removeRange(first, last);
  }
};

/** Removes the nodes from `first` to `last`, both included. */
export const removeRange = (first: ChildNode, last: ChildNode): void => {
  let mut_node: ChildNode | null = first;

  while (mut_node !== null) {
    const next: ChildNode | null =
      mut_node === last ? null : mut_node.nextSibling;

    mut_node.remove();

    mut_node = next;
  }
};
