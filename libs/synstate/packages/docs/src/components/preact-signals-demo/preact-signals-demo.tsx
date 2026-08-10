/** @jsxImportSource preact */
import { CounterDemo } from './counter-demo.jsx';
import { RenderCountDemo } from './render-count-demo.jsx';
import { SignalBridgeDemo } from './signal-bridge-demo.jsx';

export const PreactSignalsDemo = (): preact.JSX.Element => (
  <div style={rootStyle}>
    <section style={sectionStyle}>
      <h3 style={headingStyle}>{'Demo 1: Render Count — Hooks vs Signals'}</h3>
      <p style={descStyle}>
        {
          'Both panels share the same synstate observable. The hooks panel re-renders the entire component on every state change, incrementing the render count. The signals panel renders once — only the text node for the count value is updated by Preact Signals.'
        }
      </p>
      <RenderCountDemo />
    </section>

    <section style={sectionStyle}>
      <h3 style={headingStyle}>
        {'Demo 2: Counter — createState with Signals'}
      </h3>
      <p style={descStyle}>
        {
          'Tests createState, createBooleanState, and derived signals via map + toSignal. The counter value and its doubled derivation are displayed as signals. The visibility toggle uses createBooleanState.'
        }
      </p>
      <CounterDemo />
    </section>

    <section style={sectionStyle}>
      <h3 style={headingStyle}>{'Demo 3: Signal ↔ Observable Bridge'}</h3>
      <p style={descStyle}>
        {
          'Type in the input to test fromSignal → debounce → toSignal. The raw signal value updates instantly while the debounced observable value updates after 500ms of inactivity.'
        }
      </p>
      <SignalBridgeDemo />
    </section>
  </div>
);

const rootStyle: preact.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
} as const;

const sectionStyle: preact.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #c9c9c9)',
  borderRadius: '8px',
  padding: '20px',
  background: 'var(--sl-color-bg, #fff)',
} as const;

const headingStyle: preact.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '16px',
  fontWeight: 600,
} as const;

const descStyle: preact.CSSProperties = {
  margin: '0 0 16px',
  fontSize: '13px',
  color: 'var(--sl-color-gray-3, #6b7280)',
  lineHeight: 1.6,
} as const;
