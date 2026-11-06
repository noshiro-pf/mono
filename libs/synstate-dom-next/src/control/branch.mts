import { Owner } from 'synstate-next';
import { MountedNodes, type Description } from '../jsx/index.mjs';

/**
 * Mounts `description` in a new owner under `parent`, appending its nodes to
 * `out`. The caller disposes the owner when the branch goes.
 */
export const mountOwned = (
  parent: Owner | undefined,
  description: Description | undefined,
  out: MountedNodes,
): Owner => {
  const owner = new Owner(parent);

  if (description !== undefined) {
    owner.run(() => {
      description.mount(out);
    });
  }

  return owner;
};

/** Mounts `description` in a new owner, and returns the owner and the nodes. */
export const mountDetached = (
  parent: Owner | undefined,
  description: Description | undefined,
): readonly [Owner, MountedNodes] => {
  const out = new MountedNodes();

  const owner = mountOwned(parent, description, out);

  return [owner, out];
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
