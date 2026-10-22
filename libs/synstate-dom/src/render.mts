import { createScope } from 'synstate';
import { type JSX, toNodes } from './jsx/index.mjs';

/**
 * Mounts `app` into `container` and returns the function that unmounts it
 * (SPEC.md 6.5).
 *
 * `app` is called once, inside a new root scope; everything created while it
 * and the description it returns are mounted belongs to that scope, and
 * unmounting disposes it and removes the nodes.
 *
 * `render(App, el)` rather than `render(<App />, el)`: taking the component
 * makes it plain that it is evaluated here.
 */
export const render = (
  app: () => JSX.Element,
  container: Element,
): (() => void) => {
  const root = createScope(undefined);

  const nodes = root.run(() => toNodes(app().mount()));

  container.append(...nodes);

  return () => {
    root.dispose();

    for (const node of nodes) {
      node.remove();
    }
  };
};
