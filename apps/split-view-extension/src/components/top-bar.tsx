import { createBooleanState } from 'synstate';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
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
export const TopBar = ({
  children,
  diagnostics,
  headerRuleActive,
  hostAccessGranted,
  onApplyPreset,
  onCollectDiagnostics,
  onRequestHostAccess,
}: Readonly<{
  children: Child;
  diagnostics: Bindable<string | undefined>;
  headerRuleActive: Bindable<boolean>;
  hostAccessGranted: Bindable<boolean>;
  onApplyPreset: (presetId: PresetId) => void;
  onCollectDiagnostics: () => void;
  onRequestHostAccess: () => void;
}>): JSX.Element => {
  const [helpShown$, { toggle: toggleHelp }] = createBooleanState(false);

  return (
    <div class={constant('top-bar')}>
      <div class={constant('top-bar__row')}>
        {children}

        <span class={constant('top-bar__separator')} />

        <span class={constant('top-bar__label')}>{constant('Layout')}</span>

        {layoutPresets.map((preset) => (
          <PresetButton preset={preset} onApply={onApplyPreset} />
        ))}

        <If
          cond={mapBindable(hostAccessGranted, (granted) => !granted)}
          then={
            <button
              class={constant('top-bar__alert')}
              title={constant(
                'This extension is not allowed to act on sites. Check that "Site access" is set to "On all sites" on its card in chrome://extensions.',
              )}
              type={constant('button')}
              onClick={onRequestHostAccess}
            >
              {constant('⚠ Grant site access')}
            </button>
          }
        />

        <If
          cond={mapBindable(headerRuleActive, (active) => !active)}
          then={
            <span
              class={constant('top-bar__alert')}
              title={constant(
                'The rule that strips embedding-refusal headers is not in place, so most sites will refuse to appear in a pane. Reload the tab.',
              )}
            >
              {constant('⚠ Framing rule not applied')}
            </span>
          }
        />

        <span class={constant('top-bar__spacer')} />

        {SPLIT_VIEW_DIAGNOSTICS
          ? [
              <span
                class={constant('top-bar__build')}
                title={constant(
                  `${SPLIT_VIEW_BUILD_ID} — the build this split view is running. If it changes after you reload the extension, the new build is in.`,
                )}
              >
                {constant(buildName)}
              </span>,
              <button
                class={constant('top-bar__button')}
                title={constant(
                  'Show the header-stripping rules, and what they matched in this tab',
                )}
                type={constant('button')}
                onClick={onCollectDiagnostics}
              >
                {constant('Diagnostics')}
              </button>,
            ]
          : []}
        <button
          aria-expanded={mapBindable(helpShown$, (shown) =>
            shown ? 'true' : 'false',
          )}
          class={constant('top-bar__button')}
          title={constant('How it works, and what it cannot do')}
          type={constant('button')}
          onClick={() => {
            toggleHelp();
          }}
        >
          {constant('?')}
        </button>
      </div>

      <If
        cond={mapBindable(diagnostics, (shown) => shown !== undefined)}
        then={
          <pre class={constant('top-bar__diagnostics')}>
            {mapBindable(diagnostics, (shown) => shown ?? '')}
          </pre>
        }
      />

      <If
        cond={helpShown$}
        then={
          <ul class={constant('top-bar__help')} data-e2e={constant('help')}>
            <li>
              {constant(
                'Split a pane with ⬌ / ⬍ in its toolbar, and drag any divider to change the ratio. The layout and the addresses are saved per split view, so a reload comes back to them.',
              )}
            </li>
            <li>
              {constant(
                'Zoom one pane with − / +, or Ctrl + wheel over it (a trackpad pinch counts). The percentage appears beside the buttons when it is not 100%, and clicking it goes back. Zoom is saved, and travels with a pane you move.',
              )}
            </li>
            <li>
              {constant(
                'Move a pane by dragging the ⠿ at the left of its toolbar. Drop it on the middle of another pane to swap the two, or on an edge to take that side. Neither reloads: the scroll position and the history stay as they were. Escape calls it off.',
              )}
            </li>
            <li>
              {constant(
                'The select at the left is the list of saved split views. Choosing one swaps this tab’s contents for it, and Alt+1..9 does the same — even with the focus inside a pane. ＋ adds one, in a new tab.',
              )}
            </li>
            <li>
              {constant(
                '[Edit] renames, reorders and deletes one, opens it in a tab of its own, and writes the whole list to JSON. The number is the position in the list, and it is the N in Alt+N. Importing that JSON is the way back if the extension id ever changes.',
              )}
            </li>
            <li>
              {constant(
                'A site you are signed in to may appear signed out, because a pane is a third-party context for its cookies. ↗ opens that pane’s address in an ordinary tab.',
              )}
            </li>
            <li>
              {constant(
                '🔒 means the sandbox is on, which is what stops a page from replacing the whole split view with itself. Turn it off (🔓) only for a page that needs it.',
              )}
            </li>
            <li>
              {constant(
                '⚠ means the page has not answered. It is either refusing to be framed, or a page the extension cannot run its script in — a chrome:// URL, the Web Store, an error page.',
              )}
            </li>
          </ul>
        }
      />
    </div>
  );
};

/**
 * The build's name without its timestamp, which the tooltip keeps. The name
 * changes with every build, so it answers "did my rebuild land?" on its own,
 * and it is a third of the width.
 */
const buildName = SPLIT_VIEW_BUILD_ID.split(' (', 1)[0] ?? SPLIT_VIEW_BUILD_ID;

const PresetButton = ({
  preset,
  onApply,
}: Readonly<{
  preset: LayoutPreset;
  onApply: (presetId: PresetId) => void;
}>): JSX.Element => (
  <button
    class={constant('top-bar__button')}
    title={constant(preset.title)}
    type={constant('button')}
    onClick={() => {
      onApply(preset.id);
    }}
  >
    {constant(preset.label)}
  </button>
);
