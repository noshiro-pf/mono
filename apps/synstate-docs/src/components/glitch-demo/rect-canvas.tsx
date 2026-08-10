import * as React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './adapters/index.mjs';
import { type Adapter, type Point } from './types.mjs';

type Props = Readonly<{
  adapter: Adapter;
}>;

export const RectCanvas = React.memo<Props>((props) => {
  const { adapter } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const latestPosRef = React.useRef<Point>({ x: -1, y: -1 });

  const isDraggingRef = React.useRef(false);

  const [stats, setStats] = React.useState<Stats>(INITIAL_STATS);

  // Setup adapter once on mount
  React.useEffect(() => {
    adapter.setup({
      onEmit: (pos) => {
        if (!isDraggingRef.current) return;

        if (pos.x < 0 || pos.y < 0) return;

        const t0 = performance.now();

        const latestPos = latestPosRef.current;

        const glitch = pos.x !== latestPos.x || pos.y !== latestPos.y;

        const mut_ctx = canvasRef.current?.getContext('2d') ?? undefined;

        if (mut_ctx !== undefined) {
          mut_ctx.beginPath();

          mut_ctx.arc(pos.x, pos.y, DOT_RADIUS, 0, Math.PI * 2);

          mut_ctx.fillStyle = glitch ? COLOR_GLITCH : COLOR_NORMAL;

          mut_ctx.fill();
        }

        const elapsed = (performance.now() - t0) * 1000; // to microseconds

        setStats((prev) => ({
          totalUpdates: prev.totalUpdates + 1,
          glitches: prev.glitches + (glitch ? 1 : 0),
          totalMicroseconds: prev.totalMicroseconds + elapsed,
        }));
      },
    });

    return () => {
      adapter.cleanup();
    };
  }, [adapter]);

  const getCanvasPos = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;

      if (canvas === null) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();

      // Scale from display size to canvas resolution
      // eslint-disable-next-line total-functions/no-partial-division
      const scaleX = CANVAS_WIDTH / rect.width;

      // eslint-disable-next-line total-functions/no-partial-division
      const scaleY = CANVAS_HEIGHT / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const handleMouseDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      // Clear canvas for new drag
      const ctx = canvasRef.current?.getContext('2d');

      ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      setStats(INITIAL_STATS);

      isDraggingRef.current = true;

      const pos = getCanvasPos(e);

      latestPosRef.current = pos;

      adapter.onMouseMove(pos);
    },
    [adapter, getCanvasPos],
  );

  const handleMouseMove = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) return;

      const pos = getCanvasPos(e);

      latestPosRef.current = pos;

      adapter.onMouseMove(pos);
    },
    [adapter, getCanvasPos],
  );

  const handleMouseUp = React.useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const avgMicroseconds =
    stats.totalUpdates > 0
      ? // eslint-disable-next-line total-functions/no-partial-division
        (stats.totalMicroseconds / stats.totalUpdates).toFixed(1)
      : '0.0';

  const glitchStyle = React.useMemo<React.CSSProperties>(
    () => ({
      color: stats.glitches > 0 ? '#ef4444' : 'inherit',
      fontWeight: stats.glitches > 0 ? 700 : 400,
    }),
    [stats.glitches],
  );

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{adapter.name}</h3>
      <canvas
        ref={canvasRef}
        height={CANVAS_HEIGHT}
        style={canvasStyle}
        width={CANVAS_WIDTH}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div style={statsContainerStyle}>
        <div>
          {'Total updates: '}
          {stats.totalUpdates}
        </div>
        <div style={glitchStyle}>
          {'Glitches: '}
          {stats.glitches}
        </div>
        <div>
          {'Avg μs/update: '}
          {avgMicroseconds}
        </div>
      </div>
    </div>
  );
});

RectCanvas.displayName = 'RectCanvas';

const DOT_RADIUS = 2.5;

const COLOR_NORMAL = 'rgba(59, 130, 246, 0.7)';

const COLOR_GLITCH = 'rgba(239, 68, 68, 0.7)';

const INITIAL_STATS: Stats = {
  totalUpdates: 0,
  glitches: 0,
  totalMicroseconds: 0,
} as const;

type Stats = Readonly<{
  totalUpdates: number;
  glitches: number;
  totalMicroseconds: number;
}>;

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
