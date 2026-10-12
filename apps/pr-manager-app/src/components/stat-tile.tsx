import { memoNamed } from 'preact-utils';
import type { StatusMode } from '../merge-order-view.mjs';
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
   * Given, the tile is a switch (`aria-pressed`) for what it counts. Hiding,
   * `pressed` is whether that is shown; showing only, whether it is picked.
   */
  onToggle?: () => void;
  pressed?: boolean;
  mode?: StatusMode;
}>;

/**
 * One headline number. A row of these rather than a chart: counts with no
 * shared scale and no order between them is a table at best, and a bar
 * chart of unrelated magnitudes would invite a comparison that means
 * nothing.
 */
export const StatTile = memoNamed<Props>(
  'StatTile',
  ({ value, label, tone, onToggle, pressed = true, mode = 'hide' }) =>
    onToggle === undefined ? (
      <div className={'stat-tile'} data-status={tone}>
        <span className={'stat-value'}>{value ?? READING}</span>
        <span className={'stat-label'}>{label}</span>
      </div>
    ) : (
      <button
        aria-pressed={pressed}
        className={'stat-tile stat-toggle'}
        data-mode={mode}
        data-status={tone}
        title={TITLES[mode][pressed ? 'pressed' : 'released'](label)}
        type={'button'}
        onClick={onToggle}
      >
        <span className={'stat-value'}>{value ?? READING}</span>
        <span className={'stat-label'}>{label}</span>
      </button>
    ),
);

const TITLES = {
  hide: {
    pressed: (label: string) =>
      `Shown. Click to hide the pull requests that are ${label}.`,
    released: (label: string) =>
      `Hidden. Click to show the pull requests that are ${label}.`,
  },
  only: {
    pressed: (label: string) =>
      `Picked. Click to stop showing the pull requests that are ${label}.`,
    released: (label: string) =>
      `Click to show only the pull requests that are ${label}, and any others picked.`,
  },
} as const;

/** What a count reads while it is not known yet. */
const READING = '…';
