import {
  asPaneButtonOutcome,
  createDomExecutor,
  type DomOp,
  type DomValue,
  type PaneButtonOutcome,
} from 'split-view-link';
import { Arr } from 'ts-data-forge';
import {
  asPartnerButtons,
  workerMessageTag,
  type PaneButtonPress,
  type PaneButtonsQuery,
  type PartnerButton,
} from '../shared/index.mjs';

/**
 * The buttons other extensions put in a pane (`pane-bridge.mts` in
 * `split-view-link`), at the pane's bottom left, and the steps they take on the
 * pane's page once one is pressed.
 *
 * The content script of a pane makes one of these and calls `show` with the
 * page's address whenever it changes; the buttons are asked for again only
 * then. A press disables every button, shows the partner's `busyLabel`, and
 * then its outcome for a few seconds. While it is in flight the worker passes
 * the partner's steps to `run`.
 *
 * The buttons sit in a shadow root on `<html>`, like any the site might add, so
 * the site's styles do not reach them and a site that replaces its body on
 * navigation does not take them with it.
 */
export const createPaneButtons = (): Readonly<{
  /** The page is at `url` now: ask for its buttons, if they may differ. */
  show: (url: string) => void;
  /**
   * Runs one of the partner's steps on this page, while a press made here is in
   * flight; `null` at any other time.
   */
  run: (op: DomOp) => DomValue;
}> => {
  const mut_host = document.createElement('div');

  const mut_shadow = mut_host.attachShadow({ mode: 'open' });

  const style = new CSSStyleSheet();

  style.replaceSync(css);

  // A constructed style sheet rather than a `<style>`, which the site's CSP
  // would be asked about.
  mut_shadow.adoptedStyleSheets = [style];

  mut_host.hidden = true;

  const executor = createDomExecutor();

  const mut_state: {
    url: string | undefined;
    busy: boolean;
    buttons: readonly PartnerButton[];
  } = { url: undefined, busy: false, buttons: [] };

  const render = (): void => {
    mut_shadow.replaceChildren(
      ...mut_state.buttons.map((button) => {
        const mut_element = document.createElement('button');

        mut_element.type = 'button';

        mut_element.textContent = button.label;

        mut_element.title = button.title;

        const showText = (
          text: string,
          tone: PaneButtonOutcome['tone'] | undefined,
        ): void => {
          mut_element.textContent = text;

          if (tone === undefined) {
            delete mut_element.dataset['tone'];
          } else {
            mut_element.dataset['tone'] = tone;
          }
        };

        mut_element.addEventListener('click', () => {
          press(button, showText);
        });

        return mut_element;
      }),
    );

    mut_host.hidden = Arr.isEmpty(mut_state.buttons);

    if (!mut_host.isConnected && !mut_host.hidden) {
      document.documentElement.append(mut_host);
    }
  };

  const show = (url: string): void => {
    if (url === mut_state.url) {
      return;
    }

    mut_state.url = url;

    // A press in flight finishes on the buttons it started on; the new page's
    // are asked for when it is done.
    if (mut_state.busy) {
      return;
    }

    const query: PaneButtonsQuery = {
      tag: workerMessageTag,
      kind: 'pane-buttons',
      url,
    } as const;

    chrome.runtime
      .sendMessage(query)
      .then((answer: unknown) => {
        // The page may have moved on while the worker asked.
        if (mut_state.url !== url || mut_state.busy) {
          return;
        }

        mut_state.buttons = asPartnerButtons(answer);

        render();
      })
      .catch(() => undefined);
  };

  const press = (
    button: PartnerButton,
    showText: (
      text: string,
      tone: PaneButtonOutcome['tone'] | undefined,
    ) => void,
  ): void => {
    if (mut_state.busy) {
      return;
    }

    mut_state.busy = true;

    // Handles from an earlier press name nothing the partner holds now.
    executor.reset();

    for (const mut_other of mut_shadow.querySelectorAll('button')) {
      mut_other.disabled = true;
    }

    showText(button.busyLabel, undefined);

    const message: PaneButtonPress = {
      tag: workerMessageTag,
      kind: 'pane-button-press',
      partnerId: button.partnerId,
      buttonId: button.id,
      url: document.location.href,
    } as const;

    chrome.runtime
      .sendMessage(message)
      .then(asPaneButtonOutcome)
      .catch(() => undefined)
      .then(async (outcome) => {
        const { label, tone } = outcome ?? noOutcome;

        showText(label, tone);

        await new Promise((resolve) => {
          setTimeout(resolve, outcomeShownMs);
        });
      })
      .finally(() => {
        mut_state.busy = false;

        // Drawn again, ready, and asked for again, since the page may have
        // moved while the press was in flight.
        render();

        mut_state.url = undefined;

        show(document.location.href);
      })
      .catch(() => undefined);
  };

  return {
    show,
    // Only while a press made in this very document is in flight. The worker
    // passes a step on by tab and frame, and the frame may hold another
    // document by now, which the partner was never asked into: its content
    // script has a fresh `mut_state`, not busy, and takes no step.
    run: (op) => (mut_state.busy ? executor.run(op) : null),
  };
};

/** What a press that got no answer shows: the partner is gone, or failed. */
const noOutcome: PaneButtonOutcome = {
  label: '✕ no answer',
  tone: 'failure',
} as const;

/** How long the outcome stays on the button before it is ready again. */
const outcomeShownMs = 3000;

const css = [
  ':host {',
  '  all: initial;',
  '  position: fixed;',
  '  left: 16px;',
  '  bottom: 16px;',
  '  z-index: 2147483000;',
  '  display: flex;',
  '  gap: 8px;',
  '}',
  '',
  ':host([hidden]) {',
  '  display: none;',
  '}',
  '',
  'button {',
  '  font: 600 12px/1 system-ui, sans-serif;',
  '  padding: 7px 10px;',
  '  border: 1px solid rgb(127 127 127 / 40%);',
  '  border-radius: 6px;',
  '  background: #24292f;',
  '  color: #ffffff;',
  '  opacity: 0.8;',
  '  cursor: pointer;',
  '}',
  '',
  'button:hover,',
  'button:focus-visible {',
  '  opacity: 1;',
  '}',
  '',
  'button:disabled {',
  '  cursor: progress;',
  '  opacity: 0.5;',
  '}',
  '',
  'button[data-tone="success"] {',
  '  background: #1a7f37;',
  '  opacity: 1;',
  '}',
  '',
  'button[data-tone="failure"] {',
  '  background: #cf222e;',
  '  opacity: 1;',
  '}',
].join('\n');
