import * as React from 'react';
import { Arr, PositiveSafeInt } from 'ts-data-forge';
import { ChartLegend } from './chart-legend.js';
import {
  createToY,
  formatTickLabel,
  generateLinearTicks,
  generateLogTicks,
  lineStyleOf,
} from './chart-utils.mjs';

type DataSeries = Readonly<{
  label: string;
  color: string;
  /**
   * A form written naively on purpose: drawn dashed, thinner and beneath the
   * others, so that it does not read as the library's own line.
   */
  naive?: boolean;
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

  if (Arr.isEmpty(allValues)) {
    return undefined;
  }

  const yMin = logScale ? Math.max(0.1, Math.min(...allValues)) : 0;

  const yMaxRaw = yMaxOverride ?? Math.max(...allValues, timeoutMs ?? 0);

  const yMax = yMaxRaw * 1.1;

  const toY = createToY(PLOT_H, yMin, yMax, logScale);

  const toX = (i: number): number =>
    Arr.isMaxLengthArray(1, xLabels)
      ? PLOT_W / 2
      : // the guard above rules out a zero denominator
        // eslint-disable-next-line total-functions/no-partial-division
        (i / (xLabels.length - 1)) * PLOT_W;

  // The naive forms first, so that the lines they cross are drawn over them
  const drawOrder = series.toSorted(
    (a, b) => Number(b.naive === true) - Number(a.naive === true),
  );

  // Y-axis tick values
  const yTicks = logScale
    ? generateLogTicks(yMin, yMax)
    : generateLinearTicks(PositiveSafeInt.fromNumber(yMax));

  return (
    <div style={figureStyle}>
      <svg
        style={svgStyle}
        viewBox={`0 0 ${CHART_WIDTH.toString()} ${CHART_HEIGHT.toString()}`}
      >
        <g
          transform={`translate(${PADDING.left.toString()}, ${PADDING.top.toString()})`}
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
          {drawOrder.map((s) => {
            const style = lineStyleOf(s.naive);

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
                  ? `M ${p.x.toString()} ${p.y.toString()}`
                  : `L ${p.x.toString()} ${p.y.toString()}`,
              )
              .join(' ');

            return (
              <g key={s.label}>
                <path
                  d={linePath}
                  fill={'none'}
                  stroke={s.color}
                  strokeDasharray={style.strokeDasharray}
                  strokeWidth={style.strokeWidth}
                />
                {points.map((p) => (
                  <circle
                    key={`${p.x.toString()}-${p.y.toString()}`}
                    cx={p.x}
                    cy={p.y}
                    fill={s.color}
                    r={style.dotRadius}
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
            transform={`translate(${(-PADDING.left + 16).toString()}, ${(PLOT_H / 2).toString()}) rotate(-90)`}
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
        </g>
      </svg>
      <ChartLegend marker={'line'} series={series} />
    </div>
  );
});

BenchmarkLineChart.displayName = 'BenchmarkLineChart';

const figureStyle = {
  maxWidth: `${CHART_WIDTH.toString()}px`,
} as const;

const svgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
} as const;
