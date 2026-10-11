import type { PointerEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { DEFAULT_LAYOUT, splitAt } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

/**
 * The line between the two columns, dragged to share the width differently,
 * and double-clicked to even it.
 *
 * A drag reads the pointer against the whole layout's box, so the line
 * follows the pointer rather than a distance moved. Pointer-only, and hidden
 * from assistive technology for it: the keyboard's way to the same thing is
 * the slider in the layout settings, which is a real control rather than a
 * `separator` that would have to be taught to be one.
 */
export const ColumnDivider = memoNamed('ColumnDivider', () => (
  <div
    aria-hidden={'true'}
    className={'column-divider'}
    title={'Drag to share the width; double-click to even it'}
    onDblClick={onDoubleClick}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
  />
));

// Outside the component, since none of them reads its props: one function
// each serves every render, with no `useCallback` to keep it stable.

const onPointerDown: PointerEventHandler<HTMLDivElement> = (pressed) => {
  if (pressed.button !== 0) {
    return;
  }

  pressed.preventDefault();

  pressed.currentTarget.setPointerCapture(pressed.pointerId);
};

const onPointerMove: PointerEventHandler<HTMLDivElement> = (moved) => {
  const box = moved.currentTarget.parentElement?.getBoundingClientRect();

  if (
    box === undefined ||
    !moved.currentTarget.hasPointerCapture(moved.pointerId)
  ) {
    return;
  }

  const split = splitAt(moved.clientX, box);

  if (split !== undefined) {
    layoutStore.setSplit(split);
  }
};

const onDoubleClick = (): void => {
  layoutStore.setSplit(DEFAULT_LAYOUT.split);
};
