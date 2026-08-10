/** @jsxImportSource preact */
// embed-sample-code-ignore-above
import { signal } from '@preact/signals';
import { debounce, map } from 'synstate';
import { fromSignal, toSignal } from 'synstate-preact-signals';

// Raw input signal (Preact Signal — updates immediately on every keystroke)
const inputSignal = signal('');

// Bridge: Signal → Observable (via fromSignal)
const [input$, _dispose] = fromSignal(inputSignal);

// Apply synstate operators on the observable side
const debouncedInput$ = input$.pipe(debounce(500));

// Bridge back: Observable → Signal (via toSignal)
const debouncedSignal = toSignal(debouncedInput$, '');

// Count how many times the debounced value has changed
const updateCount$ = debouncedInput$.pipe(map((_, i) => i + 1));

const updateCountSignal = toSignal(updateCount$);

// Track input length as a derived observable
const inputLength$ = input$.pipe(map((s) => s.length));

const inputLengthSignal = toSignal(inputLength$);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SignalBridgeDemo = (): preact.JSX.Element => (
  <div>
    <div style={inputRowStyle}>
      <label style={labelStyle}>
        {'Input (Preact Signal): '}
        <input
          style={inputStyle}
          type={'text'}
          placeholder={'Type something...'}
          value={inputSignal}
          onInput={(e) => {
            // eslint-disable-next-line functional/immutable-data, total-functions/no-unsafe-type-assertion
            inputSignal.value = (e.target as HTMLInputElement).value;
          }}
        />
      </label>
    </div>

    <div style={gridStyle}>
      <div style={cellStyle}>
        <div style={cellLabelStyle}>{'Raw signal value'}</div>
        <div style={cellValueStyle}>{inputSignal}</div>
      </div>
      <div style={cellStyle}>
        <div style={cellLabelStyle}>{'Debounced (500ms)'}</div>
        <div style={cellValueStyle}>{debouncedSignal}</div>
      </div>
      <div style={cellStyle}>
        <div style={cellLabelStyle}>{'Input length (map)'}</div>
        <div style={cellValueStyle}>{inputLengthSignal}</div>
      </div>
      <div style={cellStyle}>
        <div style={cellLabelStyle}>{'Debounce update count (map)'}</div>
        <div style={cellValueStyle}>{updateCountSignal}</div>
      </div>
    </div>

    <div style={pipelineStyle}>
      <code style={codeStyle}>
        {'Signal → fromSignal → debounce(500) → toSignal'}
      </code>
      <br />
      <code style={codeStyle}>
        {'Signal → fromSignal → map(s => s.length) → toSignal'}
      </code>
      <br />
      <code style={codeStyle}>
        {'Signal → fromSignal → debounce(500) → map(index) → toSignal'}
      </code>
    </div>
  </div>
);

// embed-sample-code-ignore-below

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const inputRowStyle: preact.CSSProperties = {
  marginBottom: '16px',
} as const;

const labelStyle: preact.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
} as const;

const inputStyle: preact.CSSProperties = {
  flex: 1,
  padding: '6px 10px',
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '4px',
  fontSize: '14px',
  background: 'var(--sl-color-bg, #fff)',
  color: 'var(--sl-color-text, #1a1a2e)',
} as const;

const gridStyle: preact.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '16px',
} as const;

const cellStyle: preact.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '6px',
  padding: '12px',
  marginTop: 0, // override astro starlight default style
} as const;

const cellLabelStyle: preact.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

const cellValueStyle: preact.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'monospace',
  minHeight: '24px',
  wordBreak: 'break-all',
} as const;

const pipelineStyle: preact.CSSProperties = {
  padding: '12px',
  background: 'var(--sl-color-bg-nav, #f5f5f5)',
  borderRadius: '6px',
  fontSize: '12px',
  lineHeight: 2,
} as const;

const codeStyle: preact.CSSProperties = {
  fontFamily: 'monospace',
  color: 'var(--sl-color-text, #1a1a2e)',
} as const;
