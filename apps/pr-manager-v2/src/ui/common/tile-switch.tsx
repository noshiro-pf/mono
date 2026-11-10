import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { TileCount, Tone } from '../../domain/index.mjs';
import './common.css';
import { TileValue } from './tile-value.js';

type Props = Readonly<{
  count: InitializedObservable<TileCount>;
  label: string;
  /** What it counts, for the tooltips: `the pull requests that are failing`. */
  subject: string;
  /** Drawn only while it counts some and they are shown. */
  tone?: Tone | undefined;
  /** What the label means, said in the tooltip before what a click does. */
  description?: string;
  only: InitializedObservable<boolean>;
  onToggle: () => void;
  onOnly: () => void;
}>;

/**
 * A count that is a switch for what it counts (`aria-pressed`), with an `only`
 * switch over its corner — beside it rather than inside, since a button cannot
 * hold another, and always drawn, since the page is used on phones too. A
 * hidden count is how many showing would add, struck through.
 */
export const TileSwitch = ({
  count,
  label,
  subject,
  tone,
  description,
  only,
  onToggle,
  onOnly,
}: Props): JSX.Element => (
  <div class={constant('tile-cell')}>
    <button
      aria-pressed={count.pipe(map(({ hidden }) => !hidden))}
      class={constant('tile tile-switch')}
      data-tone={count.pipe(
        map(({ count: n, hidden }) => (!hidden && n > 0 ? (tone ?? '') : '')),
      )}
      title={count.pipe(
        map(({ hidden }) =>
          Arr.toPushed(
            description === undefined ? [] : [description],
            hidden
              ? `Hidden. Click to show ${subject}.`
              : `Shown. Click to hide ${subject}.`,
          ).join('\n'),
        ),
      )}
      type={constant('button')}
      onClick={onToggle}
    >
      <TileValue count={count} />
      <span class={constant('tile-label')}>{constant(label)}</span>
    </button>
    <button
      aria-label={constant(`Show only ${label}`)}
      aria-pressed={only}
      class={constant('tile-only')}
      title={only.pipe(
        map((picked) =>
          picked
            ? `Picked. Click to stop showing only ${subject}.`
            : `Click to show only ${subject}.`,
        ),
      )}
      type={constant('button')}
      onClick={onOnly}
    >
      {constant('only')}
    </button>
  </div>
);
