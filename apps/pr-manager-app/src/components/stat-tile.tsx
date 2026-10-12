import { memoNamed } from 'preact-utils';
import type { StatusRole } from '../verdict.mjs';

type Props = Readonly<{
  /** `undefined` while what it counts is still being read. */
  value: number | undefined;
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
  /**
   * Given, the tile also carries an `only` switch, and `only` is whether
   * what it counts is picked to be shown alone.
   */
  onOnly?: () => void;
  only?: boolean;
}>;

/**
 * One headline number. A row of these rather than a chart: counts with no
 * shared scale and no order between them is a table at best, and a bar
 * chart of unrelated magnitudes would invite a comparison that means
 * nothing.
 *
 * The `only` switch is a button of its own beside the tile's rather than
 * inside it, since a button cannot hold another; it is drawn over the
 * tile's corner, always rather than on hover, because the page is opened
 * on phones too.
 */
export const StatTile = memoNamed<Props>(
  'StatTile',
  ({ value, label, tone, onToggle, pressed = true, onOnly, only = false }) =>
    onToggle === undefined ? (
      <div className={'stat-tile'} data-status={tone}>
        <span className={'stat-value'}>{value ?? READING}</span>
        <span className={'stat-label'}>{label}</span>
      </div>
    ) : (
      <div className={'stat-cell'}>
        <button
          aria-pressed={pressed}
          className={'stat-tile stat-toggle'}
          data-only={only}
          data-status={tone}
          title={
            pressed
              ? `Shown. Click to hide the pull requests that are ${label}.`
              : `Hidden. Click to show the pull requests that are ${label}.`
          }
          type={'button'}
          onClick={onToggle}
        >
          <span className={'stat-value'}>{value ?? READING}</span>
          <span className={'stat-label'}>{label}</span>
        </button>
        {onOnly === undefined ? undefined : (
          <button
            aria-label={`Show only ${label}`}
            aria-pressed={only}
            className={'stat-only'}
            title={
              only
                ? `Picked. Click to stop showing only the pull requests that are ${label}.`
                : `Click to show only the pull requests that are ${label}, and any others picked.`
            }
            type={'button'}
            onClick={onOnly}
          >
            {only ? '✓ only' : 'only'}
          </button>
        )}
      </div>
    ),
);

/** What a count reads while it is not known yet. */
const READING = '…';
