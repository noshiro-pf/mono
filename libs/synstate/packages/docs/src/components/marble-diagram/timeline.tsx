import * as React from 'react';
import { type TimelineDef } from './types.mjs';

type Props = Readonly<{
  def: TimelineDef;
}>;

export const Timeline = React.memo<Props>(({ def }) => (
  <svg
    role={'img'}
    style={timelineSvgStyle}
    viewBox={`0 0 ${String(VIEWBOX_WIDTH)} ${String(VIEWBOX_HEIGHT)}`}
  >
    {/* Timeline line */}
    <title>Timeline of observable events</title>
    <line
      stroke={'var(--sl-color-gray-3, #6b7280)'}
      strokeWidth={STROKE_WIDTH}
      x1={0}
      x2={ARROW_X}
      y1={LINE_Y}
      y2={LINE_Y}
    />

    {/* Arrow */}
    <polygon
      fill={'var(--sl-color-gray-3, #6b7280)'}
      points={`${String(ARROW_X)},${String(LINE_Y - 1.2)} ${String(ARROW_X + 2.5)},${String(LINE_Y)} ${String(ARROW_X)},${String(LINE_Y + 1.2)}`}
    />

    {/* Completion marker "|" */}
    {def.completion !== undefined ? (
      <line
        stroke={'var(--sl-color-gray-3, #6b7280)'}
        strokeWidth={STROKE_WIDTH * 2}
        x1={def.completion}
        x2={def.completion}
        y1={LINE_Y - MARBLE_RADIUS}
        y2={LINE_Y + MARBLE_RADIUS}
      />
    ) : undefined}

    {/* Error marker "X" */}
    {def.error !== undefined ? (
      <g>
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={STROKE_WIDTH * 2}
          x1={def.error - 1.5}
          x2={def.error + 1.5}
          y1={LINE_Y - 1.5}
          y2={LINE_Y + 1.5}
        />
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={STROKE_WIDTH * 2}
          x1={def.error + 1.5}
          x2={def.error - 1.5}
          y1={LINE_Y - 1.5}
          y2={LINE_Y + 1.5}
        />
      </g>
    ) : undefined}

    {/* Marbles */}
    {def.marbles.map((m) => (
      <g key={`${String(m.t)}-${m.label}`}>
        <circle
          cx={m.t}
          cy={LINE_Y}
          fill={m.color.fill}
          r={MARBLE_RADIUS}
          stroke={'var(--sl-color-text, #1a1a2e)'}
          strokeWidth={STROKE_WIDTH}
        />
        <text
          dominantBaseline={'central'}
          fill={m.color.text}
          fontFamily={'system-ui, -apple-system, sans-serif'}
          fontSize={MARBLE_FONT_SIZE}
          fontWeight={700}
          textAnchor={'middle'}
          x={m.t}
          y={LINE_Y}
        >
          {m.label}
        </text>
      </g>
    ))}
  </svg>
));

Timeline.displayName = 'Timeline';

const VIEWBOX_WIDTH = 110;

const VIEWBOX_HEIGHT = 10;

const MARBLE_RADIUS = 2.5;

const MARBLE_FONT_SIZE = 2.2;

const LINE_Y = 5;

const ARROW_X = 105;

const STROKE_WIDTH = 0.3;

const timelineSvgStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
} as const;
