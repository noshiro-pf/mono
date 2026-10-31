import * as React from 'react';
import { colors, monoFont, nodeFields } from './trace-shared.mjs';
import type { TraceStep } from './trace-step.mjs';

type Props = Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>;

export const TraceNodesTable = React.memo<Props>(({ step, changed }) => (
  <div style={tableWrapStyle}>
    <table style={tableStyle}>
      <thead>
        <tr>
          {nodeColumns.map((col) => (
            <th key={col} style={thStyle}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {step.nodes.map((n) => (
          <tr
            key={n.id}
            style={step.activeNode === n.id ? activeRowStyle : undefined}
          >
            <td style={tdStyle}>{n.id}</td>
            <td style={tdStyle}>{n.depth.toString()}</td>
            {nodeFields.map((field) => (
              <td
                key={field}
                style={
                  changed.has(`${n.id}.${field}`) ? tdChangedStyle : tdStyle
                }
              >
                {n[field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

TraceNodesTable.displayName = 'TraceNodesTable';

const nodeColumns = ['node', 'depth', ...nodeFields] as const;

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  marginTop: 0,
} as const;

const tableStyle: React.CSSProperties = {
  width: '100%',
  margin: 0,
  borderCollapse: 'collapse',
  fontFamily: monoFont,
  fontSize: '0.78rem',
  background: colors.background,
  color: colors.text,
  borderRadius: '6px',
} as const;

const thStyle: React.CSSProperties = {
  padding: '0.25rem 0.6rem',
  textAlign: 'left',
  color: colors.muted,
  fontWeight: 700,
  borderBottom: `1px solid ${colors.edge}`,
} as const;

const tdStyle: React.CSSProperties = {
  padding: '0.2rem 0.6rem',
  border: 'none',
  transition: 'background 300ms ease',
} as const;

const tdChangedStyle: React.CSSProperties = {
  ...tdStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

const activeRowStyle: React.CSSProperties = {
  outline: `2px solid ${colors.active}`,
  outlineOffset: '-2px',
} as const;
