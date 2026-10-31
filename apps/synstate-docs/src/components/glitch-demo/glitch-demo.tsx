import * as React from 'react';
import { threeUpGrid } from '../three-up-grid.mjs';
import {
  createJotaiAdapter,
  createMobXAdapter,
  createPreactSignalsAdapter,
  createRxJSAdapter,
  createSolidAdapter,
  createSynStateAdapter,
} from './adapters/index.mjs';
import { RectCanvas } from './rect-canvas.js';

export const GlitchDemo = React.memo(() => (
  <div>
    <div style={containerStyle}>
      {adapters.map((adapter) => (
        <RectCanvas key={adapter.name} adapter={adapter} />
      ))}
    </div>
    <p style={descriptionStyle}>
      {
        "Click and drag on each canvas to draw a trail. Each dot is placed by the library's reactive pipeline. Blue = consistent, Red = glitch (one axis updated before the other)."
      }
    </p>
  </div>
));

GlitchDemo.displayName = 'GlitchDemo';

const adapters = [
  createSynStateAdapter(),
  createRxJSAdapter(),
  createJotaiAdapter(),
  createMobXAdapter(),
  createPreactSignalsAdapter(),
  createSolidAdapter(),
] as const;

const containerStyle: React.CSSProperties = {
  ...threeUpGrid(12),
  userSelect: 'none',
  padding: '16px 0',
} as const;

const descriptionStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '14px',
  color: 'var(--sl-color-gray-3, #6b7280)',
  marginTop: '8px',
} as const;
