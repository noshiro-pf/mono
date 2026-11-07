import { batch, createRootOwner } from 'synstate-next';
import { removeRange } from './control/index.mjs';
import { MountedNodes, type Description } from './jsx/index.mjs';

/**
 * Mounts `app` into `container` and returns the function that unmounts it.
 *
 * `app` is called once, in a new root owner; everything created while it and
 * the description it returns are mounted belongs to that owner, and unmounting
 * disposes it and removes the nodes.
 *
 * Mounting is one batch: a write made while mounting propagates once the nodes
 * are in `container`, so nothing has to wait for an element to be attached. If
 * mounting throws, what was mounted is disposed and removed before the error is
 * rethrown.
 */
export const render = (
  app: () => Description,
  container: Element,
): (() => void) => {
  const owner = createRootOwner();

  const out = new MountedNodes();

  // Everything between the first and the last node mounted, which takes in what
  // an `If` or a `For` at the top inserted since: their markers are the first
  // and last nodes they mount, and stay.
  const unmount = (): void => {
    owner.dispose();

    const first = out.list.at(0);

    const last = out.list.at(-1);

    if (first !== undefined && last !== undefined) {
      removeRange(first, last);
    }
  };

  try {
    batch(() => {
      owner.run(() => {
        app().mount(out);
      });

      out.appendTo(container);
    });
  } catch (error) {
    unmount();

    throw error;
  }

  return unmount;
};
