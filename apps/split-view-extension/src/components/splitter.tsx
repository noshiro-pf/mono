import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type SplitterRect } from '../layout/index.mjs';

export const Splitter = memoNamed(
  'Splitter',
  ({
    splitter,
    onDragStart,
  }: Readonly<{
    splitter: SplitterRect;
    onDragStart: (dragged: SplitterRect) => void;
  }>) => {
    const handlePointerDown = React.useCallback<
      React.PointerEventHandler<HTMLDivElement>
    >(
      (pointerEvent) => {
        // Without this, the press starts a text selection that follows the
        // pointer over the panes for the length of the drag.
        pointerEvent.preventDefault();

        onDragStart(splitter);
      },
      [onDragStart, splitter],
    );

    const style = React.useMemo<React.CSSProperties>(
      () => ({
        left: `${splitter.rect.left}px`,
        top: `${splitter.rect.top}px`,
        width: `${splitter.rect.width}px`,
        height: `${splitter.rect.height}px`,
      }),
      [splitter.rect],
    );

    return (
      <hr
        aria-orientation={splitter.axis === 'row' ? 'vertical' : 'horizontal'}
        className={`splitter splitter--${splitter.axis}`}
        style={style}
        onPointerDown={handlePointerDown}
      />
    );
  },
);
