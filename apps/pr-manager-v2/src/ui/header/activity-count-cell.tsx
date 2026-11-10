import { combine, map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import {
  activitySearchUrl,
  type ActivityKind,
  type DayActivity,
  type Repo,
} from '../../domain/index.mjs';
import { ExternalLink } from '../common/index.mjs';

export const ActivityCountCell = ({
  day,
  kind,
  most,
  repo,
}: Readonly<{
  day: InitializedObservable<DayActivity>;
  kind: ActivityKind;
  most: InitializedObservable<number>;
  repo: Repo;
}>): JSX.Element => (
  <td class={constant('activity-cell')}>
    <span
      aria-hidden={constant('true')}
      class={constant('activity-bar')}
      data-kind={constant(kind)}
      style={{
        width: combine([day, most]).pipe(
          map(([d, m]) =>
            Num.isNonZero(m)
              ? `calc((100% - 16px) * ${Num.div(d[kind], m)})`
              : '0px',
          ),
        ),
      }}
    />
    <ExternalLink
      class={constant('activity-count')}
      href={day.pipe(map((d) => activitySearchUrl(repo, kind, d)))}
    >
      {day.pipe(map((d) => d[kind].toString()))}
    </ExternalLink>
  </td>
);
