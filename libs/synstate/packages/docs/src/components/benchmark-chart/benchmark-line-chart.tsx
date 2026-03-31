import * as React from 'react';
import { Arr, PositiveSafeInt } from 'ts-data-forge';
import {
  createToY,
  formatTickLabel,
  generateLinearTicks,
  generateLogTicks,
} from './chart-utils.mjs';

type DataSeries = Readonly<{
  label: string;
  color: string;
  /** Values in ms. `undefined` means timed out / not measured. */
  values: readonly (number | undefined)[];
}>;

type Props = Readonly<{
  /** X-axis labels (e.g., parameter values) */
  xLabels: readonly string[];
  /** Data series to plot */
  series: readonly DataSeries[];
  /** Y-axis label */
  yAxisLabel?: string;
  /** Use logarithmic Y-axis */
  logScale?: boolean;
  /** Timeout threshold line (ms) */
  timeoutMs?: number;
  /** Override the Y-axis maximum. Values above this are clipped. */
  yMaxOverride?: number;
}>;

const CHART_WIDTH = 600;

const CHART_HEIGHT = 340;

const PADDING = { top: 20, right: 30, bottom: 50, left: 70 } as const;

const PLOT_W = CHART_WIDTH - PADDING.left - PADDING.right;

const PLOT_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export const BenchmarkLineChart = React.memo<Props>((props) => {
  const {
    xLabels,
    series,
    yAxisLabel = 'ms',
    logScale = false,
    timeoutMs,
    yMaxOverride,
  } = props;

  // Collect all non-undefined values to determine Y range
  const allValues = series.flatMap((s) =>
    s.values.filter((v): v is number => v !== undefined),
  );

  if (Arr.isArrayOfLength(allValues, 0)) return undefined;

  const yMin = logScale ? Math.max(0.1, Math.min(...allValues)) : 0;

  const yMaxRaw = yMaxOverride ?? Math.max(...allValues, timeoutMs ?? 0);

  const yMax = yMaxRaw * 1.1;

  const toY = createToY(PLOT_H, yMin, yMax, logScale);

  const toX = (i: number): number =>
    // eslint-disable-next-line total-functions/no-partial-division
    xLabels.length <= 1 ? PLOT_W / 2 : (i / (xLabels.length - 1)) * PLOT_W;

  // Y-axis tick values
  const yTicks = logScale
    ? generateLogTicks(yMin, yMax)
    : generateLinearTicks(PositiveSafeInt.clamp(yMax));

  return (
    <svg
      style={svgStyle}
      viewBox={`0 0 ${String(CHART_WIDTH)} ${String(CHART_HEIGHT)}`}
    >
      <g
        transform={`translate(${String(PADDING.left)}, ${String(PADDING.top)})`}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            stroke={'var(--sl-color-gray-5, #e5e7eb)'}
            strokeWidth={0.5}
            x1={0}
            x2={PLOT_W}
            y1={toY(tick)}
            y2={toY(tick)}
          />
        ))}

        {/* Timeout line */}
        {timeoutMs !== undefined && timeoutMs <= yMax ? (
          <line
            stroke={'#ef4444'}
            strokeDasharray={'6,4'}
            strokeWidth={1}
            x1={0}
            x2={PLOT_W}
            y1={toY(timeoutMs)}
            y2={toY(timeoutMs)}
          />
        ) : undefined}

        {/* Data lines + dots */}
        {series.map((s) => {
          const points = s.values
            .map((v, i) =>
              v !== undefined
                ? {
                    x: toX(i),
                    y: toY(logScale ? Math.max(v, yMin) : v),
                    value: v,
                  }
                : undefined,
            )
            .filter((p): p is NonNullable<typeof p> => p !== undefined);

          const linePath = points
            .map((p, i) =>
              i === 0
                ? `M ${String(p.x)} ${String(p.y)}`
                : `L ${String(p.x)} ${String(p.y)}`,
            )
            .join(' ');

          return (
            <g key={s.label}>
              <path
                d={linePath}
                fill={'none'}
                stroke={s.color}
                strokeWidth={2}
              />
              {points.map((p) => (
                <circle
                  key={`${String(p.x)}-${String(p.y)}`}
                  cx={p.x}
                  cy={p.y}
                  fill={s.color}
                  r={3}
                />
              ))}
            </g>
          );
        })}

        {/* Y-axis */}
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={1}
          x1={0}
          x2={0}
          y1={0}
          y2={PLOT_H}
        />
        {yTicks.map((tick) => (
          <text
            key={tick}
            dominantBaseline={'middle'}
            fill={'var(--sl-color-gray-3, #6b7280)'}
            fontSize={11}
            textAnchor={'end'}
            x={-8}
            y={toY(tick)}
          >
            {formatTickLabel(tick)}
          </text>
        ))}

        {/* Y-axis label */}
        <text
          dominantBaseline={'middle'}
          fill={'var(--sl-color-gray-3, #6b7280)'}
          fontSize={12}
          textAnchor={'middle'}
          transform={`translate(${String(-PADDING.left + 16)}, ${String(PLOT_H / 2)}) rotate(-90)`}
        >
          {yAxisLabel}
        </text>

        {/* X-axis */}
        <line
          stroke={'var(--sl-color-gray-3, #6b7280)'}
          strokeWidth={1}
          x1={0}
          x2={PLOT_W}
          y1={PLOT_H}
          y2={PLOT_H}
        />
        {xLabels.map((label, i) => (
          <text
            key={label}
            dominantBaseline={'hanging'}
            fill={'var(--sl-color-gray-3, #6b7280)'}
            fontSize={11}
            textAnchor={'middle'}
            x={toX(i)}
            y={PLOT_H + 8}
          >
            {label}
          </text>
        ))}

        {/* Legend */}
        {series.map((s, i) => {
          const lx = 8;

          const ly = i * 18 + 4;

          return (
            <g key={s.label}>
              <line
                stroke={s.color}
                strokeWidth={2}
                x1={lx}
                x2={lx + 20}
                y1={ly}
                y2={ly}
              />
              <circle cx={lx + 10} cy={ly} fill={s.color} r={3} />
              <text
                dominantBaseline={'middle'}
                fill={'var(--sl-color-text, #1f2937)'}
                fontSize={11}
                x={lx + 26}
                y={ly}
              >
                {s.label.replaceAll('**', '')}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
});

BenchmarkLineChart.displayName = 'BenchmarkLineChart';

const svgStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: `${String(CHART_WIDTH)}px`,
  height: 'auto',
} as const;
