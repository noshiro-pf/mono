import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { DagLayout } from '../../../domain/index.mjs';

export const DagFreeCaption = ({
  layout,
}: Readonly<{ layout: InitializedObservable<DagLayout> }>): JSX.Element => (
  <If
    cond={layout.pipe(map(({ freeCaptionY }) => freeCaptionY !== undefined))}
    then={
      <text
        class={constant('dag-caption')}
        x={constant('0')}
        y={layout.pipe(
          map(({ freeCaptionY }) => ((freeCaptionY ?? 0) + 16).toString()),
        )}
      >
        {constant('No dependencies drawn either way')}
      </text>
    }
  />
);
