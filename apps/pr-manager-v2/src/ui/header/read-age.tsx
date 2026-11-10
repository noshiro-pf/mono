import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { ReportStatus } from '../../store/index.mjs';
import { Age } from '../common/index.mjs';
import { Updating } from './updating.js';

/** The read's age alone, for the folded toolbar; nothing before a read. */
export const ReadAge = ({
  status,
  now,
}: Readonly<{
  status: InitializedObservable<ReportStatus>;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <If
    cond={status.pipe(map((s) => s.kind === 'ready'))}
    then={
      <span class={constant('muted')}>
        <Age
          at={status.pipe(map((s) => (s.kind === 'ready' ? s.readAtMs : 0)))}
          now={now}
        />

        <Updating status={status} />
      </span>
    }
  />
);
