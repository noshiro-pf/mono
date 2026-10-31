import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { TraceField } from './trace-field.jsx';
import { mutedStyle, panelStyle, panelTitleStyle } from './trace-shared.mjs';
import type { TraceStep } from './trace-step.mjs';

type Props = Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>;

export const TraceQueuePanel = React.memo<Props>(({ step, changed }) =>
  Arr.isEmpty(step.queues) ? (
    <section style={panelStyle}>
      <h4 style={panelTitleStyle}>{'UpdateQueue'}</h4>
      <span style={mutedStyle}>{'no update is open'}</span>
    </section>
  ) : (
    <>
      {step.queues.map((q) => {
        const key = (field: string): string =>
          `queue.${q.token}.${field}` as const;

        return (
          <section key={q.token} style={panelStyle}>
            <h4
              style={panelTitleStyle}
            >{`UpdateQueue ${q.token} (= token)`}</h4>
            <TraceField
              changed={changed.has(key('base'))}
              label={'#base'}
              value={q.base.toString()}
            />
            <TraceField
              changed={changed.has(key('buckets'))}
              label={'#buckets'}
              value={q.buckets}
            />
            <TraceField
              changed={changed.has(key('size'))}
              label={'#size'}
              value={q.size.toString()}
            />
            <TraceField
              changed={changed.has(key('isOpen'))}
              label={'#isOpen'}
              value={q.isOpen ? 'true' : 'false'}
            />
            <TraceField
              changed={changed.has(key('queuedDespiteMark'))}
              label={'#queuedDespiteMark'}
              value={q.queuedDespiteMark}
            />
          </section>
        );
      })}
    </>
  ),
);

TraceQueuePanel.displayName = 'TraceQueuePanel';
