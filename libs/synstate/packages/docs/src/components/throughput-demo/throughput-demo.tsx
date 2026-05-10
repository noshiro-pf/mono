import * as React from 'react';
import { asSafeUint } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  createJotaiThroughputAdapter,
  createMobXThroughputAdapter,
  createSynStateThroughputAdapter,
} from './adapters/index.mjs';
import { ThroughputCanvas } from './throughput-canvas.js';

export const ThroughputDemo = React.memo(() => {
  const [chainDepth, setChainDepth] = React.useState<SafeUint>(
    asSafeUint(DEFAULT_CHAIN_DEPTH),
  );

  const [ticksPerFrame, setTicksPerFrame] = React.useState(DEFAULT_TICKS);

  const [runningMap, setRunningMap] = React.useState<
    Readonly<Record<string, boolean>>
  >({});

  const handleDepthChange = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setChainDepth(asSafeUint(Number(e.target.value)));
    },
    [],
  );

  const handleTicksChange = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTicksPerFrame(Number(e.target.value));
    },
    [],
  );

  const toggleHandlers = React.useMemo(
    () =>
      new Map(
        adapters.map((adapter) => [
          adapter.name,
          () => {
            setRunningMap((prev) => ({
              ...prev,
              [adapter.name]: !(prev[adapter.name] ?? false),
            }));
          },
        ]),
      ),
    [],
  );

  return (
    <div>
      <div style={controlRowStyle}>
        <label style={labelStyle}>
          {'Chain depth (M): '}
          {chainDepth}
        </label>
        <input
          max={MAX_DEPTH}
          min={MIN_DEPTH}
          step={10}
          style={sliderStyle}
          type={'range'}
          value={chainDepth}
          onChange={handleDepthChange}
        />
      </div>
      <div style={controlRowStyle2}>
        <label style={labelStyle}>
          {'Ticks / frame (K): '}
          {ticksPerFrame}
        </label>
        <input
          max={MAX_TICKS}
          min={MIN_TICKS}
          step={10}
          style={sliderStyle}
          type={'range'}
          value={ticksPerFrame}
          onChange={handleTicksChange}
        />
      </div>
      <div style={canvasesContainerStyle}>
        {adapters.map((adapter) => {
          const handler = toggleHandlers.get(adapter.name);

          if (handler === undefined) return undefined;

          return (
            <ThroughputCanvas
              key={adapter.name}
              adapter={adapter}
              chainDepth={chainDepth}
              running={runningMap[adapter.name] ?? false}
              ticksPerFrame={ticksPerFrame}
              onToggle={handler}
            />
          );
        })}
      </div>
      <p style={descriptionStyle}>
        {'A ball orbits automatically. K source updates are pushed through a'}
        {
          'depth-M reactive chain each frame. Increase K to see per-update overhead'
        }
        {'diverge.'}
      </p>
    </div>
  );
});

ThroughputDemo.displayName = 'ThroughputDemo';

const adapters = [
  createSynStateThroughputAdapter(),
  createJotaiThroughputAdapter(),
  createMobXThroughputAdapter(),
] as const;

const DEFAULT_CHAIN_DEPTH = 50;

const MIN_DEPTH = 10;

const MAX_DEPTH = 200;

const DEFAULT_TICKS = 100;

const MIN_TICKS = 1;

const MAX_TICKS = 1000;

const controlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '8px',
  flexWrap: 'wrap',
} as const;

const controlRowStyle2: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '16px',
  flexWrap: 'wrap',
} as const;

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontFamily: 'monospace',
} as const;

const sliderStyle: React.CSSProperties = {
  width: '200px',
} as const;

const canvasesContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  justifyContent: 'center',
  alignItems: 'flex-start',
  userSelect: 'none',
  padding: '16px 0',
} as const;

const descriptionStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '14px',
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginTop: '8px',
} as const;
