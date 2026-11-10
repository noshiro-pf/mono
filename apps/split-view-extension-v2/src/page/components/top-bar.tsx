import { createBooleanState, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { layoutPresets } from '../../core/index.mjs';
import type { Controller } from '../controller.mjs';
import { ViewPicker } from './view-picker.js';

/**
 * The one row above the stage: every row here is height no pane gets. The
 * picker, the layout presets (spec L4), the framing warnings (spec F2), and in
 * a development build its name and the diagnostics (spec D1).
 */
export const TopBar = ({
  controller,
}: Readonly<{ controller: Controller }>): JSX.Element => {
  const [helpShown$, { toggle: toggleHelp }] = createBooleanState(false);

  return (
    <header class={constant('top-bar')}>
      <div class={constant('top-bar__row')}>
        <ViewPicker controller={controller} />

        <span class={constant('top-bar__separator')} />

        <span class={constant('top-bar__label')}>{constant('Layout')}</span>

        {layoutPresets.map((preset) => (
          <button
            class={constant('button')}
            data-e2e={constant(`preset-${preset.id}`)}
            title={constant(preset.title)}
            type={constant('button')}
            onClick={() => {
              controller.dispatch({
                type: 'apply-preset',
                presetId: preset.id,
              });
            }}
          >
            {constant(preset.label)}
          </button>
        ))}

        <If
          cond={controller.hostAccess$.pipe(map((granted) => !granted))}
          then={
            <button
              class={constant('top-bar__alert')}
              title={constant(
                'This extension is not allowed to act on sites. Check that "Site access" is "On all sites" on its card in chrome://extensions.',
              )}
              type={constant('button')}
              onClick={controller.requestHostAccess}
            >
              {constant('⚠ Grant site access')}
            </button>
          }
        />

        <If
          cond={controller.ruleActive$.pipe(map((active) => !active))}
          then={
            <span
              class={constant('top-bar__alert')}
              role={constant('status')}
              title={constant(
                'The rule that strips embedding-refusal headers is not in place, so most sites will refuse to appear in a pane. Reload the tab.',
              )}
            >
              {constant('⚠ Framing rule not applied')}
            </span>
          }
        />

        <If
          cond={controller.notice$.pipe(map((notice) => notice !== undefined))}
          then={
            <span
              aria-live={constant('polite')}
              class={constant('top-bar__notice')}
              data-e2e={constant('view-notice')}
              role={constant('status')}
            >
              {controller.notice$.pipe(map((notice) => notice ?? ''))}
            </span>
          }
        />

        <span class={constant('top-bar__spacer')} />

        {SPLIT_VIEW_DIAGNOSTICS
          ? [
              <span
                class={constant('top-bar__build')}
                title={constant(
                  `${SPLIT_VIEW_BUILD_ID} — the build running here.`,
                )}
              >
                {constant(
                  SPLIT_VIEW_BUILD_ID.split(' (', 1)[0] ?? SPLIT_VIEW_BUILD_ID,
                )}
              </span>,
              <button
                class={constant('button')}
                title={constant(
                  'Show the rules, and what they matched in this tab',
                )}
                type={constant('button')}
                onClick={controller.collectDiagnostics}
              >
                {constant('Diagnostics')}
              </button>,
            ]
          : []}

        <button
          aria-expanded={helpShown$.pipe(map((shown) => shown.toString()))}
          aria-label={constant('Help')}
          class={constant('button')}
          data-e2e={constant('help-toggle')}
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
        cond={controller.diagnostics$.pipe(map((text) => text !== undefined))}
        then={
          <pre class={constant('top-bar__diagnostics')}>
            {controller.diagnostics$.pipe(map((text) => text ?? ''))}
          </pre>
        }
      />

      <If
        cond={helpShown$}
        then={
          <ul class={constant('top-bar__help')} data-e2e={constant('help')}>
            {helpLines.map((line) => (
              <li>{constant(line)}</li>
            ))}
          </ul>
        }
      />
    </header>
  );
};

const helpLines = [
  'Split a pane with the buttons in its toolbar, and drag a divider — or focus it and use the arrow keys, Home and End — to change the ratio. The layout and the addresses are saved per split view.',
  'Zoom one pane with − / +, or Ctrl + wheel over it. Clicking the percentage goes back to 100%. Zoom is saved, and travels with a pane you move.',
  'Move a pane by dragging the grip at the left of its toolbar: onto the middle of another pane to swap, onto an edge to take that side. Neither reloads. Escape calls it off.',
  'The select is the list of saved split views; choosing one swaps this tab’s contents for it, and Alt+1..9 does the same, even with the focus in a pane. ＋ adds one, in a new tab.',
  'Edit renames, reorders and deletes one, opens it or all of them in tabs, and exports the list to JSON. Importing that JSON is the way back if the extension id ever changes.',
  'A site you are signed in to may appear signed out, because a pane is a third-party context for its cookies. Open it in a new tab from the pane’s toolbar.',
  'The padlock means the sandbox is on, which stops a page replacing the whole split view with itself. Turn it off only for a page that needs it.',
  'A warning sign means the page has not answered: it refuses to be framed, or it is a page the extension cannot run its script in — a chrome:// URL, the Web Store, an error page.',
] as const;
