import type { DomOp, DomValue } from './pane-bridge.mjs';

/**
 * Runs `DomOp`s on the document it is created in, giving out a handle for each element it answers
 * with and reading the handles it is given back.
 *
 * Split View's content script runs one in each pane, for the partner whose
 * button was pressed there (`pane-bridge.mts`); a partner runs one on a page of
 * its own, so that the same steps work in a tab as in a pane. Nothing here
 * evaluates code: an op is a name from a fixed list and its arguments, and an
 * invalid selector or a handle that names nothing answers `null`.
 *
 * The handles are held weakly, so an element the page drops is not kept alive
 * by having been answered once.
 *
 * Its tests are in a real Chromium rather than here, where there is no DOM:
 * `apps/github-view-defaults-extension/e2e/pull-request-buttons.spec.mts`
 * drives GitHub's label picker through it in a tab and in a pane of Split View.
 */
export const createDomExecutor = (): Readonly<{
  run: (op: DomOp) => DomValue;
  /** Forgets every handle given out so far. */
  reset: () => void;
}> => {
  const mut_elements = new Map<number, WeakRef<Element>>();

  const mut_counter = { next: 1 };

  const handleOf = (element: Element): number => {
    const handle = mut_counter.next;

    mut_counter.next += 1;

    mut_elements.set(handle, new WeakRef(element));

    return handle;
  };

  const elementOf = (handle: number): Element | undefined =>
    mut_elements.get(handle)?.deref();

  const scopeOf = (within: number | undefined): ParentNode | undefined =>
    within === undefined ? window.document : elementOf(within);

  const run = (op: DomOp): DomValue => {
    try {
      return runOp(op, { handleOf, elementOf, scopeOf });
    } catch {
      // An invalid selector, mostly: `querySelector` throws on one.
      return null;
    }
  };

  return {
    run,
    reset: () => {
      mut_elements.clear();
    },
  };
};

const runOp = (
  op: DomOp,
  {
    handleOf,
    elementOf,
    scopeOf,
  }: Readonly<{
    handleOf: (element: Element) => number;
    elementOf: (handle: number) => Element | undefined;
    scopeOf: (within: number | undefined) => ParentNode | undefined;
  }>,
): DomValue => {
  switch (op.op) {
    case 'location':
      return window.document.location.href;

    case 'query': {
      const found = scopeOf(op.within)?.querySelector(op.selector);

      return found === null || found === undefined ? null : handleOf(found);
    }

    case 'queryAll':
      return Array.from(
        scopeOf(op.within)?.querySelectorAll(op.selector) ?? [],
        handleOf,
      );

    case 'closest': {
      const found = elementOf(op.handle)?.closest(op.selector);

      return found === null || found === undefined ? null : handleOf(found);
    }

    case 'parent': {
      const found = elementOf(op.handle)?.parentElement;

      return found === null || found === undefined ? null : handleOf(found);
    }

    case 'contains': {
      const other = elementOf(op.other);

      return (
        other !== undefined && elementOf(op.handle)?.contains(other) === true
      );
    }

    case 'attribute':
      return elementOf(op.handle)?.getAttribute(op.name) ?? null;

    case 'text':
      return elementOf(op.handle)?.textContent.trim() ?? null;

    case 'tagName':
      return elementOf(op.handle)?.tagName ?? null;

    case 'isOpen': {
      const element = elementOf(op.handle);

      return element instanceof HTMLDetailsElement ? element.open : null;
    }

    case 'click': {
      const element = elementOf(op.handle);

      if (element instanceof HTMLElement) {
        element.click();
      }

      return null;
    }

    case 'input': {
      const mut_element = elementOf(op.handle);

      if (mut_element instanceof HTMLInputElement) {
        // The `value` setter of the world this runs in is the DOM's own,
        // beneath the one a framework such as React installs on the element in
        // the page's world, so the `input` event that follows is seen as a
        // change.
        mut_element.value = op.value;

        mut_element.dispatchEvent(new Event('input', { bubbles: true }));
      }

      return null;
    }

    case 'key':
      elementOf(op.handle)?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: op.key,
          code: op.key,
          bubbles: true,
          cancelable: true,
        }),
      );

      return null;
  }
};
