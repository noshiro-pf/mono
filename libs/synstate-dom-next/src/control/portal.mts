import { onCleanup } from 'synstate-next';
import {
  ControlDescription,
  MountedNodes,
  mountChild,
  mountInNamespace,
  namespaceInside,
  type Child,
  type Description,
} from '../jsx/index.mjs';
import { removeMounted } from './branch.mjs';

/**
 * Mounts `children` into `target` (`document.body` by default) instead of where
 * the `Portal` stands, in the current owner and in the namespace of `target`,
 * and removes them when it is disposed. The `Portal` itself mounts no node in
 * place.
 */
export const Portal = ({
  target,
  children,
}: Readonly<{
  target?: Element;
  children: Child;
}>): Description =>
  new ControlDescription(() => {
    const parent = target ?? document.body;

    const out = new MountedNodes();

    mountInNamespace(namespaceInside(parent), () => {
      mountChild(children, out);
    });

    out.appendTo(parent);

    onCleanup(() => {
      removeMounted(out);
    });
  });
