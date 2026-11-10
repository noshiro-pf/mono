import { map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import {
  formatClockTime,
  weekTotals,
  type Repo,
  type WeeklyActivity,
} from '../../domain/index.mjs';
import { ActivityCountCell } from './activity-count-cell.js';
import { ActivityTodayCell } from './activity-today-cell.js';

export const ActivityWeekTable = ({
  week,
  repo,
}: Readonly<{
  week: InitializedObservable<WeeklyActivity>;
  repo: Repo;
}>): JSX.Element => {
  // Both columns' bars are drawn to one scale, so a day's two read together.
  const most = week.pipe(
    map(({ days }) =>
      Math.max(1, ...days.flatMap(({ merged, closed }) => [merged, closed])),
    ),
  );

  return (
    <table class={constant('activity')}>
      <thead>
        <tr>
          <th scope={constant('col')}>{constant('Day')}</th>
          <th scope={constant('col')}>{constant('Merged')}</th>
          <th scope={constant('col')}>{constant('Closed issues')}</th>
        </tr>
      </thead>
      <tbody>
        <For items={week.pipe(map(({ days }) => days))} key={({ key }) => key}>
          {(day$) => (
            <tr>
              <th scope={constant('row')}>
                {day$.pipe(map(({ label }) => label))}
              </th>
              <ActivityCountCell
                day={day$}
                kind={'merged'}
                most={most}
                repo={repo}
              />
              <ActivityCountCell
                day={day$}
                kind={'closed'}
                most={most}
                repo={repo}
              />
            </tr>
          )}
        </For>
      </tbody>
      <tfoot>
        <tr>
          <th scope={constant('row')}>{constant('7 days')}</th>
          <td>{week.pipe(map((w) => weekTotals(w).merged.toString()))}</td>
          <td>{week.pipe(map((w) => weekTotals(w).closed.toString()))}</td>
        </tr>
        <tr class={constant('activity-today')}>
          <th scope={constant('row')}>
            {week.pipe(
              map(
                ({ countedAtMs }) =>
                  `Today, as of ${formatClockTime(countedAtMs)}`,
              ),
            )}
          </th>
          <ActivityTodayCell kind={'merged'} repo={repo} week={week} />
          <ActivityTodayCell kind={'closed'} repo={repo} week={week} />
        </tr>
      </tfoot>
    </table>
  );
};
