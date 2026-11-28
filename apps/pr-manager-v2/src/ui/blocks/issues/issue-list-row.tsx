import { derive, map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { START_NAMES, type IssueRow } from '../../../domain/index.mjs';
import { Age, ExternalLink, LabelChip } from '../../common/index.mjs';
import { Claimant } from './claimant.js';

export const IssueListRow = ({
  row,
  rows,
  now,
}: Readonly<{
  row: InitializedObservable<IssueRow>;
  /** Every open issue read, for how what it waits for stands. */
  rows: InitializedObservable<ReadonlyMap<number, IssueRow>>;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <li class={constant('row issue-row')}>
    <div class={constant('row-heading')}>
      <span class={constant('card-number')}>
        {row.pipe(map(({ number }) => `#${number}`))}
      </span>
      <ExternalLink
        class={constant('row-title')}
        href={row.pipe(map(({ url }) => url))}
      >
        {row.pipe(map(({ title }) => title))}
      </ExternalLink>
    </div>
    <div class={constant('row-meta')}>
      <span
        class={constant('badge issue-start')}
        data-state={row.pipe(map(({ start }) => start))}
        title={row.pipe(
          map(({ unread }) =>
            unread === undefined
              ? ''
              : `May be wrong: ${unread} could not be read.`,
          ),
        )}
      >
        {row.pipe(
          map(
            ({ start, unread }) =>
              `${START_NAMES[start]}${unread === undefined ? '' : ' ?'}`,
          ),
        )}
      </span>
      <If
        cond={row.pipe(map(({ claim }) => claim !== undefined))}
        then={
          <Claimant claim={row.pipe(map(({ claim }) => claim))} now={now} />
        }
      />
      <If
        cond={row.pipe(map(({ waits }) => Arr.isNonEmpty(waits)))}
        then={
          <span class={constant('issue-start-named')}>
            {constant('after ')}
            <For
              items={row.pipe(map(({ waits }) => waits))}
              key={({ number }) => number}
            >
              {(wait$, index$) => (
                <>
                  {index$.pipe(map((index) => (index === 0 ? '' : ', ')))}
                  <ExternalLink
                    href={derive([row, wait$], ({ url }, { number }) =>
                      url.replace(/\/\d+$/u, () => `/${number}`),
                    )}
                    state={derive([rows, wait$], (all, { number, status }) =>
                      status === 'waiting'
                        ? (all.get(number)?.start ?? 'open')
                        : status,
                    )}
                    title={wait$.pipe(
                      map(
                        ({ title, status }) =>
                          `${title ?? 'not read'} — ${WAIT_WORDS[status]}`,
                      ),
                    )}
                  >
                    {wait$.pipe(map(({ number }) => `#${number}`))}
                  </ExternalLink>
                </>
              )}
            </For>
          </span>
        }
      />
      <If
        cond={row.pipe(map(({ mergeAfterInBody }) => mergeAfterInBody))}
        then={
          <span
            class={constant('failed-checks')}
            title={constant(
              'An issue does not read Merge-After:, which orders pull requests. Write Start-After: to say what this issue waits for.',
            )}
          >
            {constant('Merge-After: is not read here; use Start-After:')}
          </span>
        }
      />
    </div>
    <div class={constant('row-meta')}>
      <Age
        at={row.pipe(map(({ updatedAtMs }) => updatedAtMs))}
        now={now}
        prefix={'updated '}
      />
      <span>{row.pipe(map(({ author }) => `by ${author}`))}</span>
      <If
        cond={row.pipe(map(({ commentCount }) => commentCount > 0))}
        then={
          <span>
            {row.pipe(
              map(
                ({ commentCount }) =>
                  `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`,
              ),
            )}
          </span>
        }
      />
      <For
        items={row.pipe(map(({ labels }) => labels))}
        key={({ name }) => name}
      >
        {(label$) => <LabelChip label={label$} />}
      </For>
    </div>
  </li>
);

const WAIT_WORDS = {
  waiting: 'still open',
  done: 'done',
  abandoned: 'closed unfinished: needs a look',
  unknown: 'could not be told',
} as const;
