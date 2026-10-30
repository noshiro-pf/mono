import * as React from 'react';

type Props = Readonly<{
  series: readonly Readonly<{ label: string; color: string }>[];
  /** A line with a dot for a line chart, a filled box for a bar chart. */
  marker: 'line' | 'swatch';
}>;

/**
 * The series legend, as HTML below the plot rather than inside the SVG.
 *
 * Drawn inside the plot it covered the lines once a chart had nine series, and
 * a column of SVG text scales down with the whole chart at phone width. A
 * wrapping list keeps every line visible and the labels at the page's size.
 * `not-content` keeps Starlight's prose spacing off the list items.
 */
export const ChartLegend = React.memo<Props>(({ series, marker }) => (
  <ul className={'not-content'} style={listStyle}>
    {series.map((s) => (
      <li key={s.label} style={itemStyle}>
        <svg
          aria-hidden={true}
          height={MARKER_HEIGHT}
          viewBox={`0 0 ${MARKER_WIDTH.toString()} ${MARKER_HEIGHT.toString()}`}
          width={MARKER_WIDTH}
        >
          {marker === 'line' ? (
            <>
              <line
                stroke={s.color}
                strokeWidth={2}
                x1={0}
                x2={MARKER_WIDTH}
                y1={MARKER_HEIGHT / 2}
                y2={MARKER_HEIGHT / 2}
              />
              <circle
                cx={MARKER_WIDTH / 2}
                cy={MARKER_HEIGHT / 2}
                fill={s.color}
                r={3}
              />
            </>
          ) : (
            <rect
              fill={s.color}
              height={SWATCH_HEIGHT}
              rx={2}
              width={SWATCH_WIDTH}
              x={(MARKER_WIDTH - SWATCH_WIDTH) / 2}
              y={(MARKER_HEIGHT - SWATCH_HEIGHT) / 2}
            />
          )}
        </svg>
        {s.label}
      </li>
    ))}
  </ul>
));

ChartLegend.displayName = 'ChartLegend';

const MARKER_WIDTH = 20;

const MARKER_HEIGHT = 12;

const SWATCH_WIDTH = 14;

const SWATCH_HEIGHT = 10;

const listStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '0.25em 1em',
  listStyle: 'none',
  margin: '0.5em 0 0',
  padding: 0,
  fontSize: '0.85em',
  color: 'var(--sl-color-text, #1f2937)',
} as const;

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4em',
  whiteSpace: 'nowrap',
} as const;
