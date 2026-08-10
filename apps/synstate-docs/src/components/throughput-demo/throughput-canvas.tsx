import * as React from 'react';
import { Arr, asSafeUint, range } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import { type Point, type SpringAdapter } from '../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './adapters/index.mjs';

type Props = Readonly<{
  adapter: SpringAdapter;
  chainDepth: SafeUint;
  ticksPerFrame: number;
  running: boolean;
  onToggle: () => void;
}>;

export const ThroughputCanvas = React.memo<Props>((props) => {
  const { adapter, chainDepth, ticksPerFrame, running, onToggle } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const adapterStateRef = React.useRef({
    lastPoints: [] as readonly Point[],
    angle: 0,
    totalTicks: 0,
  });

  const [stats, setStats] = React.useState<Stats>(INITIAL_STATS);

  // Setup adapter when chainDepth changes
  React.useEffect(() => {
    adapterStateRef.current.lastPoints = [];

    adapterStateRef.current.angle = 0;

    adapterStateRef.current.totalTicks = 0;

    setStats(INITIAL_STATS);

    adapter.setup(chainDepth, {
      onEmit: (points) => {
        adapterStateRef.current.lastPoints = points;
      },
    });

    return () => {
      adapter.cleanup();
    };
  }, [adapter, chainDepth]);

  // rAF loop — only active when running
  React.useEffect(() => {
    if (!running) return;

    let mut_active = true;

    let mut_rafId = 0;

    const mut_state = adapterStateRef.current;

    const cx = CANVAS_WIDTH / 2;

    const cy = CANVAS_HEIGHT / 2;

    const tick = (): void => {
      if (!mut_active) return;

      const mut_ctx = canvasRef.current?.getContext('2d');

      if (mut_ctx == null) {
        mut_rafId = requestAnimationFrame(tick);

        return;
      }

      const prevAngle = mut_state.angle;

      const t0 = performance.now();

      // Run K ticks per frame — this is the hot loop that amplifies
      // per-update overhead differences between libraries
      for (const k of range(0, asSafeUint(ticksPerFrame))) {
        // eslint-disable-next-line total-functions/no-partial-division
        const angle = prevAngle + (k / ticksPerFrame) * ORBIT_SPEED;

        adapter.onMouseMove({
          x: cx + ORBIT_RADIUS * Math.cos(angle),
          y: cy + ORBIT_RADIUS * Math.sin(angle),
        });
      }

      const elapsed = performance.now() - t0;

      mut_state.angle += ORBIT_SPEED;

      mut_state.totalTicks += ticksPerFrame;

      // Single draw per frame (onEmit only records points, doesn't draw)
      drawSnake(mut_ctx, mut_state.lastPoints);

      setStats({
        msPerFrame: elapsed,
        totalTicks: mut_state.totalTicks,
      });

      mut_rafId = requestAnimationFrame(tick);
    };

    mut_rafId = requestAnimationFrame(tick);

    return () => {
      mut_active = false;

      cancelAnimationFrame(mut_rafId);
    };
  }, [running, chainDepth, ticksPerFrame, adapter]);

  const msColor = stats.msPerFrame > 16 ? '#ef4444' : 'inherit';

  const msFrameStyle = React.useMemo<React.CSSProperties>(
    () => ({ color: msColor }),
    [msColor],
  );

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{adapter.name}</div>
      <canvas
        ref={canvasRef}
        height={CANVAS_HEIGHT}
        style={canvasStyle}
        width={CANVAS_WIDTH}
      />
      <button style={buttonStyle} type={'button'} onClick={onToggle}>
        {running ? 'Stop' : 'Start'}
      </button>
      <div style={statsContainerStyle}>
        <div style={msFrameStyle}>
          {'ms/frame: '}
          {stats.msPerFrame.toFixed(1)}
        </div>
        <div>
          {'Total ticks: '}
          {stats.totalTicks}
        </div>
      </div>
    </div>
  );
});

ThroughputCanvas.displayName = 'ThroughputCanvas';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  marginTop: 0, // overrides astro starlight default style
} as const;

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
} as const;

const canvasStyle: React.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #d1d5db)',
  borderRadius: '6px',
  background: 'var(--sl-color-bg-nav, #fff)',
} as const;

const buttonStyle: React.CSSProperties = {
  padding: '4px 16px',
  fontSize: '13px',
  fontFamily: 'monospace',
  cursor: 'pointer',
  borderRadius: '4px',
  border: '1px solid var(--sl-color-gray-5, #d1d5db)',
  background: 'var(--sl-color-bg-nav, #fff)',
  color: 'inherit',
} as const;

const statsContainerStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'monospace',
  lineHeight: 1.6,
  textAlign: 'left',
  width: '100%',
  padding: '0 4px',
} as const;

type Stats = Readonly<{
  msPerFrame: number;
  totalTicks: number;
}>;

const INITIAL_STATS: Stats = {
  msPerFrame: 0,
  totalTicks: 0,
} as const;

const ORBIT_RADIUS = 120;

const ORBIT_SPEED = 0.02; // radians per frame

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
