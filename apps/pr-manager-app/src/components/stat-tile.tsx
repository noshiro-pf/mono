import { memoNamed } from 'preact-utils';
import type { StatusRole } from '../verdict.mjs';

type Props = Readonly<{
  value: number;
  label: string;
  /**
   * Left off unless the number says something is wrong. A tile that is
   * coloured whatever it reads has spent the colour before there is anything
   * to spend it on.
   */
  tone?: StatusRole;
  /**
   * Given, the tile is a switch (`aria-pressed`) for what it counts, and
   * `pressed` is whether that is shown.
   */
  onToggle?: () => void;
  pressed?: boolean;
}>;

/**
 * One headline number. A row of these rather than a chart: counts with no
 * shared scale and no order between them is a table at best, and a bar
 * chart of unrelated magnitudes would invite a comparison that means
 * nothing.
 */
export const StatTile = memoNamed<Props>(
  'StatTile',
  ({ value, label, tone, onToggle, pressed = true }) =>
    onToggle === undefined ? (
      <div className={'stat-tile'} data-status={tone}>
        <span className={'stat-value'}>{value}</span>
        <span className={'stat-label'}>{label}</span>
      </div>
    ) : (
      <button
        aria-pressed={pressed}
        className={'stat-tile stat-toggle'}
        data-status={tone}
        title={
          pressed
            ? `Shown. Press to hide the pull requests that are ${label}.`
            : `Hidden. Press to show the pull requests that are ${label}.`
        }
        type={'button'}
        onClick={onToggle}
      >
        <span className={'stat-value'}>{value}</span>
        <span className={'stat-label'}>{label}</span>
      </button>
    ),
);
