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
import { Arr, Num, Optional } from 'ts-data-forge';
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
 * merged and how many issues closed so far today, and on each of the last
 * seven days, in the reader's time zone (`weekly-activity.mts`). Today is a
 * section of its own, below the week so that the rows read in order, and
 * outside its total, because it is still going: its counts say what time
 * they are as of.
 *
 * A dialog rather than a block, so that it takes none of the page until it
 * is asked for. A native `<dialog>` opened modal, as the layout settings are
 * (`view-settings.tsx`): focus and Escape are the browser's, and the element
 * follows the store's `open`.
 *
 * Each count is a link to the same search on GitHub. The bars share one
 * scale across both columns and both sections, so a day's two bars can be
 * compared as well as the days, today among them.
 */
export const WeeklyActivity = (): JSX.Element => {
  const status$ = activityStore.status;

  return (
    <>
      <button
        class={constant('header-button')}
        disabled={view(tokenStore.token, (token) => token === undefined)}
        title={constant(
          `Pull requests merged and issues closed today and on each of the last ${WEEK_LENGTH} days`,
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
          {constant('Activity')}
        </h2>

        <MatchOptional
          value={view(status$, (status) =>
            status.type === 'ready'
              ? Optional.some(status.activity)
              : Optional.none,
          )}
          some={(activity$) => <ActivitySections activity$={activity$} />}
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
            'Days start at midnight in this browser’s time zone. Today is counted apart from the last 7 days, which take it in once it is over, at midnight.',
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

const ActivitySections = ({
  activity$,
}: Readonly<{ activity$: InitializedObservable<Week> }>): JSX.Element => {
  const today = view(activity$, (activity) => activity.today);

  const scaleMax = view(activity$, ({ days: all, today: current }) =>
    Math.max(
      0,
      ...Arr.toPushed(all, current).flatMap((day) => [day.merged, day.closed]),
    ),
  );

  return (
    <>
      <section aria-labelledby={constant(WEEK_ID)}>
        <h3 class={constant('weekly-activity-heading')} id={constant(WEEK_ID)}>
          {constant(`The last ${WEEK_LENGTH} days`)}
        </h3>
        <WeekTable activity$={activity$} scaleMax={scaleMax} />
      </section>

      <section aria-labelledby={constant(TODAY_ID)}>
        <h3 class={constant('weekly-activity-heading')} id={constant(TODAY_ID)}>
          {constant('Today ')}
          <span class={constant('weekly-activity-as-of')}>
            {view(
              activity$,
              (activity) =>
                `so far, as of ${TIME_LABEL.format(activity.countedAtMs)}`,
            )}
          </span>
        </h3>
        <table class={constant('weekly-activity-table')}>
          <ColumnHeads />
          <tbody>
            <DayRow day={today} scaleMax={scaleMax} />
          </tbody>
        </table>
      </section>
    </>
  );
};

const WeekTable = ({
  activity$,
  scaleMax,
}: Readonly<{
  activity$: InitializedObservable<Week>;
  scaleMax: Bindable<number>;
}>): JSX.Element => (
  <table class={constant('weekly-activity-table')}>
    <ColumnHeads />
    <tbody>
      <For items={view(activity$, ({ days }) => days)} key={(day) => day.key}>
        {(day$) => <DayRow day={day$} scaleMax={scaleMax} />}
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

const ColumnHeads = (): JSX.Element => (
  <thead>
    <tr>
      <th scope={constant('col')}>{constant('Day')}</th>
      <th scope={constant('col')}>{constant('Pull requests merged')}</th>
      <th scope={constant('col')}>{constant('Issues closed')}</th>
    </tr>
  </thead>
);

/** One day's row; `day` is a week's entry or today, read from the whole. */
const DayRow = ({
  day,
  scaleMax,
}: Readonly<{
  day: Bindable<DayActivity>;
  scaleMax: Bindable<number>;
}>): JSX.Element => (
  <tr>
    <th scope={constant('row')}>
      <time dateTime={derive([day], ({ key }) => key)}>
        {derive([day], ({ startMs }) => DAY_LABEL.format(startMs))}
      </time>
    </th>
    <CountCell day={day} kind={'merged'} scaleMax={scaleMax} />
    <CountCell day={day} kind={'closed'} scaleMax={scaleMax} />
  </tr>
);

type CellProps = Readonly<{
  day: Bindable<DayActivity>;
  kind: ActivityKind;
  scaleMax: Bindable<number>;
}>;

const CountCell = ({ day, kind, scaleMax }: CellProps): JSX.Element => (
  <td>
    <div class={constant('weekly-activity-cell')}>
      <span class={constant('weekly-activity-count')}>
        <ExternalLink
          href={derive([day], (counted) =>
            activitySearchUrl(reportSource, kind, counted),
          )}
        >
          {derive([day], (counted) => counted[kind].toString())}
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
            width: derive([day, scaleMax], (counted, max) =>
              Num.isNonZero(max)
                ? `${Num.div(counted[kind] * 100, max)}%`
                : '0%',
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

/** Hours and minutes, for how far into today its counts run. */
const TIME_LABEL = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const TITLE_ID = 'weekly-activity-title';

const TODAY_ID = 'weekly-activity-today';

const WEEK_ID = 'weekly-activity-week';
