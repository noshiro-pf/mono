import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { formatLocalTime } from '../format.mjs';
import { mergedPullRequestsUrl } from '../github-links.mjs';
import { MERGED_WITHIN_DAYS } from '../load-report.mjs';
import { reader, reportSource } from '../store/index.mjs';
import { Age } from './age.js';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LinkedIssues } from './linked-issues.js';

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
        href={view(reader.readAt, (readAt) =>
          mergedPullRequestsUrl(reportSource, readAt),
        )}
        variant={'section-link'}
      >
        {constant('on GitHub')}
      </ExternalLink>
    </h2>

    <If
      // Whether the list has not been read yet.
      cond={view(reader.reading, (reading) => reading.includes('merged'))}
      then={
        <p class={constant('section-note')}>{constant('Reading GitHub…')}</p>
      }
      else={
        <If
          cond={view(reader.merged, Arr.isEmpty)}
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
                        {view(pr$, (pr) => `#${pr.number}`)}
                      </span>
                      <ExternalLink
                        href={view(pr$, (pr) => pr.url)}
                        variant={'pull-request-title'}
                      >
                        {view(pr$, (pr) => pr.title)}
                      </ExternalLink>
                    </div>

                    <div class={constant('pull-request-row')}>
                      <span
                        class={constant('merged-when')}
                        title={view(pr$, (pr) =>
                          formatLocalTime(pr.mergedAtEpochMs),
                        )}
                      >
                        {constant('merged ')}
                        <Age epochMs={view(pr$, (pr) => pr.mergedAtEpochMs)} />
                        {view(pr$, (pr) => ` by ${pr.author}`)}
                      </span>

                      <span class={constant('branch')}>
                        <span aria-hidden={constant('true')}>
                          {constant('⎇ ')}
                        </span>
                        {view(pr$, (pr) => pr.headRef)}
                      </span>

                      <If
                        cond={view(pr$, (pr) =>
                          Arr.isNonEmpty(pr.linkedIssues),
                        )}
                        then={
                          <LinkedIssues
                            issues={view(pr$, (pr) => pr.linkedIssues)}
                          />
                        }
                      />

                      <For
                        items={view(pr$, (pr) => pr.labels)}
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
  </section>
);

const daysOf = (count: number): string =>
  `${count} day${count === 1 ? '' : 's'}` as const;
