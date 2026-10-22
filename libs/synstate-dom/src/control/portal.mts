import { onScopeDispose } from 'synstate';
import { mountChild, mountable, type Child, type JSX } from '../jsx/index.mjs';

/**
 * Mounts `children` into `target` (`document.body` when omitted) rather than
 * where it is written (SPEC.md 8.6): for a modal, a tooltip or a toast that
 * has to escape an ancestor's `overflow: hidden` or `z-index`.
 *
 * The children belong to the scope where `Portal` is written, so closing the
 * enclosing `If` branch removes them too. Nothing is left in the place it is
 * written.
 */
export const Portal = ({
  target,
  children,
}: Readonly<{
  target?: Element;
  children: Child;
}>): JSX.Element =>
  mountable(() => {
    const nodes = mountChild(children);

    (target ?? document.body).append(...nodes);

    onScopeDispose(() => {
      for (const node of nodes) {
        node.remove();
      }
    });

    return [];
  });
