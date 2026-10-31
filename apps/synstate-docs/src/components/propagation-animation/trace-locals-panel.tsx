import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { TraceField } from './trace-field.jsx';
import { mutedStyle, panelStyle, panelTitleStyle } from './trace-shared.mjs';
import type { TraceStep } from './trace-step.mjs';

type Props = Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>;

export const TraceLocalsPanel = React.memo<Props>(({ step, changed }) => (
  <section style={panelStyle}>
    <h4 style={panelTitleStyle}>{'locals'}</h4>
    {Arr.isEmpty(step.locals) ? (
      <span style={mutedStyle}>{'—'}</span>
    ) : (
      step.locals.map((l) => (
        <TraceField
          key={l.name}
          changed={changed.has(`local.${l.name}`)}
          label={l.name}
          value={l.value}
        />
      ))
    )}
  </section>
));

TraceLocalsPanel.displayName = 'TraceLocalsPanel';
