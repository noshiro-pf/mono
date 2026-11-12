import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  autoMergeBadgeText,
  checksBadgeText,
  codeOwnerBadgeText,
  setAsideBadgeText,
  splitViewUrl,
  stateBadgeText,
  type MergeOrderCard,
} from '../../../domain/index.mjs';
import { Age, Badge, ExternalLink, LabelChip } from '../../common/index.mjs';
import { Divergence } from './divergence.js';

type Props = Readonly<{
  card: InitializedObservable<MergeOrderCard>;
  scaleMax: InitializedObservable<number>;
  now: InitializedObservable<number>;
}>;

/**
 * One open pull request (spec §7.2), in the order a reader asks: what state it
 * is in, what it is, which branch and how far from its base, what it waits for,
 * when it last moved, and how it is labelled. Each part is bound to what it
 * shows, so a read that changes one field rewrites that field alone.
 */
export const PullRequestCard = ({
  card,
  scaleMax,
  now,
}: Props): JSX.Element => (
  <article class={constant('card')}>
    <div class={constant('card-row')}>
      <Badge text={card.pipe(map(({ isDraft }) => stateBadgeText(isDraft)))} />
      <Badge text={card.pipe(map(({ checks }) => checksBadgeText(checks)))} />
      <Badge
        text={card.pipe(map(({ autoMerge }) => autoMergeBadgeText(autoMerge)))}
      />
      <If
        cond={card.pipe(map(({ codeOwner }) => codeOwner !== undefined))}
        then={
          <Badge
            text={card.pipe(
              map(({ codeOwner }) =>
                codeOwnerBadgeText(codeOwner ?? { kind: 'unknown', teams: [] }),
              ),
            )}
          />
        }
      />
      <If
        cond={card.pipe(map(({ setAside }) => setAside !== undefined))}
        then={
          <Badge
            text={card.pipe(
              map(({ setAside }) =>
                setAsideBadgeText(setAside ?? { reason: '', applies: false }),
              ),
            )}
          />
        }
      />
      <If
        cond={card.pipe(map(({ claim }) => claim !== undefined))}
        then={
          <span
            class={constant('badge')}
            data-tone={constant('info')}
            title={card.pipe(
              map(
                ({ claim }) =>
                  `Claimed by ${claim?.by ?? ''} to fix: the merge queue leaves it to them.`,
              ),
            )}
          >
            <span aria-hidden={constant('true')}>{constant('✋')}</span>
            {constant('claimed ')}
            <If
              cond={card.pipe(
                map(({ claim }) => claim?.sessionUrl !== undefined),
              )}
              then={
                <ExternalLink
                  href={card.pipe(map(({ claim }) => claim?.sessionUrl ?? ''))}
                >
                  {constant('by a session')}
                </ExternalLink>
              }
              else={
                <span>
                  {card.pipe(map(({ claim }) => `by ${claim?.by ?? ''}`))}
                </span>
              }
            />
            <Age
              at={card.pipe(map(({ claim }) => claim?.atMs ?? 0))}
              now={now}
              prefix={' '}
            />
          </span>
        }
      />
      <If
        // The checks badge says `paused` already when that is their verdict.
        cond={card.pipe(
          map(
            ({ paused, checks }) =>
              paused &&
              !(checks.kind === 'counts' && checks.verdict === 'paused'),
          ),
        )}
        then={
          <span
            class={constant('badge')}
            data-tone={constant('neutral')}
            title={constant(
              'skip-ci is on: its checks wait until the merge queue picks it.',
            )}
          >
            <span aria-hidden={constant('true')}>{constant('‖')}</span>
            {constant('paused')}
          </span>
        }
      />
    </div>

    <div class={constant('card-heading')}>
      <span class={constant('card-number')}>
        {card.pipe(map(({ number }) => `#${number}`))}
      </span>
      <ExternalLink
        class={constant('card-title')}
        href={card.pipe(map(({ url }) => url))}
      >
        {card.pipe(map(({ title }) => title))}
      </ExternalLink>
      <ExternalLink
        class={constant('split-view')}
        href={card.pipe(
          map((c) =>
            splitViewUrl({
              number: c.number,
              title: c.title,
              url: c.url,
              issueUrl: c.closingIssues[0]?.url,
              sessionUrl: c.sessions[0]?.url,
            }),
          ),
        )}
        title={constant(
          'Open the diff and the conversation side by side, with the issue it closes and its Claude Code session (needs split-view-extension).',
        )}
      >
        <span aria-hidden={constant('true')}>{constant('⧉ ')}</span>
        {constant('split view')}
      </ExternalLink>
    </div>

    <If
      cond={card.pipe(
        map(({ closingIssues }) => Arr.isNonEmpty(closingIssues)),
      )}
      then={
        <ul class={constant('card-list')}>
          <For
            items={card.pipe(map(({ closingIssues }) => closingIssues))}
            key={({ number }) => number}
          >
            {(issue$) => (
              <li>
                <span
                  class={constant('issue-state')}
                  data-state={issue$.pipe(map(({ state }) => state))}
                  title={issue$.pipe(map(({ state }) => `issue ${state}`))}
                >
                  {issue$.pipe(
                    map(({ state }) =>
                      state === 'open' ? '◯' : state === 'closed' ? '✓' : '?',
                    ),
                  )}
                </span>
                {constant(' closes ')}
                <ExternalLink href={issue$.pipe(map(({ url }) => url))}>
                  {issue$.pipe(
                    map(({ number, title }) => `#${number} ${title}`),
                  )}
                </ExternalLink>
              </li>
            )}
          </For>
        </ul>
      }
    />

    <If
      cond={card.pipe(map(({ sessions }) => Arr.isNonEmpty(sessions)))}
      then={
        <ul class={constant('card-list')}>
          <For
            items={card.pipe(map(({ sessions }) => sessions))}
            key={({ url }) => url}
          >
            {(session$) => (
              <li class={constant('session')}>
                <span aria-hidden={constant('true')}>{constant('✻ ')}</span>
                <ExternalLink
                  href={session$.pipe(map(({ url }) => url))}
                  title={session$.pipe(map(({ url }) => url))}
                >
                  {session$.pipe(map(({ title, url }) => title ?? url))}
                </ExternalLink>
              </li>
            )}
          </For>
        </ul>
      }
    />

    <div class={constant('card-row')}>
      <span
        class={constant('branch')}
        title={constant('head branch → base branch')}
      >
        {card.pipe(map(({ headRef, baseRef }) => `${headRef} → ${baseRef}`))}
      </span>
      <If
        cond={card.pipe(map(({ stackedOn }) => stackedOn !== undefined))}
        then={
          <span
            class={constant('note')}
            title={card.pipe(
              map(
                ({ stackedOn }) =>
                  `Its base is the branch of #${stackedOn ?? 0}, so its diff is its own layer; GitHub moves it onto that one's base once #${stackedOn ?? 0} merges.`,
              ),
            )}
          >
            {card.pipe(map(({ stackedOn }) => `stacked on #${stackedOn ?? 0}`))}
          </span>
        }
      />
      <Divergence
        comparison={card.pipe(map(({ comparison }) => comparison))}
        scaleMax={scaleMax}
      />
    </div>

    <If
      cond={card.pipe(map((c) => waitsText(c) !== ''))}
      then={
        <div class={constant('card-row')}>
          <span
            class={constant('note')}
            title={constant(
              'Merge-After: lines in its description, and the Start-After: of the issues it closes, which it inherits as a merge order. An open issue no pull request closes is not done yet.',
            )}
          >
            {card.pipe(map(waitsText))}
          </span>
        </div>
      }
    />

    <div class={constant('card-row muted')}>
      <If
        cond={card.pipe(map(({ pushedAtMs }) => pushedAtMs !== undefined))}
        then={
          <Age
            at={card.pipe(map(({ pushedAtMs }) => pushedAtMs ?? 0))}
            now={now}
            prefix={'pushed '}
          />
        }
      />
      <Age
        at={card.pipe(map(({ updatedAtMs }) => updatedAtMs))}
        now={now}
        prefix={'updated '}
      />
    </div>

    <If
      cond={card.pipe(map(({ labels }) => Arr.isNonEmpty(labels)))}
      then={
        <div class={constant('card-row')}>
          <For
            items={card.pipe(map(({ labels }) => labels))}
            key={({ name }) => name}
          >
            {(label$) => <LabelChip label={label$} />}
          </For>
        </div>
      }
    />
  </article>
);

/**
 * `after #3801, #3802 (Start-After) · #3790 (issue) not done`: what it waits
 * for beyond its stack, or empty.
 */
const waitsText = ({
  mergeAfter,
  inherited,
  notStartedIssues,
}: MergeOrderCard): string =>
  [
    ...(Arr.isNonEmpty(mergeAfter)
      ? [`after ${mergeAfter.map((n) => `#${n}`).join(', ')}`]
      : []),
    ...(Arr.isNonEmpty(inherited)
      ? [`after ${inherited.map((n) => `#${n}`).join(', ')} (Start-After)`]
      : []),
    ...(Arr.isNonEmpty(notStartedIssues)
      ? [`${notStartedIssues.map((n) => `#${n}`).join(', ')} (issue) not done`]
      : []),
  ].join(' · ');
