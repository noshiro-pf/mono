/** @jsxImportSource preact */
// embed-sample-code-ignore-above
import * as Preact from 'preact/hooks';
import { createState as createStateBase } from 'synstate';
import { useObservableValue } from 'synstate-preact-hooks';
import { toSignal } from 'synstate-preact-signals';

// Shared observable state — both panels read from the same source
const [
  sharedCount$,
  ,
  { updateState: updateSharedCount, resetState: resetSharedCount },
] = createStateBase(0);

const decrement = (): void => {
  updateSharedCount((n) => n - 1);
};

const increment = (): void => {
  updateSharedCount((n) => n + 1);
};

// Signal version of the same state
const countSignal = toSignal(sharedCount$);

// ---------------------------------------------------------------------------
// Combined Demo
// ---------------------------------------------------------------------------

export const RenderCountDemo = (): preact.JSX.Element => (
  <div>
    <div style={panelsRowStyle}>
      <HooksPanel />
      <SignalsPanel />
    </div>
    <div style={controlsStyle}>
      <button style={buttonStyle} type={'button'} onClick={decrement}>
        {'-1'}
      </button>
      <button style={buttonStyle} type={'button'} onClick={increment}>
        {'+1'}
      </button>
      <button style={buttonStyle} type={'button'} onClick={resetSharedCount}>
        {'Reset'}
      </button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Hooks Panel — re-renders the entire component on every change
// ---------------------------------------------------------------------------

const HooksPanel = (): preact.JSX.Element => {
  const count = useObservableValue(sharedCount$);

  // Count renders via a ref that increments on every function body execution
  const renderCountRef = Preact.useRef(0);

  renderCountRef.current += 1;

  return (
    <div style={panelStyle}>
      <div style={panelTitleStyle}>{'synstate-preact-hooks'}</div>
      <div style={valueStyle}>{count}</div>
      <div style={renderCountStyle}>
        {'Render count: '}
        <strong>{renderCountRef.current}</strong>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Signals Panel — renders once, only the Signal text nodes update
// ---------------------------------------------------------------------------

const SignalsPanel = (): preact.JSX.Element => {
  // Count renders — this should stay at 1
  const renderCountRef = Preact.useRef(0);

  renderCountRef.current += 1;

  return (
    <div style={panelStyle}>
      <div style={panelTitleStyle}>{'synstate-preact-signals'}</div>
      <div style={valueStyle}>{countSignal}</div>
      <div style={renderCountStyle}>
        {'Render count: '}
        <strong>{renderCountRef.current}</strong>
      </div>
    </div>
  );
};

// embed-sample-code-ignore-below

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const panelsRowStyle: preact.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '12px',
} as const;

const panelStyle: preact.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '6px',
  padding: '16px',
  textAlign: 'center',
  marginTop: 0, // overrides astro starlight default style
} as const;

const panelTitleStyle: preact.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginBottom: '8px',
  fontFamily: 'monospace',
} as const;

const valueStyle: preact.CSSProperties = {
  fontSize: '36px',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: '8px',
} as const;

const renderCountStyle: preact.CSSProperties = {
  fontSize: '13px',
  color: 'var(--sl-color-gray-3, #6b7280)',
} as const;

const controlsStyle: preact.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
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
