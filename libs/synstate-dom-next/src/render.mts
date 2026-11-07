import { batch, createRootOwner } from 'synstate-next';
import { removeMounted } from './control/index.mjs';
import {
  MountedNodes,
  mountInNamespace,
  namespaceInside,
  type Description,
} from './jsx/index.mjs';

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

  const unmount = (): void => {
    owner.dispose();

    removeMounted(out);
  };

  try {
    batch(() => {
      mountInNamespace(namespaceInside(container), () => {
        owner.run(() => {
          app().mount(out);
        });
      });

      out.appendTo(container);
    });
  } catch (error) {
    unmount();

    throw error;
  }

  return unmount;
};
