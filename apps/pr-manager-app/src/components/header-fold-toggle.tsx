import { constant, view, type JSX } from 'synstate-dom';
import { headerStore } from '../store/index.mjs';
import { BadgeIcon } from './badge-icon.js';

/**
 * Folds the header into the toolbar and back: the last of the header's
 * actions, in the same place either way, so that a second press undoes the
 * first without the pointer moving.
 *
 * A disclosure button: the label names what it shows, which does not change,
 * and `aria-expanded` says whether it is shown. The chevron points where the
 * header goes on a press — up to fold it, down to bring it back.
 */
export const HeaderFoldToggle = (): JSX.Element => (
  <button
    aria-expanded={view(headerStore.folded, (folded) => String(!folded))}
    aria-label={constant('Full header')}
    class={constant('header-button header-fold-toggle')}
    title={view(headerStore.folded, (folded) =>
      folded
        ? 'Show the full header, the token panel and when the report was read'
        : 'Fold the header into this toolbar, for more room below',
    )}
    type={constant('button')}
    onClick={headerStore.toggle}
  >
    <BadgeIcon
      path={view(headerStore.folded, (folded) =>
        folded ? CHEVRON_DOWN : CHEVRON_UP,
      )}
    />
  </button>
);

const CHEVRON_UP = 'M3.5 10.5L8 6l4.5 4.5';

const CHEVRON_DOWN = 'M3.5 5.5L8 10l4.5-4.5';
