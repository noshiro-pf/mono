import { createState, onScopeDispose } from 'synstate';
import {
  createAfterUpdate,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  children: Child;
  /**
   * One line, cut short with an ellipsis where it does not fit, and then titled
   * with the whole of it (`bp6-text-overflow-ellipsis`).
   */
  ellipsize?: boolean;
  /** The element drawn: `div` by default, as Blueprint's. */
  tagName?: 'div' | 'span';
  /** The `title` always, in place of the measured one. */
  title?: Bindable<string>;
  /** Classes after Blueprint's own. */
  class?: string;
}>;

/**
 * Blueprint's `Text`, named apart from the DOM's `Text`. With `ellipsize`, it
 * is measured once it is drawn and again as its text or its size changes, as
 * Blueprint's measures on every render, and titled with its text while that is
 * cut short.
 */
export const BpText = ({
  children,
  ellipsize = false,
  tagName = 'div',
  title,
  class: className,
}: Props): JSX.Element => {
  const mut_element: { element: HTMLElement | undefined } = {
    element: undefined,
  };

  const [measured$, setMeasured] = createState<string | undefined>(undefined);

  const afterUpdate = createAfterUpdate();

  const measure = (): void => {
    const { element } = mut_element;

    if (element !== undefined) {
      setMeasured(
        element.scrollWidth > element.clientWidth
          ? element.textContent
          : undefined,
      );
    }
  };

  if (ellipsize && title === undefined) {
    // Read off the DOM, so that a `View` among the children is not mapped
    // twice; and again as its size changes, as when one drawn hidden is shown,
    // where Blueprint's measures as it is rendered again.
    const textChanges = new MutationObserver(measure);

    const sizeChanges = new ResizeObserver(measure);

    // The size observer's first report measures it once drawn.
    afterUpdate(() => {
      if (mut_element.element === undefined) {
        return;
      }

      textChanges.observe(mut_element.element, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      sizeChanges.observe(mut_element.element);
    });

    onScopeDispose(() => {
      textChanges.disconnect();

      sizeChanges.disconnect();
    });
  }

  onScopeDispose(() => {
    mut_element.element = undefined;
  });

  const props = {
    ref: (element: HTMLElement) => {
      mut_element.element = element;
    },
    class: classObject([ellipsize && 'bp6-text-overflow-ellipsis', className]),
    title: title ?? measured$,
  } as const;

  return tagName === 'span' ? (
    <span {...props}>{children}</span>
  ) : (
    <div {...props}>{children}</div>
  );
};
