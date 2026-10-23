import * as React from 'react';
import { Arr } from 'ts-data-forge';

type Props = Readonly<{
  /** Every caption the figure can show, so that the tallest sets the height. */
  captions: readonly string[];
  current: string;
  style: React.CSSProperties;
}>;

/**
 * The caption of the step shown, in a box as tall as the tallest caption at
 * the current width, so that what follows it — the controls — stays put as
 * the steps change. Every caption is laid out, hidden, in the same grid cell
 * as the one shown.
 */
export const StableCaption = React.memo<Props>(
  ({ captions, current, style }) => {
    const sizers = React.useMemo(() => Arr.uniq(captions), [captions]);

    return (
      <div style={{ ...style, ...gridStyle }}>
        {sizers.map((caption) => (
          <p aria-hidden={true} key={caption} style={sizerStyle}>
            {caption}
          </p>
        ))}
        <p aria-live={'polite'} style={cellStyle}>
          {current}
        </p>
      </div>
    );
  },
);

StableCaption.displayName = 'StableCaption';

const gridStyle: React.CSSProperties = {
  display: 'grid',
} as const;

const cellStyle: React.CSSProperties = {
  gridArea: '1 / 1',
  margin: 0,
} as const;

const sizerStyle: React.CSSProperties = {
  ...cellStyle,
  visibility: 'hidden',
} as const;
