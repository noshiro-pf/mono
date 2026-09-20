import { type PayloadSummary } from 'pr-report-payload';
import type * as React from 'react';
import { StatTile } from './stat-tile.js';

type Props = Readonly<{ summary: PayloadSummary }>;

/**
 * What a reader who opens the page and closes it again has still learnt.
 *
 * The counts are the report's own — see `PayloadSummary` for why they are
 * carried rather than recomputed here.
 */
export const SummaryRow = ({ summary }: Props): React.ReactElement => (
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
  </div>
);
