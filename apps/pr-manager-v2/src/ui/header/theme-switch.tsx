import { map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { ColorScheme } from '../../domain/index.mjs';
import type { ThemeStore } from '../../store/index.mjs';

type Props = Readonly<{ theme: ThemeStore }>;

/**
 * Light | Dark (spec §5). Two looks rather than a cycle through "system, light,
 * dark", which would have a press that changes nothing visible.
 */
export const ThemeSwitch = ({ theme }: Props): JSX.Element => {
  const option = (look: ColorScheme, label: string): JSX.Element => (
    <button
      aria-pressed={theme.scheme.pipe(
        map((shown) => (shown === look).toString()),
      )}
      class={constant('button')}
      type={constant('button')}
      onClick={() => {
        theme.pick(look);
      }}
    >
      {constant(label)}
    </button>
  );

  return (
    <span
      class={constant('segmented')}
      role={constant('group')}
      aria-label={constant('Theme')}
      title={theme.theme.pipe(
        map((chosen) =>
          chosen === 'auto'
            ? 'Following the system. Picking the other look keeps it in the URL.'
            : 'Chosen here and kept in the URL. Picking what the system shows follows the system again.',
        ),
      )}
    >
      {option('light', '☀ Light')}
      {option('dark', '☾ Dark')}
    </span>
  );
};
