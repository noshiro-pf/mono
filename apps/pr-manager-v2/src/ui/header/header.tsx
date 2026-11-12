import { map, onScopeDispose } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { repoSlug, repoUrl, type Repo } from '../../domain/index.mjs';
import type { AppStore } from '../../store/index.mjs';
import { ExternalLink } from '../common/index.mjs';
import './header.css';
import { HowToUse } from './how-to-use.js';
import { RepoSwitch } from './repo-switch.js';
import { ThemeSwitch } from './theme-switch.js';

type Props = Readonly<{
  app: AppStore;
  /** Opens the page for another repository, keeping the rest of the query. */
  go: (repo: Repo) => void;
  /** The Activity button, after How to use. */
  activity?: JSX.Element;
  /** The Refresh button, after the theme. */
  refresh?: JSX.Element;
  /** The line under the header saying when the report was read. */
  readLine?: JSX.Element;
  /** The age alone, for the folded toolbar. */
  readAge?: JSX.Element;
  /** Measured height, for what stays in view under a folded header. */
  onHeight: (px: number) => void;
}>;

/**
 * The header (spec §5). Folded, it is a one-line toolbar that stays at the top
 * of the window; the buttons keep their order either way.
 */
export const Header = ({
  app,
  go,
  activity,
  refresh,
  readLine,
  readAge,
  onHeight,
}: Props): JSX.Element => {
  const { folded } = app.header;

  const repository = (
    <ExternalLink
      class={constant('header-repo')}
      href={constant(repoUrl(app.repo))}
    >
      {constant(repoSlug(app.repo))}
    </ExternalLink>
  );

  return (
    <header
      ref={observeHeight(onHeight)}
      class={constant('header')}
      data-folded={folded.pipe(map((f) => f.toString()))}
    >
      <div class={constant('header-title')}>
        <h1>{constant('GitHub Pull Requests Manager')}</h1>

        <span class={constant('header-subtitle')}>
          {repository}

          <If
            cond={folded}
            then={readAge ?? <></>}
            else={<RepoSwitch go={go} />}
          />
        </span>
      </div>

      <div class={constant('header-actions')}>
        <HowToUse />

        {activity ?? <></>}

        <button
          class={constant('button')}
          type={constant('button')}
          onClick={() => {
            app.layout.setDialogOpen(true);
          }}
        >
          {constant('Layout')}
        </button>

        <ThemeSwitch theme={app.theme} />

        {refresh ?? <></>}

        <button
          aria-label={folded.pipe(
            map((f) =>
              f ? 'Unfold the header' : 'Fold the header into a toolbar',
            ),
          )}
          aria-expanded={folded.pipe(map((f) => (!f).toString()))}
          class={constant('button fold-toggle')}
          type={constant('button')}
          onClick={app.header.toggle}
        >
          {folded.pipe(map((f) => (f ? '⌄' : '⌃')))}
        </button>
      </div>

      <If cond={folded} then={<></>} else={readLine ?? <></>} />
    </header>
  );
};

/** Hands the header's height on whenever it changes, until it goes. */
const observeHeight =
  (onHeight: (px: number) => void) =>
  (header: HTMLElement): void => {
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];

      if (box !== undefined) {
        onHeight(box.blockSize);
      }
    });

    observer.observe(header);

    onScopeDispose(() => {
      observer.disconnect();
    });
  };
