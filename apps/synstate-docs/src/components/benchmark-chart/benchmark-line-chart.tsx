import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { formatMs } from './benchmark-data.mjs';
import { ChartLegend } from './chart-legend.js';
import {
  createToY,
  createUnclampedLinearToY,
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
  /**
   * Set the Y-axis by the series that have a value at every X label alone. A
   * series that timed out somewhere is the one whose growth outruns the rest,
   * and an axis reaching its largest value flattens the others to the X-axis;
   * its values above the top are clipped instead: its line leaves through the
   * top edge and, in place of a dot, a triangle on the edge carries the value.
   */
  scaleByCompleteSeries?: boolean;
}>;

const CHART_WIDTH = 600;

const CHART_HEIGHT = 340;

const PADDING = { top: 20, right: 30, bottom: 50, left: 70 } as const;

const PLOT_W = CHART_WIDTH - PADDING.left - PADDING.right;

const PLOT_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

/** The largest dot's radius, by which the clip path overhangs the plot. */
const DOT_ROOM = Math.max(
  lineStyleOf(false).dotRadius,
  lineStyleOf(true).dotRadius,
);

export const BenchmarkLineChart = React.memo<Props>((props) => {
  const {
    xLabels,
    series,
    yAxisLabel = 'ms',
    logScale = false,
    timeoutMs,
    scaleByCompleteSeries = false,
  } = props;

  const clipPathId = React.useId();

  // Collect all non-undefined values to determine Y range
  const allValues = React.useMemo(
    () =>
      series.flatMap((s) =>
        s.values.filter((v): v is number => v !== undefined),
      ),
    [series],
  );

  const layout = React.useMemo(() => {
    if (Arr.isEmpty(allValues)) {
      return undefined;
    }

    const yMin = logScale ? Math.max(0.1, Math.min(...allValues)) : 0;

    const scaleValues = scaleByCompleteSeries
      ? series
          .filter((s) => s.values.every((v) => v !== undefined))
          .flatMap((s) => s.values.filter((v): v is number => v !== undefined))
      : allValues;

    // The timeout line does not raise an axis the complete series set: it is
    // above every value they have, and would flatten them all over again
    const yMaxRaw = Math.max(
      ...(Arr.isEmpty(scaleValues) ? allValues : scaleValues),
      scaleByCompleteSeries ? 0 : (timeoutMs ?? 0),
    );

    const yMax = yMaxRaw * 1.1;

    const toY = createToY(PLOT_H, yMin, yMax, logScale);

    return {
      yMin,
      yMax,
      toY,
      // Lines are drawn through the true position and clipped to the plot, so
      // that a line leaving the scale keeps its slope. The log scale clamps
      // only at the bottom, so it maps a value above the top past it already.
      toLineY: logScale ? toY : createUnclampedLinearToY(PLOT_H, yMax),
      // Per X label, the series above the top there, in legend order
      offScale: xLabels.map((_, i) =>
        series
          .map((s) => ({ label: s.label, color: s.color, value: s.values[i] }))
          .filter(
            (
              p,
            ): p is Readonly<{ label: string; color: string; value: number }> =>
              p.value !== undefined && p.value > yMax,
          ),
      ),
      toX: (i: number): number =>
        Arr.isMaxLengthArray(1, xLabels)
          ? PLOT_W / 2
          : // the guard above rules out a zero denominator
            // eslint-disable-next-line total-functions/no-partial-division
            (i / (xLabels.length - 1)) * PLOT_W,
      // The naive forms first, so that the lines they cross are drawn over them
      drawOrder: series.toSorted(
        (a, b) => Number(b.naive === true) - Number(a.naive === true),
      ),
      // Y-axis tick values
      yTicks: logScale
        ? generateLogTicks(yMin, yMax)
        : generateLinearTicks(yMax),
    } as const;
  }, [allValues, series, xLabels, logScale, scaleByCompleteSeries, timeoutMs]);

  return layout === undefined ? undefined : (
    <div style={figureStyle}>
      <svg
        style={svgStyle}
        viewBox={`0 0 ${CHART_WIDTH.toString()} ${CHART_HEIGHT.toString()}`}
      >
        <g
          transform={`translate(${PADDING.left.toString()}, ${PADDING.top.toString()})`}
        >
          <defs>
            <clipPath id={clipPathId}>
              {/* Room for half a dot past each edge, so edge dots stay whole */}
              <rect
                height={PLOT_H + 2 * DOT_ROOM}
                width={PLOT_W + 2 * DOT_ROOM}
                x={-DOT_ROOM}
                y={-DOT_ROOM}
              />
            </clipPath>
          </defs>
          {/* Grid lines */}
          {layout.yTicks.map((tick) => (
            <line
              key={tick}
              stroke={'var(--sl-color-gray-5, #e5e7eb)'}
              strokeWidth={0.5}
              x1={0}
              x2={PLOT_W}
              y1={layout.toY(tick)}
              y2={layout.toY(tick)}
            />
          ))}

          {/* Timeout line */}
          {timeoutMs !== undefined && timeoutMs <= layout.yMax ? (
            <line
              stroke={'#ef4444'}
              strokeDasharray={'6,4'}
              strokeWidth={1}
              x1={0}
              x2={PLOT_W}
              y1={layout.toY(timeoutMs)}
              y2={layout.toY(timeoutMs)}
            />
          ) : undefined}

          {/* Data lines + dots */}
          {layout.drawOrder.map((s) => {
            const style = lineStyleOf(s.naive);

            const points = s.values
              .map((v, i) =>
                v !== undefined
                  ? {
                      x: layout.toX(i),
                      y: layout.toLineY(
                        logScale ? Math.max(v, layout.yMin) : v,
                      ),
                      clipped: v > layout.yMax,
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
              <g key={s.label} clipPath={`url(#${clipPathId})`}>
                <path
                  d={linePath}
                  fill={'none'}
                  stroke={s.color}
                  strokeDasharray={style.strokeDasharray}
                  strokeWidth={style.strokeWidth}
                />
                {points.map((p) =>
                  p.clipped ? undefined : (
                    <circle
                      key={`${p.x.toString()}-${p.y.toString()}`}
                      cx={p.x}
                      cy={p.y}
                      fill={s.color}
                      r={style.dotRadius}
                    />
                  ),
                )}
              </g>
            );
          })}

          {/*
           * Values above the scale: a triangle on the top edge and the values,
           * one label per X so that two series off the scale at the same X are
           * written side by side rather than drawn over each other
           */}
          {layout.offScale.map((points, i) =>
            Arr.isNonEmpty(points) ? (
              <g key={xLabels[i] ?? i.toString()}>
                <polygon
                  fill={points[0].color}
                  points={clippedMarkerPoints(layout.toX(i))}
                />
                <text
                  fontSize={10}
                  fontWeight={600}
                  textAnchor={'middle'}
                  x={layout.toX(i)}
                  y={-7}
                >
                  {points.map((p, j) => (
                    <tspan key={p.label} fill={p.color}>
                      {j === 0 ? '' : ' / '}
                      {formatMs(p.value)}
                    </tspan>
                  ))}
                </text>
              </g>
            ) : undefined,
          )}

          {/* Y-axis */}
          <line
            stroke={'var(--sl-color-gray-3, #6b7280)'}
            strokeWidth={1}
            x1={0}
            x2={0}
            y1={0}
            y2={PLOT_H}
          />
          {layout.yTicks.map((tick) => (
            <text
              key={tick}
              dominantBaseline={'middle'}
              fill={'var(--sl-color-gray-3, #6b7280)'}
              fontSize={11}
              textAnchor={'end'}
              x={-8}
              y={layout.toY(tick)}
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
              x={layout.toX(i)}
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

/** An upward triangle whose tip sits just above the plot's top edge. */
const clippedMarkerPoints = (x: number): string =>
  (
    [
      [x - 4, 4],
      [x + 4, 4],
      [x, -3],
    ] as const
  )
    .map(([px, py]) => `${px.toString()},${py.toString()}`)
    .join(' ');
