import { Arr } from 'ts-data-forge';

/**
 * Puts a label on the pull request on screen by working GitHub's own label
 * picker — the gear beside "Labels" in the conversation tab's sidebar — the way
 * a person would: open it, filter for the label, select it, close it.
 *
 * It is done through the page rather than through the REST API because the page
 * is signed in already: the label is added as the user, with the permissions
 * they have, and the extension holds no token and sends nothing for it — this
 * needs nothing beyond the content script already on `github.com`. GitHub's
 * pull request page is a React application with no form behind the picker, so
 * there is nothing to submit other than through the picker itself.
 *
 * The price is that it reads GitHub's markup, and only these parts of it, all
 * accessibility attributes, which are what GitHub keeps stable longest:
 *
 * - the button labelled `Manage labels`, which opens the picker;
 * - the input labelled `Filter labels` inside it;
 * - its `role="option"` items, each named by `aria-labelledby` and saying
 *   whether it is on by `aria-selected`.
 *
 * When any of them is missing the result says which step failed, and nothing is
 * left open. `isStillOnPage` is asked before every step that acts, so that a
 * page left while this waits is not the one labelled.
 */
export const addLabelThroughPicker = async (
  labelName: string,
  isStillOnPage: () => boolean,
): Promise<AddLabelResult> => {
  // Each wait gives up as soon as the page is another one: the user may follow
  // a link while this waits, and the next pull request's picker must not be the
  // one worked.
  const mut_openFilter = findFilter() ?? (await openPicker(isStillOnPage));

  if (!isStillOnPage()) {
    if (mut_openFilter !== undefined) {
      closePicker(mut_openFilter);
    }

    return 'left-page';
  }

  if (mut_openFilter === undefined) {
    return 'no-picker';
  }

  // The isolated world's `value` setter is the DOM's own, beneath the one
  // React installs on the element in the page's world, so the `input` event
  // that follows is seen by React as a change.
  mut_openFilter.value = labelName;

  mut_openFilter.dispatchEvent(new Event('input', { bubbles: true }));

  const option = await waitFor(
    () => findOption(labelName),
    stepTimeoutMs,
    isStillOnPage,
  );

  if (!isStillOnPage()) {
    closePicker(mut_openFilter);

    return 'left-page';
  }

  if (option === undefined) {
    closePicker(mut_openFilter);

    return 'no-such-label';
  }

  if (isSelected(option)) {
    closePicker(mut_openFilter);

    return 'already-labelled';
  }

  option.click();

  // Found again on every poll rather than held: a picker that re-renders its
  // list replaces the element that was clicked.
  const selected = await waitFor(
    () => {
      const current = findOption(labelName);

      return current !== undefined && isSelected(current) ? current : undefined;
    },
    stepTimeoutMs,
    isStillOnPage,
  );

  // Closing is what saves the selection, so it is closed whatever happened.
  // Whether it does save is read off the sidebar below rather than assumed: a
  // picker that took Escape as "cancel" would leave the label off, and that is
  // reported as `not-saved`, not as success.
  closePicker(mut_openFilter);

  if (selected === undefined) {
    return isStillOnPage() ? 'not-saved' : 'left-page';
  }

  const shown = await waitFor(
    () => sidebarShows(labelName) || undefined,
    stepTimeoutMs,
    isStillOnPage,
  );

  return shown !== undefined
    ? 'labelled'
    : isStillOnPage()
      ? 'not-saved'
      : 'left-page';
};

/**
 * - `labelled`: selected, and shown in the sidebar after the picker closed.
 * - `already-labelled`: the picker already had it selected; nothing changed.
 * - `no-picker`: no `Manage labels` button — the user may not label this
 *   repository, or the page is not the conversation tab or has not finished
 *   loading — or it did not open.
 * - `no-such-label`: the picker opened and has no label by that name.
 * - `not-saved`: it was selected, but did not show in the sidebar.
 * - `left-page`: the page became another one while this waited. Before the
 *   option was clicked, nothing was done; after it, nothing could be confirmed.
 */
export type AddLabelResult =
  | 'labelled'
  | 'already-labelled'
  | 'no-picker'
  | 'no-such-label'
  | 'not-saved'
  | 'left-page';

/**
 * Long enough for the conversation tab to finish rendering after a client-side
 * navigation to it, which is what happens when the button is used on another
 * tab.
 */
const pickerButtonTimeoutMs = 10_000;

const stepTimeoutMs = 5000;

const pollIntervalMs = 100;

const pickerButtonSelector = 'button[aria-label="Manage labels"]';

const filterSelector = 'input[aria-label="Filter labels"]';

const headingSelector = 'h1, h2, h3, h4, h5, h6';

const findPickerButton = (): HTMLButtonElement | undefined => {
  const element = document.querySelector(pickerButtonSelector);

  return element instanceof HTMLButtonElement ? element : undefined;
};

const findFilter = (): HTMLInputElement | undefined => {
  const element = document.querySelector(filterSelector);

  return element instanceof HTMLInputElement ? element : undefined;
};

/**
 * Asks `lookUp` every 100 ms until it answers, `timeoutMs` has passed, or the
 * page is no longer the one it was asked on — which gives up at once rather
 * than at the deadline, and answers nothing found on the other page.
 */
const waitFor = async <T,>(
  lookUp: () => T | undefined,
  timeoutMs: number,
  isStillOnPage: () => boolean,
): Promise<T | undefined> => {
  const deadline = performance.now() + timeoutMs;

  for (;;) {
    if (!isStillOnPage()) {
      return undefined;
    }

    const found = lookUp();

    if (found !== undefined || performance.now() >= deadline) {
      return found;
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, pollIntervalMs);
    });
  }
};

/**
 * Clicks `Manage labels` and returns the filter of the picker it opens. Called
 * only when no picker is open already: the button toggles it, so a click on an
 * open one would close it.
 */
const openPicker = async (
  isStillOnPage: () => boolean,
): Promise<HTMLInputElement | undefined> => {
  const pickerButton = await waitFor(
    findPickerButton,
    pickerButtonTimeoutMs,
    isStillOnPage,
  );

  if (pickerButton === undefined || !isStillOnPage()) {
    return undefined;
  }

  pickerButton.click();

  return waitFor(findFilter, stepTimeoutMs, isStillOnPage);
};

const accessibleNameOf = (element: Element): string => {
  const ids = element.getAttribute('aria-labelledby');

  return ids === null
    ? element.textContent.trim()
    : ids
        .split(/\s+/u)
        .map(
          (id) =>
            document.querySelector(`#${CSS.escape(id)}`)?.textContent ?? '',
        )
        .join(' ')
        .trim();
};

/**
 * The option whose name is exactly `labelName`. The name is the text of the
 * elements `aria-labelledby` points at; the option's own text runs the name
 * into the label's description, so `merge-queued` and a label called
 * `merge-queued-later` cannot be told apart by it.
 */
const findOption = (labelName: string): HTMLElement | undefined =>
  Array.from(document.querySelectorAll('[role="option"]')).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && accessibleNameOf(element) === labelName,
  );

const isSelected = (option: Element): boolean =>
  option.getAttribute('aria-selected') === 'true';

/** Escape on the filter, which is how the picker closes from the keyboard. */
const closePicker = (filter: HTMLInputElement): void => {
  filter.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
};

/**
 * Whether the sidebar's "Labels" section lists `labelName`.
 *
 * The section is found from the picker's button rather than by a class name,
 * which GitHub generates: it is the nearest ancestor of the button that holds
 * links, and the search stops at the first ancestor holding a second heading,
 * which is past the section — every sidebar section has one. Staying in the
 * section matters because the timeline names labels too ("added
 * merge-queued"), and a match there would say nothing about whether the label
 * is on now.
 */
const sidebarShows = (labelName: string): boolean => {
  const pickerButton = findPickerButton();

  if (pickerButton === undefined) {
    return false;
  }

  for (
    let mut_ancestor = pickerButton.parentElement;
    mut_ancestor !== null && mut_ancestor !== document.body;
    mut_ancestor = mut_ancestor.parentElement
  ) {
    if (
      mut_ancestor.querySelector('[role="option"]') !== null ||
      mut_ancestor.querySelectorAll(headingSelector).length > 1
    ) {
      // The open picker, whose options are not the sidebar, or past the
      // Labels section.
      return false;
    }

    const labels = Array.from(mut_ancestor.querySelectorAll('a'));

    if (Arr.isNonEmpty(labels)) {
      return labels.some((anchor) => anchor.textContent.trim() === labelName);
    }
  }

  return false;
};
