import * as React from 'react';
import { memoNamed } from 'react-utils';
import {
  layoutPresets,
  type LayoutPreset,
  type PresetId,
} from '../layout/index.mjs';

/**
 * The one toolbar row.
 *
 * One row rather than two: every row here is height the panes do not get, for
 * the whole session. `children` is the split view picker, which sits at the
 * start of the row — passed in rather than reached for, so that the toolbar
 * does not have to carry ten props it only forwards.
 */
export const TopBar = memoNamed(
  'TopBar',
  ({
    children,
    diagnostics,
    headerRuleActive,
    hostAccessGranted,
    onApplyPreset,
    onCollectDiagnostics,
    onRequestHostAccess,
  }: Readonly<{
    children: React.ReactNode;
    diagnostics: string | undefined;
    headerRuleActive: boolean;
    hostAccessGranted: boolean;
    onApplyPreset: (presetId: PresetId) => void;
    onCollectDiagnostics: () => void;
    onRequestHostAccess: () => void;
  }>) => {
    const [helpShown, setHelpShown] = React.useState(false);

    const handleToggleHelp = React.useCallback((): void => {
      setHelpShown((shown) => !shown);
    }, []);

    return (
      <div className={'top-bar'}>
        <div className={'top-bar__row'}>
          {children}

          <span className={'top-bar__separator'} />

          <span className={'top-bar__label'}>{'Layout'}</span>

          {layoutPresets.map((preset) => (
            <PresetButton
              key={preset.id}
              preset={preset}
              onApply={onApplyPreset}
            />
          ))}

          {hostAccessGranted ? undefined : (
            <button
              className={'top-bar__alert'}
              title={
                'This extension is not allowed to act on sites. Check that "Site access" is set to "On all sites" on its card in chrome://extensions.'
              }
              type={'button'}
              onClick={onRequestHostAccess}
            >
              {'⚠ Grant site access'}
            </button>
          )}

          {headerRuleActive ? undefined : (
            <span
              className={'top-bar__alert'}
              title={
                'The rule that strips embedding-refusal headers is not in place, so most sites will refuse to appear in a pane. Reload the tab.'
              }
            >
              {'⚠ Framing rule not applied'}
            </span>
          )}

          <span className={'top-bar__spacer'} />

          {SPLIT_VIEW_DIAGNOSTICS ? (
            <span
              className={'top-bar__build'}
              title={`${SPLIT_VIEW_BUILD_ID} — the build this split view is running. If it changes after you reload the extension, the new build is in.`}
            >
              {buildName}
            </span>
          ) : undefined}

          {SPLIT_VIEW_DIAGNOSTICS ? (
            <button
              className={'top-bar__button'}
              title={
                'Show the header-stripping rules, and what they matched in this tab'
              }
              type={'button'}
              onClick={onCollectDiagnostics}
            >
              {'Diagnostics'}
            </button>
          ) : undefined}
          <button
            aria-expanded={helpShown}
            className={'top-bar__button'}
            title={'How it works, and what it cannot do'}
            type={'button'}
            onClick={handleToggleHelp}
          >
            {'?'}
          </button>
        </div>

        {diagnostics === undefined ? undefined : (
          <pre className={'top-bar__diagnostics'}>{diagnostics}</pre>
        )}

        {helpShown ? (
          <ul className={'top-bar__help'}>
            <li>
              {
                'Split a pane with ⬌ / ⬍ in its toolbar, and drag any divider to change the ratio. The layout and the addresses are saved per split view, so a reload comes back to them.'
              }
            </li>
            <li>
              {
                'Zoom one pane with − / +, or Ctrl + wheel over it (a trackpad pinch counts). The percentage appears beside the buttons when it is not 100%, and clicking it goes back. Zoom is saved, and travels with a pane you move.'
              }
            </li>
            <li>
              {
                'Move a pane by dragging the ⠿ at the left of its toolbar. Drop it on the middle of another pane to swap the two, or on an edge to take that side. Neither reloads: the scroll position and the history stay as they were. Escape calls it off.'
              }
            </li>
            <li>
              {
                'The select at the left is the list of saved split views. Choosing one swaps this tab’s contents for it, and Alt+1..9 does the same — even with the focus inside a pane. ＋ adds one.'
              }
            </li>
            <li>
              {
                '[Edit] renames, reorders and deletes one, opens it in a tab of its own, and writes the whole list to JSON. The number is the position in the list, and it is the N in Alt+N. Importing that JSON is the way back if the extension id ever changes.'
              }
            </li>
            <li>
              {
                'A site you are signed in to may appear signed out, because a pane is a third-party context for its cookies. ↗ opens that pane’s address in an ordinary tab.'
              }
            </li>
            <li>
              {
                '🔒 means the sandbox is on, which is what stops a page from replacing the whole split view with itself. Turn it off (🔓) only for a page that needs it.'
              }
            </li>
            <li>
              {
                '⚠ means the page has not answered. It is either refusing to be framed, or a page the extension cannot run its script in — a chrome:// URL, the Web Store, an error page.'
              }
            </li>
          </ul>
        ) : undefined}
      </div>
    );
  },
);

/**
 * The build's name without its timestamp, which the tooltip keeps. The name
 * changes with every build, so it answers "did my rebuild land?" on its own,
 * and it is a third of the width.
 */
const buildName = SPLIT_VIEW_BUILD_ID.split(' (', 1)[0] ?? SPLIT_VIEW_BUILD_ID;

const PresetButton = memoNamed(
  'PresetButton',
  ({
    preset,
    onApply,
  }: Readonly<{
    preset: LayoutPreset;
    onApply: (presetId: PresetId) => void;
  }>) => {
    const handleClick = React.useCallback((): void => {
      onApply(preset.id);
    }, [onApply, preset.id]);

    return (
      <button
        className={'top-bar__button'}
        title={preset.title}
        type={'button'}
        onClick={handleClick}
      >
        {preset.label}
      </button>
    );
  },
);
