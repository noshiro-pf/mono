import { effect } from '@preact/signals';
import type { RefCallback } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Num } from 'ts-data-forge';
import {
  activitySignals,
  activityStore,
  reportSource,
  tokenSignals,
} from '../store/index.mjs';
import {
  activitySearchUrl,
  WEEK_LENGTH,
  type ActivityKind,
  type DayActivity,
  type WeeklyActivity as Week,
} from '../weekly-activity.mjs';
import { ExternalLink } from './external-link.js';

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
export const WeeklyActivity = memoNamed('WeeklyActivity', () => {
  const noToken = tokenSignals.token.value === undefined;

  const activityStatus = activitySignals.status.value;

  return (
    <>
      <button
        className={'header-button'}
        disabled={noToken}
        title={`Pull requests merged and issues closed on each of the last ${WEEK_LENGTH} days`}
        type={'button'}
        onClick={activityStore.openDialog}
      >
        {'Activity'}
      </button>

      <dialog
        ref={followOpen}
        aria-labelledby={TITLE_ID}
        className={'view-settings weekly-activity'}
        onClose={activityStore.closeDialog}
      >
        <h2 className={'view-settings-title'} id={TITLE_ID}>
          {`The last ${WEEK_LENGTH} days`}
        </h2>

        {activityStatus.type === 'ready' ? (
          <ActivityTable activity={activityStatus.activity} />
        ) : activityStatus.type === 'failed' ? (
          <p className={'section-note'} role={'alert'}>
            {activityStatus.message}
          </p>
        ) : (
          <p className={'section-note'}>{'Counting…'}</p>
        )}

        <p className={'section-note'}>
          {
            'Days start at midnight in this browser’s time zone. Today is left out until it is over: the week moves on at midnight.'
          }
        </p>

        <div className={'view-settings-actions weekly-activity-actions'}>
          {activityStatus.type === 'failed' ? (
            <button
              className={'view-settings-small'}
              type={'button'}
              onClick={activityStore.retry}
            >
              {'Try again'}
            </button>
          ) : undefined}

          <button
            className={'header-button'}
            type={'button'}
            onClick={activityStore.closeDialog}
          >
            {'Done'}
          </button>
        </div>
      </dialog>
    </>
  );
});

type TableProps = Readonly<{ activity: Week }>;

const ActivityTable = memoNamed<TableProps>('ActivityTable', ({ activity }) => {
  const { days } = activity;

  const totals = useMemo(
    () => ({
      merged: days.reduce((sum, day) => sum + day.merged, 0),
      closed: days.reduce((sum, day) => sum + day.closed, 0),
    }),
    [days],
  );

  const scaleMax = useMemo(
    () => Math.max(0, ...days.flatMap((day) => [day.merged, day.closed])),
    [days],
  );

  return (
    <table className={'weekly-activity-table'}>
      <thead>
        <tr>
          <th scope={'col'}>{'Day'}</th>
          <th scope={'col'}>{'Pull requests merged'}</th>
          <th scope={'col'}>{'Issues closed'}</th>
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day.key}>
            <th scope={'row'}>
              <time dateTime={day.key}>{DAY_LABEL.format(day.startMs)}</time>
            </th>
            <CountCell day={day} kind={'merged'} scaleMax={scaleMax} />
            <CountCell day={day} kind={'closed'} scaleMax={scaleMax} />
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope={'row'}>{'Total'}</th>
          <td className={'weekly-activity-total'}>
            <span className={'weekly-activity-count'}>{totals.merged}</span>
          </td>
          <td className={'weekly-activity-total'}>
            <span className={'weekly-activity-count'}>{totals.closed}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
});

type CellProps = Readonly<{
  day: DayActivity;
  kind: ActivityKind;
  scaleMax: number;
}>;

const CountCell = memoNamed<CellProps>(
  'CountCell',
  ({ day, kind, scaleMax }) => {
    const count = day[kind];

    const style = useMemo(
      () => ({
        width: Num.isNonZero(scaleMax)
          ? `${Num.div(count * 100, scaleMax)}%`
          : '0%',
      }),
      [count, scaleMax],
    );

    return (
      <td>
        <div className={'weekly-activity-cell'}>
          <span className={'weekly-activity-count'}>
            <ExternalLink href={activitySearchUrl(reportSource, kind, day)}>
              {String(count)}
            </ExternalLink>
          </span>
          <span aria-hidden={'true'} className={'weekly-activity-track'}>
            <span
              className={'weekly-activity-bar'}
              data-kind={kind}
              style={style}
            />
          </span>
        </div>
      </td>
    );
  },
);

// A modal dialog is opened by a call, not an attribute, so the element
// follows the signal with an effect for as long as it is mounted.
const followOpen: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) {
    return undefined;
  }

  return effect(() => {
    const shown = activitySignals.open.value;

    if (shown && !dialog.open) {
      dialog.showModal();
    } else if (!shown && dialog.open) {
      dialog.close();
    }
  });
};

/** The reader's locale, as the time of reading is (`format.mts`). */
const DAY_LABEL = new Intl.DateTimeFormat(undefined, {
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
});

const TITLE_ID = 'weekly-activity-title';
