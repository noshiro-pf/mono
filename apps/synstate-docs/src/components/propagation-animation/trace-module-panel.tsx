import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { TraceBucketSet } from './trace-bucket-set.jsx';
import { TraceField } from './trace-field.jsx';
import { panelStyle, panelTitleStyle } from './trace-shared.mjs';
import type { TraceStep } from './trace-step.mjs';

type Props = Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>;

export const TraceModulePanel = React.memo<Props>((props) => {
  const { step, changed } = props;

  const m = step.module;

  return (
    <section style={panelStyle}>
      <h4 style={panelTitleStyle}>{'propagation-state.mts'}</h4>
      <TraceField
        changed={changed.has('propagationDepth')}
        label={'propagation.depth'}
        value={m.propagationDepth.toString()}
      />
      <TraceField
        changed={changed.has('outermostToken')}
        label={'propagation.outermostToken'}
        value={m.outermostToken}
      />
      <TraceField
        changed={changed.has('level')}
        label={'queueState.level'}
        value={m.level.toString()}
      />
      {Arr.isEmpty(m.bucketSets) ? (
        <TraceField changed={false} label={'bucketSets'} value={'[]'} />
      ) : (
        m.bucketSets.map((set, level) => (
          <TraceBucketSet
            // eslint-disable-next-line react/no-array-index-key -- a bucket set is identified by its level
            key={level}
            changed={changed}
            level={level}
            set={set}
          />
        ))
      )}
    </section>
  );
});

TraceModulePanel.displayName = 'TraceModulePanel';
