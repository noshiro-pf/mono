import { onScopeDispose } from 'synstate';
import {
  appendTo,
  holdsSvgContent,
  mountThenInsert,
  mountUnder,
} from '../internal/index.mjs';
import { mountChild, mountable, type Child, type JSX } from '../jsx/index.mjs';

/**
 * Mounts `children` into `target` (`document.body` when omitted) rather than
 * where it is written (SPEC.md 8.6): for a modal, a tooltip or a toast that has
 * to escape an ancestor's `overflow: hidden` or `z-index`.
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
    const into = target ?? document.body;

    // Where the children go, not where `Portal` is written.
    const nodes = mountUnder(holdsSvgContent(into), () =>
      mountThenInsert(mountChild, children, appendTo, into),
    );

    onScopeDispose(() => {
      for (const node of nodes) {
        node.remove();
      }
    });

    return [];
  });
