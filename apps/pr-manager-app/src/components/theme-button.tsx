import * as React from 'react';
import { useObservableValue } from 'synstate-react-hooks';
import { themeStore } from '../store/index.mjs';
import { effectiveTheme } from '../theme.mjs';
import { BadgeIcon } from './badge-icon.js';

/**
 * Switches the page between light and dark.
 *
 * A toggle button — `aria-pressed` is whether the page is dark — rather than
 * a button that names what it is about to do: a label that flips to the
 * opposite of the state it sits in is a label that is wrong half the time,
 * depending on how it is read. What a press does is in `theme.mts`: it flips
 * what is on screen, and the URL keeps it.
 */
export const ThemeButton = React.memo(() => {
  const theme = useObservableValue(themeStore.theme);

  const system = useObservableValue(themeStore.system);

  const dark = effectiveTheme(theme, system) === 'dark';

  return (
    <button
      aria-pressed={dark}
      className={'theme-button'}
      title={
        theme === 'auto'
          ? 'Following the system. A press switches, and the URL keeps it.'
          : 'Chosen here, and kept in the URL. A press back to what the system shows follows the system again.'
      }
      type={'button'}
      onClick={themeStore.toggle}
    >
      <BadgeIcon path={dark ? MOON : SUN} />
      {'Dark'}
    </button>
  );
});

ThemeButton.displayName = 'ThemeButton';

const SUN =
  'M8 5a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06';

const MOON = 'M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z';
