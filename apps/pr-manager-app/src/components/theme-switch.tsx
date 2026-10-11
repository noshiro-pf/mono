import { memoNamed } from 'preact-utils';
import { themeSignals, themeStore } from '../store/index.mjs';
import { effectiveTheme, type ColorScheme } from '../theme.mjs';
import { BadgeIcon } from './badge-icon.js';

/**
 * Switches the page between light and dark: two buttons side by side, each
 * naming its look, and the pressed one (`aria-pressed`) is what is on screen.
 * A lone toggle labelled with one look says nothing about the other, and a
 * label that flips with the state is wrong half the time, depending on how it
 * is read; a pair has neither problem. What a pick means is in `theme.mts`:
 * the URL keeps it, unless it is what the system shows anyway.
 */
export const ThemeSwitch = memoNamed('ThemeSwitch', () => {
  const theme = themeSignals.theme.value;

  const system = themeSignals.system.value;

  const shown = effectiveTheme(theme, system);

  return (
    <fieldset
      aria-label={'Theme'}
      className={'theme-switch'}
      title={
        theme === 'auto'
          ? 'Following the system. Picking the other look keeps it in the URL.'
          : 'Chosen here, and kept in the URL. Picking what the system shows follows the system again.'
      }
    >
      <button
        aria-pressed={shown === 'light'}
        className={'theme-switch-option'}
        type={'button'}
        onClick={chooseLight}
      >
        <BadgeIcon path={SUN} />
        {'Light'}
      </button>

      <button
        aria-pressed={shown === 'dark'}
        className={'theme-switch-option'}
        type={'button'}
        onClick={chooseDark}
      >
        <BadgeIcon path={MOON} />
        {'Dark'}
      </button>
    </fieldset>
  );
});

// Outside the component, since neither reads its props.

const choose = (picked: ColorScheme) => (): void => {
  themeStore.choose(picked);
};

const chooseLight = choose('light');

const chooseDark = choose('dark');

const SUN =
  'M8 5a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06';

const MOON = 'M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z';
