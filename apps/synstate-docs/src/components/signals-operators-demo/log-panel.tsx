/** @jsxImportSource preact */
import type { Lang } from '../constants.mjs';
import type { LogEntry } from './search-view.mjs';
import { searchViewText as text } from './text.mjs';

type Props = Readonly<{
  title: string;
  /** Newest first. */
  entries: readonly LogEntry[];
  lang: Lang;
}>;

/**
 * Every run of one implementation's view, a run whose list is for another
 * query than the box shows marked as a glitch.
 */
export const LogPanel = ({
  title,
  entries,
  lang,
}: Props): preact.JSX.Element => (
  <section class={'signals-demo-panel'}>
    <h3>{title}</h3>
    <ol class={'signals-demo-log'}>
      {entries.map(({ id, row }) => {
        const glitch = row.state.query !== row.query;

        return (
          <li key={id} class={glitch ? 'signals-demo-glitch' : undefined}>
            <code>{`"${row.query}"`}</code>
            {' / '}
            <code>{`${row.state.status} "${row.state.query}"`}</code>
            {glitch ? (
              <span class={'signals-demo-badge'}>{text.glitch[lang]}</span>
            ) : undefined}
          </li>
        );
      })}
    </ol>
  </section>
);
