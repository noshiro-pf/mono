/* eslint-disable @typescript-eslint/strict-void-return */
/** @jsxImportSource preact */
// embed-sample-code-ignore-above
import { map } from 'synstate';
import {
  createBooleanState,
  createState,
  toSignal,
} from 'synstate-preact-signals';

// State: counter
const [
  countSignal,
  _setCount,
  { state: count$, updateState, resetState, getSnapshot },
] = createState(0);

const decrement = (): void => {
  updateState((n) => n - 1);
};

const increment = (): void => {
  updateState((n) => n + 1);
};

// Derived: doubled value via map + toSignal
const doubledSignal = toSignal(count$.pipe(map((n) => n * 2)));

// State: visibility toggle via createBooleanState
const [isVisibleSignal, { toggle: toggleVisibility }] =
  createBooleanState(true);

export const CounterDemo = (): preact.JSX.Element => (
  <div>
    <div style={rowStyle}>
      <span style={labelStyle}>{'Count:'}</span>
      <span style={valueStyle}>{countSignal}</span>
    </div>
    <div style={rowStyle}>
      <span style={labelStyle}>{'Doubled (map + toSignal):'}</span>
      <span style={valueStyle}>{doubledSignal}</span>
    </div>
    <div style={rowStyle}>
      <span style={labelStyle}>{'Visible (createBooleanState):'}</span>
      <span style={valueStyle}>{isVisibleSignal.value ? 'Yes' : 'No'}</span>
    </div>
    {isVisibleSignal.value ? (
      <div style={boxStyle}>
        {'This box is controlled by createBooleanState.'}
      </div>
    ) : undefined}
    <div style={controlsStyle}>
      <button style={buttonStyle} type={'button'} onClick={decrement}>
        {'-1'}
      </button>
      <button style={buttonStyle} type={'button'} onClick={increment}>
        {'+1'}
      </button>
      <button style={buttonStyle} type={'button'} onClick={resetState}>
        {'Reset'}
      </button>
      <button style={buttonStyle} type={'button'} onClick={toggleVisibility}>
        {'Toggle Visibility'}
      </button>
      <button
        style={buttonStyle}
        type={'button'}
        onClick={() => {
          // eslint-disable-next-line no-alert
          alert(`getSnapshot() = ${String(getSnapshot())}`);
        }}
      >
        {'getSnapshot()'}
      </button>
    </div>
  </div>
);

// embed-sample-code-ignore-below

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const rowStyle: preact.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginBottom: '8px',
} as const;

const labelStyle: preact.CSSProperties = {
  fontSize: '13px',
  color: 'var(--sl-color-gray-3, #6b7280)',
  minWidth: '180px',
} as const;

const valueStyle: preact.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
} as const;

const boxStyle: preact.CSSProperties = {
  padding: '12px',
  marginBottom: '12px',
  background: 'var(--sl-color-bg-nav, #f0f7ff)',
  border: '1px solid var(--sl-color-accent, #3b82f6)',
  borderRadius: '6px',
  fontSize: '13px',
} as const;

const controlsStyle: preact.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
} as const;

const buttonStyle: preact.CSSProperties = {
  padding: '6px 16px',
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '4px',
  background: 'var(--sl-color-bg-nav, #f5f5f5)',
  color: 'var(--sl-color-text, #1a1a2e)',
  fontSize: '14px',
  cursor: 'pointer',
  marginTop: 0, // overrides astro starlight default style
} as const;
