import { map } from 'synstate';
import { constant, MatchOptional, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { Repo } from '../../domain/index.mjs';
import type { ActivityStore } from '../../store/index.mjs';
import { followOpen } from '../common/index.mjs';
import { ActivityWeekTable } from './activity-week-table.js';

type Props = Readonly<{ activity: ActivityStore; repo: Repo }>;

/**
 * **Activity** (spec §5): pull requests merged and issues closed on each of the
 * last seven ended days, in the reader's time zone, with a bar each and a link
 * to the matching search; the week's total; and today so far, apart, since it
 * is still going.
 */
export const ActivityDialog = ({ activity, repo }: Props): JSX.Element => {
  const ready = activity.status.pipe(
    map((s) =>
      s.kind === 'ready' ? Optional.some(s.activity) : Optional.none,
    ),
  );

  return (
    <>
      <button
        class={constant('button')}
        title={constant(
          'Pull requests merged and issues closed on each of the last seven days',
        )}
        type={constant('button')}
        onClick={activity.openDialog}
      >
        {constant('Activity')}
      </button>

      <dialog
        ref={followOpen(activity.open)}
        aria-labelledby={constant('activity-title')}
        class={constant('dialog')}
        onClose={activity.closeDialog}
      >
        <h2 id={constant('activity-title')}>{constant('Activity')}</h2>

        <p class={constant('muted')}>
          {constant(
            'The last seven days that have ended, in your time zone. Each count is a GitHub search; follow it to see what it counts.',
          )}
        </p>

        <p aria-live={constant('polite')} class={constant('activity-status')}>
          {activity.status.pipe(
            map((s) =>
              s.kind === 'loading'
                ? 'Counting…'
                : s.kind === 'failed'
                  ? s.message
                  : '',
            ),
          )}
        </p>

        <MatchOptional
          value={ready}
          some={(week) => <ActivityWeekTable repo={repo} week={week} />}
          none={<></>}
        />

        <div class={constant('dialog-actions')}>
          <button
            class={constant('button')}
            hidden={activity.status.pipe(map((s) => s.kind !== 'failed'))}
            type={constant('button')}
            onClick={activity.retry}
          >
            {constant('Try again')}
          </button>
          <form method={constant('dialog')}>
            <button class={constant('button')} type={constant('submit')}>
              {constant('Done')}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
