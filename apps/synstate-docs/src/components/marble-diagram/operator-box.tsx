import * as React from 'react';

type Props = Readonly<{ label: string }>;

export const OperatorBox = React.memo<Props>(({ label }) => (
  <div style={operatorBoxStyle}>{label}</div>
));

OperatorBox.displayName = 'OperatorBox';

const operatorBoxStyle: React.CSSProperties = {
  border: '1px solid var(--sl-color-gray-5, #d1d5db)',
  borderRadius: '6px',
  padding: '6px 16px',
  textAlign: 'center',
  fontFamily: 'ui-monospace, monospace',
  fontSize: '14px',
  color: 'var(--sl-color-text, #1a1a2e)',
  margin: '4px 0',
} as const;
