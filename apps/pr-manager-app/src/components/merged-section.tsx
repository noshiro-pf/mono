import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { describeAge, formatLocalTime } from '../format.mjs';
import { type Merged } from '../load-report.mjs';
import { ExternalLink } from './external-link.js';
import { LabelChip } from './label-chip.js';
import { LinkedIssues } from './linked-issues.js';

type Props = Readonly<{
  merged: readonly Merged[];
  withinDays: number;
  nowMs: number;
}>;

/**
 * What landed, newest first.
 *
 * Below the queue, because the queue is what a reader can act on and this is
 * what they no longer have to — and it is still the first question a daily
 * report has to answer: did the thing I queued yesterday go in.
 */
export const MergedSection = React.memo<Props>(
  ({ merged, withinDays, nowMs }) => (
    <section className={'section'}>
      <h2 className={'section-title'}>
        {`Merged in the last ${withinDays} day${withinDays === 1 ? '' : 's'}`}
      </h2>

      {Arr.isEmpty(merged) ? (
        <p className={'section-note'}>{'Nothing merged in that window.'}</p>
      ) : (
        <ul className={'merged-list'}>
          {merged.map((pr) => (
            <li key={pr.number} className={'merged-item'}>
              <div className={'pull-request-heading'}>
                <span className={'pull-request-number'}>{`#${pr.number}`}</span>
                <ExternalLink href={pr.url} variant={'pull-request-title'}>
                  {pr.title}
                </ExternalLink>
              </div>

              <div className={'pull-request-row'}>
                <span
                  className={'merged-when'}
                  title={formatLocalTime(pr.mergedAtEpochMs)}
                >
                  {`merged ${describeAge(pr.mergedAtEpochMs, nowMs)} by ${pr.author}`}
                </span>

                <span className={'branch'}>
                  <span aria-hidden={'true'}>{'⎇ '}</span>
                  {pr.headRef}
                </span>

                {Arr.isNonEmpty(pr.linkedIssues) ? (
                  <LinkedIssues issues={pr.linkedIssues} />
                ) : undefined}

                {pr.labels.map((label) => (
                  <LabelChip key={label.name} label={label} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  ),
);

MergedSection.displayName = 'MergedSection';
