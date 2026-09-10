import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type PaneDropTarget } from '../layout/index.mjs';

/**
 * What a drop would do, drawn over the pane it would do it to.
 *
 * The two outcomes look different rather than being explained: the middle of a
 * pane highlights the whole of it, an edge highlights the half the moved pane
 * would take. The caption is there because "swap" and "move" are the kind of
 * distinction that is obvious once and never again.
 */
export const PaneDropIndicator = memoNamed(
  'PaneDropIndicator',
  ({ target }: Readonly<{ target: PaneDropTarget }>) => {
    const style = React.useMemo<React.CSSProperties>(
      () => ({
        left: `${String(target.indicator.left)}px`,
        top: `${String(target.indicator.top)}px`,
        width: `${String(target.indicator.width)}px`,
        height: `${String(target.indicator.height)}px`,
      }),
      [target.indicator],
    );

    return (
      <div className={'pane-drop'} style={style}>
        <span className={'pane-drop__label'}>
          {target.zone === 'center' ? 'Swap' : 'Move here'}
        </span>
      </div>
    );
  },
);
