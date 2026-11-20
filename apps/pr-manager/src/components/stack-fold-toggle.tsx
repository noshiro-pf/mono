import { map, type InitializedObservable } from 'synstate';
import { constant, deriveBindable, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { stackFoldStore } from '../store/index.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  number: InitializedObservable<number>;
  /** How many pull requests are below it in the tree. */
  layers: InitializedObservable<number>;
  folded: InitializedObservable<boolean>;
}>;

/**
 * Folds what is below a pull request in the merge order, and unfolds it: at the
 * end of the card's badges, where it is in the same place folded or not, so
 * that a second press undoes the first without the pointer moving.
 *
 * A disclosure button, as the header's fold is: `aria-expanded` says whether
 * the layers are shown, and the chevron points where they go on a press.
 */
export const StackFoldToggle = ({
  number,
  layers,
  folded,
}: Props): JSX.Element => (
  <button
    aria-expanded={folded.pipe(map((isFolded) => !isFolded))}
    class={constant('stack-fold-toggle')}
    data-folded={folded.pipe(map((isFolded) => (isFolded ? 'true' : 'false')))}
    title={deriveBindable([number, layers, folded], (n, count, isFolded) =>
      isFolded
        ? `Show the ${layersText(count)} below #${n}`
        : `Fold the ${layersText(count)} below #${n} into one line`,
    )}
    type={constant('button')}
    onClick={() => {
      stackFoldStore.toggle(Optional.unwrap(number.getSnapshot()));
    }}
  >
    <BadgeIcon
      path={folded.pipe(
        map((isFolded) => (isFolded ? CHEVRON_RIGHT : CHEVRON_DOWN)),
      )}
    />
    {deriveBindable([layers, folded], (count, isFolded) =>
      isFolded ? `+${count} folded` : `${count} below`,
    )}
  </button>
);

const CHEVRON_DOWN = 'M3.5 5.5L8 10l4.5-4.5';

const CHEVRON_RIGHT = 'M6 3.5L10.5 8 6 12.5';

const layersText = (count: number): string =>
  count === 1 ? '1 pull request' : (`${count} pull requests` as const);
