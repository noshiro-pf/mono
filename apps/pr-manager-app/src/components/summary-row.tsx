import * as React from 'react';
import { type PageSummary } from '../load-report.mjs';
import { StatTile } from './stat-tile.js';

type Props = Readonly<{ summary: PageSummary }>;

/**
 * What a reader who opens the page and closes it again has still learnt.
 *
 * The first five are `pr-report-core`'s, the same counts `pnpm run pr-report`
 * leads with; the last two are what stops a pull request that is otherwise
 * ready, and are only this page's.
 */
export const SummaryRow = React.memo<Props>(({ summary }) => (
  <div className={'summary-row'}>
    <StatTile label={'open'} value={summary.open} />
    <StatTile label={'queued'} value={summary.queued} />
    <StatTile label={'draft'} value={summary.draft} />
    <StatTile
      label={'failing'}
      tone={summary.failing > 0 ? 'critical' : undefined}
      value={summary.failing}
    />
    <StatTile label={'behind base'} value={summary.behind} />
    <StatTile
      label={'conflicting'}
      tone={summary.conflicting > 0 ? 'critical' : undefined}
      value={summary.conflicting}
    />
    <StatTile
      label={'awaiting code owner'}
      tone={summary.awaitingReview > 0 ? 'warning' : undefined}
      value={summary.awaitingReview}
    />
  </div>
));

SummaryRow.displayName = 'SummaryRow';
