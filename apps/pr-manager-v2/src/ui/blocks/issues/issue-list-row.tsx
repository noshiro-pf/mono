import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  START_NAMES,
  type IssueRow,
  type Tone,
} from '../../../domain/index.mjs';
import { Age, ExternalLink, LabelChip } from '../../common/index.mjs';
import { Claimant } from './claimant.js';

export const IssueListRow = ({
  row,
  now,
}: Readonly<{
  row: InitializedObservable<IssueRow>;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <li class={constant('row issue-row')}>
    <span class={constant('row-main')}>
      <span>
        <span class={constant('card-number')}>
          {row.pipe(map(({ number }) => `#${number} `))}
        </span>
        <ExternalLink
          class={constant('row-title')}
          href={row.pipe(map(({ url }) => url))}
        >
          {row.pipe(map(({ title }) => title))}
        </ExternalLink>
      </span>
      <span class={constant('row-meta')}>
        <span
          class={constant('badge')}
          data-tone={row.pipe(map(({ start }) => START_TONES[start]))}
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
        <For
          items={row.pipe(map(({ waits }) => waits))}
          key={({ number }) => number}
        >
          {(wait$) => (
            <span
              class={constant('wait')}
              data-status={wait$.pipe(map(({ status }) => status))}
              title={wait$.pipe(
                map(
                  ({ title, status }) =>
                    `${title ?? 'not read'} — ${WAIT_WORDS[status]}`,
                ),
              )}
            >
              {wait$.pipe(map(({ number }) => `after #${number}`))}
            </span>
          )}
        </For>
        <If
          cond={row.pipe(map(({ mergeAfterInBody }) => mergeAfterInBody))}
          then={
            <span
              class={constant('badge')}
              data-tone={constant('warning')}
              title={constant(
                'Its body says Merge-After:, which issues do not read: an issue waits with Start-After:.',
              )}
            >
              <span aria-hidden={constant('true')}>{constant('⚠')}</span>
              {constant('Merge-After: in an issue')}
            </span>
          }
        />
      </span>
      <span class={constant('row-meta')}>
        <Age
          at={row.pipe(map(({ updatedAtMs }) => updatedAtMs))}
          now={now}
          prefix={'updated '}
        />
        <span>{row.pipe(map(({ author }) => `· ${author}`))}</span>
        <span>
          {row.pipe(
            map(
              ({ commentCount }) =>
                `· ${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`,
            ),
          )}
        </span>
        <For
          items={row.pipe(map(({ labels }) => labels))}
          key={({ name }) => name}
        >
          {(label$) => <LabelChip label={label$} />}
        </For>
      </span>
    </span>
  </li>
);

const WAIT_WORDS = {
  waiting: 'still open',
  done: 'done',
  abandoned: 'closed unfinished: needs a look',
  unknown: 'could not be told',
} as const;

const START_TONES = {
  ready: 'good',
  free: 'good',
  planned: 'info',
  'in-progress': 'info',
  attention: 'warning',
  blocked: 'neutral',
  cycle: 'serious',
} as const satisfies ReadonlyRecord<IssueRow['start'], Tone>;
