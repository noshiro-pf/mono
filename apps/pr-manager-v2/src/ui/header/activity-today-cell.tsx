import { map, type InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';
import {
  activitySearchUrl,
  type ActivityKind,
  type Repo,
  type WeeklyActivity,
} from '../../domain/index.mjs';
import { ExternalLink } from '../common/index.mjs';

export const ActivityTodayCell = ({
  week,
  kind,
  repo,
}: Readonly<{
  week: InitializedObservable<WeeklyActivity>;
  kind: ActivityKind;
  repo: Repo;
}>): JSX.Element => (
  <td>
    <ExternalLink
      href={week.pipe(map(({ today }) => activitySearchUrl(repo, kind, today)))}
    >
      {week.pipe(map(({ today }) => today[kind].toString()))}
    </ExternalLink>
  </td>
);
