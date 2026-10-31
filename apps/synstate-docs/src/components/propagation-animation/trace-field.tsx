import * as React from 'react';
import {
  fieldNameStyle,
  valueChangedStyle,
  valueStyle,
} from './trace-shared.mjs';

type Props = Readonly<{ label: string; value: string; changed: boolean }>;

export const TraceField = React.memo<Props>(({ label, value, changed }) => (
  <div style={fieldStyle}>
    <span style={fieldNameStyle}>{label}</span>
    <span style={changed ? valueChangedStyle : valueStyle}>{value}</span>
  </div>
));

TraceField.displayName = 'TraceField';

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: 0,
} as const;
