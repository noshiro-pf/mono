import * as React from 'react';
import { Num, Result, asSafeUint } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  createJotaiSpringAdapter,
  createMobXSpringAdapter,
  createRxJSSpringAdapter,
  createSynStateSpringAdapter,
} from './adapters/index.mjs';
import { SnakeCanvas } from './snake-canvas.js';

export const SpringDemo = React.memo(() => {
  const [chainDepth, setChainDepth] = React.useState<SafeUint>(
    asSafeUint(DEFAULT_CHAIN_DEPTH),
  );

  const handleDepthChange = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setChainDepth(
        asSafeUint(
          Result.unwrapOkOr(Num.safeParseFloat(e.target.value), Number.NaN),
        ),
      );
    },
    [],
  );

  return (
    <div>
      <div style={controlsContainerStyle}>
        <label style={labelStyle}>{`Chain depth (N): ${chainDepth}`}</label>
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
      <div style={canvasesContainerStyle}>
        {adapters.map((adapter) => (
          <SnakeCanvas
            key={adapter.name}
            adapter={adapter}
            chainDepth={chainDepth}
          />
        ))}
      </div>
      <p style={descriptionStyle}>
        {
          'Move your mouse over each canvas. The snake tail has N segments, each a stage in a reactive scan chain. Increase N to see performance diverge.'
        }
      </p>
    </div>
  );
});

SpringDemo.displayName = 'SpringDemo';

const DEFAULT_CHAIN_DEPTH = 50;

const MIN_DEPTH = 10;

const MAX_DEPTH = 500;

const adapters = [
  createSynStateSpringAdapter(),
  createRxJSSpringAdapter(),
  createJotaiSpringAdapter(),
  createMobXSpringAdapter(),
] as const;

const controlsContainerStyle: React.CSSProperties = {
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
  width: '240px',
} as const;

const canvasesContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  userSelect: 'none',
  padding: '16px 0',
} as const;

const descriptionStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '14px',
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginTop: '8px',
} as const;
