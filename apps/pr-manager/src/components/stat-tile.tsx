import {
  constant,
  derive,
  If,
  mapBindable,
  MatchOptional,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { Count } from '../merge-order-view.mjs';
import type { StatusRole } from '../verdict.mjs';

type Props = Readonly<{
  /** `undefined` while what it counts is still being read. */
  value: Bindable<number | undefined>;
  /** How many there are in all, drawn small beside `value` when it differs. */
  total: Bindable<number | undefined>;
  label: string;
  /**
   * `undefined` unless the number says something is wrong. A tile that is
   * coloured whatever it reads has spent the colour before there is anything to
   * spend it on.
   */
  tone?: Bindable<StatusRole | undefined>;
}>;

type ToggleProps = Props &
  Readonly<{
    /** The tile is a switch (`aria-pressed`) for what it counts. */
    onToggle: () => void;
    /** Whether what it counts is shown. */
    pressed: Bindable<boolean>;
    /** The `only` switch beside it. */
    onOnly: () => void;
    /** Whether what it counts is picked to be shown alone. */
    only: Bindable<boolean>;
    /**
     * What it counts, as its tooltips name it; the pull requests under `label`
     * unless said otherwise.
     */
    subject?: string;
    /**
     * How picking it goes with what else is picked: `either` adds to it, as one
     * more of the same kind; `both` narrows it, as another kind
     * (`issue-filter.mts`). `either` unless said otherwise.
     */
    pickWith?: 'either' | 'both';
  }>;

/**
 * One headline number. A row of these rather than a chart: counts with no
 * shared scale and no order between them is a table at best, and a bar chart of
 * unrelated magnitudes would invite a comparison that means nothing.
 */
export const StatTile = ({ value, total, label, tone }: Props): JSX.Element => (
  <div class={constant('stat-tile')} data-status={tone}>
    <StatValue total={total} value={value} />
    <span class={constant('stat-label')}>{constant(label)}</span>
  </div>
);

/**
 * A {@link StatTile} that is also a switch for what it counts, with an `only`
 * switch of its own beside it rather than inside it, since a button cannot hold
 * another; it is drawn over the tile's corner, always rather than on hover,
 * because the page is opened on phones too.
 */
export const StatToggle = ({
  value,
  total,
  label,
  tone,
  onToggle,
  pressed,
  onOnly,
  only,
  subject,
  pickWith = 'either',
}: ToggleProps): JSX.Element => {
  const what = subject ?? `the pull requests that are ${label}`;

  return (
    <div class={constant('stat-cell')}>
      <button
        aria-pressed={mapBindable(pressed, String)}
        class={constant('stat-tile stat-toggle')}
        data-only={mapBindable(only, String)}
        data-status={tone}
        title={mapBindable(pressed, (shown) =>
          shown
            ? `Shown. Click to hide ${what}.`
            : `Hidden. Click to show ${what}.`,
        )}
        type={constant('button')}
        onClick={onToggle}
      >
        <StatValue total={total} value={value} />
        <span class={constant('stat-label')}>{constant(label)}</span>
      </button>
      <button
        aria-label={constant(`Show only ${subject ?? label}`)}
        aria-pressed={mapBindable(only, String)}
        class={constant('stat-only')}
        title={mapBindable(only, (picked) =>
          picked
            ? `Picked. Click to stop showing only ${what}.`
            : pickWith === 'either'
              ? `Click to show only ${what}, and any others picked.`
              : `Click to show only ${what}, of what the rest shows.`,
        )}
        type={constant('button')}
        onClick={onOnly}
      >
        {mapBindable(only, (picked) => (picked ? '✓ only' : 'only'))}
      </button>
    </div>
  );
};

/**
 * ` of N` after a count that leaves some out, and nothing after one that does
 * not.
 */
export const OfTotal = ({
  count,
}: Readonly<{ count: Bindable<Count> }>): JSX.Element => (
  <If
    cond={mapBindable(count, ({ shown, total }) => shown !== total)}
    then={
      <span class={constant('count-total')}>
        {mapBindable(count, ({ total }) => ` of ${total}`)}
      </span>
    }
  />
);

const StatValue = ({
  value,
  total,
}: Readonly<{
  value: Bindable<number | undefined>;
  total: Bindable<number | undefined>;
}>): JSX.Element => (
  <span class={constant('stat-value')}>
    {mapBindable(value, (shown) => shown ?? READING)}
    <MatchOptional
      value={derive([value, total], (shown, all) =>
        shown === undefined || all === undefined
          ? Optional.none
          : Optional.some({ shown, total: all }),
      )}
      some={(count$) => <OfTotal count={count$} />}
    />
  </span>
);

/** What a count reads while it is not known yet. */
const READING = '…';
