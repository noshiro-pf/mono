import { createScope } from 'synstate';
import {
  appendTo,
  holdsSvgContent,
  mountThenInsert,
  mountUnder,
} from './internal/index.mjs';
import { type JSX, toNodes } from './jsx/index.mjs';

/**
 * Mounts `app` into `container` and returns the function that unmounts it
 * (SPEC.md 6.5).
 *
 * `app` is called once, inside a new root scope; everything created while it
 * and the description it returns are mounted belongs to that scope, and
 * unmounting disposes it and removes the nodes. If mounting throws, what was
 * mounted is disposed and removed before the error is rethrown.
 *
 * `render(App, el)` rather than `render(<App />, el)`: taking the component
 * makes it plain that it is evaluated here.
 */
export const render = (
  app: () => JSX.Element,
  container: Element,
): (() => void) => {
  const root = createScope(undefined);

  const mut_inserted: { nodes: readonly ChildNode[] } = { nodes: [] };

  const unmount = (): void => {
    root.dispose();

    for (const node of mut_inserted.nodes) {
      node.remove();
    }
  };

  try {
    root.run(() =>
      mountUnder(holdsSvgContent(container), () =>
        mountThenInsert(
          mountApp,
          app,
          (into: Element, nodes: readonly ChildNode[]) => {
            mut_inserted.nodes = nodes;

            appendTo(into, nodes);
          },
          container,
        ),
      ),
    );
  } catch (error) {
    // An update applied after the app was appended can throw; take back what
    // was mounted rather than leave it in `container` with no way to unmount.
    unmount();

    throw error;
  }

  return unmount;
};

const mountApp = (app: () => JSX.Element): readonly ChildNode[] =>
  toNodes(app().mount());
