import * as React from 'react';
import { Arr, asSafeUint, range } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './adapters/index.mjs';
import { type Point, type SpringAdapter } from './types.mjs';

type Props = Readonly<{
  adapter: SpringAdapter;
  chainDepth: SafeUint;
}>;

export const SnakeCanvas = React.memo<Props>((props) => {
  const { adapter, chainDepth } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [stats, setStats] = React.useState<Stats>(INITIAL_STATS);

  // Re-setup adapter when chainDepth changes
  React.useEffect(() => {
    let mut_active = true;

    adapter.setup(chainDepth, {
      onEmit: (points) => {
        if (!mut_active) return;

        const t0 = performance.now();

        const mut_ctx = canvasRef.current?.getContext('2d') ?? undefined;

        if (mut_ctx !== undefined) {
          drawSnake(mut_ctx, points);
        }

        const elapsed = (performance.now() - t0) * 1000; // to microseconds

        setStats((prev) => ({
          totalUpdates: prev.totalUpdates + 1,
          totalMicroseconds: prev.totalMicroseconds + elapsed,
        }));
      },
    });

    return () => {
      mut_active = false;

      adapter.cleanup();
    };
  }, [adapter, chainDepth]);

  const handleMouseMove = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (canvas === null) return;

      const rect = canvas.getBoundingClientRect();

      // Scale mouse coordinates from CSS display size to canvas internal resolution
      // eslint-disable-next-line total-functions/no-partial-division
      const scaleX = CANVAS_WIDTH / rect.width;

      // eslint-disable-next-line total-functions/no-partial-division
      const scaleY = CANVAS_HEIGHT / rect.height;

      adapter.onMouseMove({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      });
    },
    [adapter],
  );

  const handleMouseLeave = React.useCallback(() => {
    adapter.onMouseMove({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  }, [adapter]);

  const avgMicroseconds =
    stats.totalUpdates > 0
      ? // eslint-disable-next-line total-functions/no-partial-division
        (stats.totalMicroseconds / stats.totalUpdates).toFixed(1)
      : '0.0';

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{adapter.name}</h3>
      <canvas
        ref={canvasRef}
        height={CANVAS_HEIGHT}
        style={canvasStyle}
        width={CANVAS_WIDTH}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      />
      <div style={statsContainerStyle}>
        <div>{`Total updates: ${stats.totalUpdates}`}</div>
        <div>{`Avg μs/update: ${avgMicroseconds}`}</div>
      </div>
    </div>
  );
});

SnakeCanvas.displayName = 'SnakeCanvas';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
  minWidth: 0,
  marginTop: 0, // overrides astro starlight default style
} as const;

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
} as const;

const canvasStyle: React.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #d1d5db)',
  borderRadius: '6px',
  background: 'var(--sl-color-bg-nav, #fff)',
  cursor: 'crosshair',
  width: '100%',
  height: 'auto',
} as const;

const statsContainerStyle: React.CSSProperties = {
  fontSize: '11px',
  fontFamily: 'monospace',
  lineHeight: 1.6,
  textAlign: 'left',
  width: '100%',
  padding: '0 4px',
} as const;

type Stats = Readonly<{
  totalUpdates: number;
  totalMicroseconds: number;
}>;

const INITIAL_STATS: Stats = {
  totalUpdates: 0,
  totalMicroseconds: 0,
} as const;

const HEAD_RADIUS = 5;

const TAIL_MIN_RADIUS = 1.5;

const drawSnake = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_ctx: CanvasRenderingContext2D,
  points: readonly Point[],
): void => {
  mut_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (Arr.isEmpty(points)) return;

  const segmentCount = asSafeUint(points.length);

  // Draw tail segments (lines connecting dots)
  if (Arr.isMinLengthArray(2, points)) {
    mut_ctx.beginPath();

    mut_ctx.moveTo(points[0].x, points[0].y);

    for (const i of range(1, segmentCount)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_ctx.lineTo(points[i]!.x, points[i]!.y);
    }

    mut_ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';

    mut_ctx.lineWidth = 1;

    mut_ctx.stroke();
  }

  // Draw dots at each stage position (tail first, head last so it's on top)
  for (let mut_i = segmentCount - 1; mut_i >= 0; mut_i--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const point = points[mut_i]!;

    // eslint-disable-next-line total-functions/no-partial-division
    const t = segmentCount > 1 ? mut_i / (segmentCount - 1) : 0;

    const radius = HEAD_RADIUS - t * (HEAD_RADIUS - TAIL_MIN_RADIUS);

    const alpha = 1 - t * 0.7;

    mut_ctx.beginPath();

    mut_ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);

    mut_ctx.fillStyle =
      mut_i === 0
        ? `rgba(59, 130, 246, ${String(alpha)})`
        : `rgba(147, 197, 253, ${String(alpha)})`;

    mut_ctx.fill();
  }
};
