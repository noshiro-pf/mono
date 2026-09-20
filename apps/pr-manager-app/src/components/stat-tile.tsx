import type * as React from 'react';
import { type StatusRole } from '../verdict.mjs';

type Props = Readonly<{
  value: number;
  label: string;
  /**
   * Left off unless the number says something is wrong. A tile that is
   * coloured whatever it reads has spent the colour before there is anything
   * to spend it on.
   */
  tone?: StatusRole;
}>;

/**
 * One headline number. A row of these rather than a chart: five counts with
 * no shared scale and no order between them is a table at best, and a bar
 * chart of five unrelated magnitudes would invite a comparison that means
 * nothing.
 */
export const StatTile = ({ value, label, tone }: Props): React.ReactElement => (
  <div className={'stat-tile'} data-status={tone}>
    <span className={'stat-value'}>{value}</span>
    <span className={'stat-label'}>{label}</span>
  </div>
);
