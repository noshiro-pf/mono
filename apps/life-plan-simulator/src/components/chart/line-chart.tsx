import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { Arr, Num } from 'ts-data-forge';

/**
 * 折れ線グラフ（`収支グラフ` シートのグラフ）。系列の数と目盛りの数は固定で、
 * 変わるのは線と目盛りの位置・ラベルだけ。
 */
export const LineChart = ({
  label,
  data,
  series,
}: Readonly<{
  label: string;
  data: Bindable<readonly ChartPoint[]>;
  series: readonly ChartSeries[];
}>): JSX.Element => {
  const layout = mapBindable(data, (points) =>
    computeLayout(points, series.length),
  );

  return (
    <figure class={constant('chart')}>
      <svg
        viewBox={constant(`0 0 ${width} ${height}`)}
        role={constant('img')}
        aria-label={constant(label)}
      >
        {tickIndices(yTickCount).map((i) => (
          <g>
            <line
              x1={constant(padding.left.toString())}
              x2={constant((width - padding.right).toString())}
              y1={mapBindable(layout, (l) =>
                (l.yTicks[i]?.position ?? 0).toString(),
              )}
              y2={mapBindable(layout, (l) =>
                (l.yTicks[i]?.position ?? 0).toString(),
              )}
              stroke={constant('var(--grid)')}
              stroke-width={constant('1')}
            />
            <text
              x={constant((padding.left - 6).toString())}
              y={mapBindable(layout, (l) =>
                (l.yTicks[i]?.position ?? 0).toString(),
              )}
              text-anchor={constant('end')}
              dominant-baseline={constant('middle')}
              font-size={constant('11')}
              fill={constant('var(--muted)')}
            >
              {mapBindable(layout, (l) => l.yTicks[i]?.label ?? '')}
            </text>
          </g>
        ))}
        {tickIndices(xTickCount).map((i) => (
          <text
            x={mapBindable(layout, (l) =>
              (l.xTicks[i]?.position ?? 0).toString(),
            )}
            y={constant((height - padding.bottom + 16).toString())}
            text-anchor={constant('middle')}
            font-size={constant('11')}
            fill={constant('var(--muted)')}
          >
            {mapBindable(layout, (l) => l.xTicks[i]?.label ?? '')}
          </text>
        ))}
        <line
          x1={constant(padding.left.toString())}
          x2={constant((width - padding.right).toString())}
          y1={mapBindable(layout, (l) => l.zero.toString())}
          y2={mapBindable(layout, (l) => l.zero.toString())}
          stroke={constant('var(--axis)')}
          stroke-width={constant('1')}
        />
        {series.map((s, k) => (
          <path
            d={mapBindable(layout, (l) => l.paths[k] ?? '')}
            fill={constant('none')}
            stroke={constant(s.color)}
            stroke-width={constant('2')}
            stroke-linejoin={constant('round')}
          />
        ))}
      </svg>
      <figcaption>
        <ul class={constant('legend')}>
          {series.map((s) => (
            <li>
              <span
                class={constant('swatch')}
                style={{ 'background-color': constant(s.color) }}
              />
              {constant(s.name)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
};

export type ChartPoint = Readonly<{
  /** 横軸の値（年齢） */
  x: number;
  /** 系列ごとの値（円） */
  values: readonly number[];
}>;

export type ChartSeries = Readonly<{
  name: string;
  color: string;
}>;

const width = 720;

const height = 320;

const padding = { top: 12, right: 12, bottom: 28, left: 64 } as const;

const yTickCount = 5;

const xTickCount = 8;

type Tick = Readonly<{ position: number; label: string }>;

type Layout = Readonly<{
  paths: readonly string[];
  yTicks: readonly Tick[];
  xTicks: readonly Tick[];
  zero: number;
}>;

const tickIndices = (count: number): readonly number[] =>
  Array.from({ length: count }, (_, i) => i);

const computeLayout = (
  points: readonly ChartPoint[],
  seriesCount: number,
): Layout => {
  const xs = points.map((p) => p.x);

  const values = points.flatMap((p) => p.values);

  const xMin = Arr.isNonEmpty(xs) ? Math.min(...xs) : 0;

  const xMax = Arr.isNonEmpty(xs) ? Math.max(...xs) : 1;

  const step = niceStep(
    ratio(Math.max(0, ...values) - Math.min(0, ...values), yTickCount - 1),
  );

  const yMin = Math.floor(ratio(Math.min(0, ...values), step)) * step;

  const yMax = Math.max(
    yMin + step * (yTickCount - 1),
    Math.ceil(ratio(Math.max(0, ...values), step)) * step,
  );

  const plotWidth = width - padding.left - padding.right;

  const plotHeight = height - padding.top - padding.bottom;

  const xScale = (x: number): number =>
    padding.left + ratio(x - xMin, xMax - xMin) * plotWidth;

  const yScale = (y: number): number =>
    padding.top + (1 - ratio(y - yMin, yMax - yMin)) * plotHeight;

  return {
    paths: tickIndices(seriesCount).map((k) =>
      points
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'}${xScale(p.x).toFixed(1)},${yScale(p.values[k] ?? 0).toFixed(1)}`,
        )
        .join(' '),
    ),
    yTicks: tickIndices(yTickCount).map((i) => {
      const value = yMin + ratio((yMax - yMin) * i, yTickCount - 1);

      return {
        position: yScale(value),
        label: `${Math.round(ratio(value, 10_000)).toLocaleString('ja-JP')}万`,
      };
    }),
    xTicks: tickIndices(xTickCount).map((i) => {
      const x = xMin + ratio((xMax - xMin) * i, xTickCount - 1);

      return { position: xScale(x), label: `${Math.round(x)}歳` };
    }),
    zero: yScale(0),
  };
};

const ratio = (a: number, b: number): number =>
  Num.isNonZero(b) ? Num.div(a, b) : 0;

/** 1, 2, 5 × 10^n のうち `rough` 以上で最小のもの（0 以下なら 1）。 */
const niceStep = (rough: number): number => {
  if (rough <= 0) {
    return 1;
  }

  const base = 10 ** Math.floor(Math.log10(rough));

  return (
    [1, 2, 5, 10].map((m) => m * base).find((s) => s >= rough) ?? base * 10
  );
};
