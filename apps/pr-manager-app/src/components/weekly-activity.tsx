import type { InitializedObservable } from 'synstate';
import {
  constant,
  derive,
  For,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
  type View,
} from 'synstate-dom';
import { Num, Optional } from 'ts-data-forge';
import {
  activityStore,
  reportSource,
  tokenStore,
  type ActivityStatus,
} from '../store/index.mjs';
import {
  activitySearchUrl,
  WEEK_LENGTH,
  type ActivityKind,
  type DayActivity,
  type WeeklyActivity as Week,
} from '../weekly-activity.mjs';
import { ExternalLink } from './external-link.js';
import { followOpen } from './follow-open.mjs';

/**
 * The "Activity" button and the dialog it opens: how many pull requests
 * merged and how many issues closed on each of the last seven days, in the
 * reader's time zone (`weekly-activity.mts`).
 *
 * A dialog rather than a block, so that it takes none of the page until it
 * is asked for. A native `<dialog>` opened modal, as the layout settings are
 * (`view-settings.tsx`): focus and Escape are the browser's, and the element
 * follows the store's `open`.
 *
 * Each count is a link to the same search on GitHub. The bars share one
 * scale across both columns, so a day's two bars can be compared as well as
 * the days.
 */
export const WeeklyActivity = (): JSX.Element => {
  const status$ = activityStore.status;

  return (
    <>
      <button
        class={constant('header-button')}
        disabled={view(tokenStore.token, (token) => token === undefined)}
        title={constant(
          `Pull requests merged and issues closed on each of the last ${WEEK_LENGTH} days`,
        )}
        type={constant('button')}
        onClick={activityStore.openDialog}
      >
        {constant('Activity')}
      </button>

      <dialog
        ref={followOpen(activityStore.open)}
        aria-labelledby={constant(TITLE_ID)}
        class={constant('view-settings weekly-activity')}
        onClose={activityStore.closeDialog}
      >
        <h2 class={constant('view-settings-title')} id={constant(TITLE_ID)}>
          {constant(`The last ${WEEK_LENGTH} days`)}
        </h2>

        <MatchOptional
          value={view(status$, (status) =>
            status.type === 'ready'
              ? Optional.some(status.activity)
              : Optional.none,
          )}
          some={(activity$) => <ActivityTable activity$={activity$} />}
          none={
            <MatchOptional
              value={failedOf(status$)}
              some={(message$) => (
                <p class={constant('section-note')} role={constant('alert')}>
                  {message$}
                </p>
              )}
              none={
                <p class={constant('section-note')}>{constant('Counting…')}</p>
              }
            />
          }
        />

        <p class={constant('section-note')}>
          {constant(
            'Days start at midnight in this browser’s time zone. Today is left out until it is over: the week moves on at midnight.',
          )}
        </p>

        <div class={constant('view-settings-actions weekly-activity-actions')}>
          <MatchOptional
            value={failedOf(status$)}
            some={() => (
              <button
                class={constant('view-settings-small')}
                type={constant('button')}
                onClick={activityStore.retry}
              >
                {constant('Try again')}
              </button>
            )}
          />

          <button
            class={constant('header-button')}
            type={constant('button')}
            onClick={activityStore.closeDialog}
          >
            {constant('Done')}
          </button>
        </div>
      </dialog>
    </>
  );
};

const ActivityTable = ({
  activity$,
}: Readonly<{ activity$: InitializedObservable<Week> }>): JSX.Element => {
  const days = view(activity$, (activity) => activity.days);

  const scaleMax = view(activity$, ({ days: all }) =>
    Math.max(0, ...all.flatMap((day) => [day.merged, day.closed])),
  );

  return (
    <table class={constant('weekly-activity-table')}>
      <thead>
        <tr>
          <th scope={constant('col')}>{constant('Day')}</th>
          <th scope={constant('col')}>{constant('Pull requests merged')}</th>
          <th scope={constant('col')}>{constant('Issues closed')}</th>
        </tr>
      </thead>
      <tbody>
        <For items={days} key={(day) => day.key}>
          {(day$) => (
            <tr>
              <th scope={constant('row')}>
                <time dateTime={view(day$, (day) => day.key)}>
                  {view(day$, (day) => DAY_LABEL.format(day.startMs))}
                </time>
              </th>
              <CountCell day$={day$} kind={'merged'} scaleMax={scaleMax} />
              <CountCell day$={day$} kind={'closed'} scaleMax={scaleMax} />
            </tr>
          )}
        </For>
      </tbody>
      <tfoot>
        <tr>
          <th scope={constant('row')}>{constant('Total')}</th>
          <td class={constant('weekly-activity-total')}>
            <span class={constant('weekly-activity-count')}>
              {view(activity$, ({ days: all }) =>
                all.reduce((sum, day) => sum + day.merged, 0),
              )}
            </span>
          </td>
          <td class={constant('weekly-activity-total')}>
            <span class={constant('weekly-activity-count')}>
              {view(activity$, ({ days: all }) =>
                all.reduce((sum, day) => sum + day.closed, 0),
              )}
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

type CellProps = Readonly<{
  day$: InitializedObservable<DayActivity>;
  kind: ActivityKind;
  scaleMax: Bindable<number>;
}>;

const CountCell = ({ day$, kind, scaleMax }: CellProps): JSX.Element => (
  <td>
    <div class={constant('weekly-activity-cell')}>
      <span class={constant('weekly-activity-count')}>
        <ExternalLink
          href={view(day$, (day) => activitySearchUrl(reportSource, kind, day))}
        >
          {view(day$, (day) => String(day[kind]))}
        </ExternalLink>
      </span>
      <span
        aria-hidden={constant('true')}
        class={constant('weekly-activity-track')}
      >
        <span
          class={constant('weekly-activity-bar')}
          data-kind={constant(kind)}
          style={{
            width: derive([day$, scaleMax], (day, max) =>
              Num.isNonZero(max) ? `${Num.div(day[kind] * 100, max)}%` : '0%',
            ),
          }}
        />
      </span>
    </div>
  </td>
);

const failedOf = (
  status$: InitializedObservable<ActivityStatus>,
): View<Optional<string>> =>
  view(status$, (status) =>
    status.type === 'failed' ? Optional.some(status.message) : Optional.none,
  );

/** The reader's locale, as the time of reading is (`format.mts`). */
const DAY_LABEL = new Intl.DateTimeFormat(undefined, {
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
});

const TITLE_ID = 'weekly-activity-title';
