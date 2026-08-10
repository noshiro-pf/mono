import * as React from 'react';
import { OperatorBox } from './operator-box.jsx';
import { Timeline } from './timeline.jsx';
import { type TimelineDef } from './types.mjs';

type Props = Readonly<{
  inputs: readonly TimelineDef[];
  output: TimelineDef;
  operator: string; // e.g. "map(x => 10 * x)"
}>;

export const MarbleDiagram = React.memo<Props>((props) => {
  const inputsWithKey = React.useMemo(
    () =>
      props.inputs.map((input) => ({ key: JSON.stringify(input), ...input })),
    [props.inputs],
  );

  return (
    <div style={diagramContainerStyle}>
      {inputsWithKey.map(({ key, ...input }) => (
        <Timeline key={key} def={input} />
      ))}
      <OperatorBox label={props.operator} />
      <Timeline def={props.output} />
    </div>
  );
});

MarbleDiagram.displayName = 'MarbleDiagram';

const diagramContainerStyle: React.CSSProperties = {
  padding: '8px 0',
} as const;
