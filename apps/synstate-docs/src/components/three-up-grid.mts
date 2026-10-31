import type * as React from 'react';

/**
 * A grid of demo canvases: three to a row in the content column, and fewer,
 * down to one, as the column narrows below three 140px tracks. Both the gap
 * and the track width come from `gapPx`, so they cannot disagree.
 */
export const threeUpGrid = (gapPx: number): React.CSSProperties =>
  ({
    display: 'grid',
    gap: `${gapPx}px`,
    // A third of the row, less 1px so that rounding never leaves too little room for three.
    gridTemplateColumns: `repeat(auto-fit, minmax(max(140px, calc((100% - ${2 * gapPx}px) / 3 - 1px)), 1fr))`,
    alignItems: 'start',
  }) as const;
