import { map } from 'synstate';
import { constant, For, If, inlineMap, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { formatLocalTime } from '../format.mjs';
import { mergedPullRequestsUrl } from '../github-links.mjs';
import { MERGED_WITHIN_DAYS } from '../load-report.mjs';
import { isUnread } from '../part-failures.mjs';
import { reader, reportSource } from '../store/index.mjs';
import { Age } from './age.js';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LinkedIssues } from './linked-issues.js';
import { PaneRefresh } from './pane-refresh.js';
import { PartFailureNotes } from './part-failure-notes.js';

/**
 * What landed, newest first.
 *
 * Below the queue, because the queue is what a reader can act on and this is
 * what they no longer have to — and it is still the first question a daily
 * report has to answer: did the thing I queued yesterday go in.
 */
export const MergedSection = (): JSX.Element => (
  <section class={constant('section')}>
    <h2 class={constant('section-title')}>
      {constant(`Merged in the last ${daysOf(MERGED_WITHIN_DAYS)} `)}
      <ExternalLink
        // From the last read, so a page left open keeps its window.
        href={reader.readAt.pipe(
          map((readAt) => mergedPullRequestsUrl(reportSource, readAt)),
        )}
        variant={'section-link'}
      >
        {constant('on GitHub')}
      </ExternalLink>
      <PaneRefresh pane={'merged'} what={'what merged'} />
    </h2>

    <PartFailureNotes parts={PARTS} />

    <If
      // Whether the list has not been read yet.
      cond={reader.reading.pipe(map((reading) => reading.includes('merged')))}
      then={
        <p class={constant('section-note')}>{constant('Reading GitHub…')}</p>
      }
      else={
        <If
          // Not "nothing merged" when the list was not read, which the note
          // above says.
          cond={reader.failed.pipe(
            map((failed) => !isUnread(failed, 'merged')),
          )}
          then={
            <If
              cond={reader.merged.pipe(map(Arr.isEmpty))}
              then={
                <p class={constant('section-note')}>
                  {constant('Nothing merged in that window.')}
                </p>
              }
              else={
                <ul class={constant('merged-list')}>
                  <For items={reader.merged} key={(pr) => pr.number}>
                    {(pr$) => (
                      <li class={constant('merged-item')}>
                        <div class={constant('pull-request-heading')}>
                          <span class={constant('pull-request-number')}>
                            {inlineMap(pr$, (pr) => `#${pr.number}`)}
                          </span>
                          <ExternalLink
                            href={pr$.pipe(map((pr) => pr.url))}
                            variant={'pull-request-title'}
                          >
                            {inlineMap(pr$, (pr) => pr.title)}
                          </ExternalLink>
                        </div>

                        <div class={constant('pull-request-row')}>
                          <span
                            class={constant('merged-when')}
                            title={inlineMap(pr$, (pr) =>
                              formatLocalTime(pr.mergedAtEpochMs),
                            )}
                          >
                            {constant('merged ')}
                            <Age
                              epochMs={pr$.pipe(
                                map((pr) => pr.mergedAtEpochMs),
                              )}
                            />
                            {inlineMap(pr$, (pr) => ` by ${pr.author}`)}
                          </span>

                          <span class={constant('branch')}>
                            <span aria-hidden={constant('true')}>
                              {constant('⎇ ')}
                            </span>
                            {inlineMap(pr$, (pr) => pr.headRef)}
                          </span>

                          <If
                            cond={pr$.pipe(
                              map((pr) => Arr.isNonEmpty(pr.linkedIssues)),
                            )}
                            then={
                              <LinkedIssues
                                issues={pr$.pipe(map((pr) => pr.linkedIssues))}
                              />
                            }
                          />

                          <For
                            items={pr$.pipe(map((pr) => pr.labels))}
                            key={(label) => label.name}
                          >
                            {(label$) => <LabelChip label={label$} />}
                          </For>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              }
            />
          }
        />
      }
    />
  </section>
);

const PARTS = ['merged'] as const;

const daysOf = (count: number): string =>
  `${count} day${count === 1 ? '' : 's'}` as const;
