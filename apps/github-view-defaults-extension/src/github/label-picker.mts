import { Arr } from 'ts-data-forge';

/**
 * Puts a label on the pull request on screen by working GitHub's own label
 * picker — the gear beside "Labels" in the conversation tab's sidebar — the way
 * a person would: open it, select the label, close it, and read the sidebar
 * back.
 *
 * It is done through the page rather than through the REST API because the page
 * is signed in already: the label is added as the user, with the permissions
 * they have, and the extension holds no token and sends nothing for it — this
 * needs nothing beyond the content script already on `github.com`.
 *
 * GitHub has drawn the sidebar two ways, and has gone from the one to the other
 * and back, so both are worked; which one a page has is read off the page each
 * time. What is read of either is accessibility attributes as far as they go,
 * which are what GitHub keeps stable longest:
 *
 * - **The server-rendered sidebar** (`classicPicker`): a `<details>` holding
 *   the `Filter labels` input, opened and closed by its `<summary>`; its
 *   `role="menuitemcheckbox"` items, loaded when it opens, say whether they are
 *   on by `aria-checked` and name their label by the `data-label-name` of the
 *   checkbox inside. Closing it is what submits the change.
 * - **The React sidebar** (`reactPicker`): the button labelled
 *   `Manage labels`, which opens a dialog holding the `Filter labels` input and
 *   `role="option"` items, each named by `aria-labelledby` and saying whether
 *   it is on by `aria-selected`. Closing it with Escape is what saves.
 *
 * When any of it is missing the result says which step failed, and nothing is
 * left open. `isStillOnPage` is asked before every step that acts, so that a
 * page left while this waits is not the one labelled.
 */
export const addLabelThroughPicker = async (
  labelName: string,
  isStillOnPage: () => boolean,
): Promise<AddLabelResult> => {
  // The conversation may still be rendering after a client-side navigation to
  // it, so the page is waited on until one picker or the other is there.
  const picker = await waitFor(
    findPicker,
    pickerButtonTimeoutMs,
    isStillOnPage,
  );

  return !isStillOnPage()
    ? 'left-page'
    : picker === undefined
      ? 'no-picker'
      : picker === 'classic'
        ? addThroughClassicPicker(labelName, isStillOnPage)
        : addThroughReactPicker(labelName, isStillOnPage);
};

/**
 * - `labelled`: selected, and shown in the sidebar after the picker closed.
 * - `already-labelled`: the picker already had it selected; nothing changed.
 * - `no-picker`: no label picker — the user may not label this repository, or
 *   the page is not the conversation tab or has not finished loading — or it
 *   did not open.
 * - `no-such-label`: the picker opened and has no label by that name.
 * - `not-saved`: it was selected, but did not show in the sidebar.
 * - `left-page`: the page became another one while this waited. Before the
 *   label was clicked, nothing was done; after it, nothing could be confirmed.
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

const filterSelector = 'input[aria-label="Filter labels"]';

const reactPickerButtonSelector = 'button[aria-label="Manage labels"]';

const headingSelector = 'h1, h2, h3, h4, h5, h6';

const classicItemSelector = '[role="menuitemcheckbox"]';

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

const findFilter = (): HTMLInputElement | undefined => {
  const element = document.querySelector(filterSelector);

  return element instanceof HTMLInputElement ? element : undefined;
};

/** Whether the sidebar's labels list, below the picker, names `labelName`. */
const listsLabel = (links: Iterable<Element>, labelName: string): boolean =>
  Array.from(links).some((anchor) => anchor.textContent.trim() === labelName);

// The server-rendered sidebar

/**
 * The `<details>` the filter input is in. Found afresh every time: GitHub
 * replaces the whole sidebar section when the labels change.
 */
const findClassicPicker = (): HTMLDetailsElement | undefined => {
  const details = findFilter()?.closest('details');

  return details instanceof HTMLDetailsElement ? details : undefined;
};

const labelNameOfCheckbox = (checkbox: Element | null): string | undefined =>
  checkbox instanceof HTMLElement ? checkbox.dataset['labelName'] : undefined;

/**
 * The item for exactly `labelName`, by the `data-label-name` of the checkbox
 * inside it. Its text runs the name into the label's description, so
 * `merge-queued` and a label called `merge-queued-later` could not be told
 * apart by that.
 */
const findClassicItem = (
  picker: Element,
  labelName: string,
): HTMLElement | undefined =>
  Array.from(picker.querySelectorAll(classicItemSelector)).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      labelNameOfCheckbox(element.querySelector('input[data-label-name]')) ===
        labelName,
  );

const isChecked = (item: Element): boolean =>
  item.getAttribute('aria-checked') === 'true';

/**
 * Whether the labels listed under the menu, in the same sidebar section, name
 * `labelName`. Only that section: the timeline names labels too ("added
 * merge-queued"), and a match there would say nothing about whether the label
 * is on now. The links inside the menu are its own, not the list.
 */
const classicSidebarShows = (labelName: string): boolean => {
  const picker = findClassicPicker();

  const section = picker?.parentElement;

  if (picker === undefined || section === null || section === undefined) {
    return false;
  }

  return listsLabel(
    Array.from(section.querySelectorAll('a')).filter(
      (anchor) => !picker.contains(anchor),
    ),
    labelName,
  );
};

const addThroughClassicPicker = async (
  labelName: string,
  isStillOnPage: () => boolean,
): Promise<AddLabelResult> => {
  const picker = findClassicPicker();

  const summary = picker?.querySelector(':scope > summary');

  if (picker === undefined || !(summary instanceof HTMLElement)) {
    return 'no-picker';
  }

  // A menu the user already opened is used as it is: the summary toggles it, so
  // a click would close it.
  if (!picker.open) {
    summary.click();
  }

  // The items are loaded once the menu opens. All of them are, so the filter is
  // left alone: the item is there whether or not the list is filtered to it.
  const item = await waitFor(
    () => findClassicItem(picker, labelName),
    stepTimeoutMs,
    isStillOnPage,
  );

  const closeMenu = (): void => {
    if (picker.open) {
      summary.click();
    }
  };

  if (!isStillOnPage()) {
    closeMenu();

    return 'left-page';
  }

  if (item === undefined) {
    closeMenu();

    return picker.querySelector(classicItemSelector) === null
      ? 'no-picker'
      : 'no-such-label';
  }

  if (isChecked(item)) {
    closeMenu();

    return 'already-labelled';
  }

  item.click();

  const checked = await waitFor(
    () => (isChecked(item) ? item : undefined),
    stepTimeoutMs,
    isStillOnPage,
  );

  // Closing is what submits the change, so it is closed whatever happened, and
  // whether it was saved is read off the sidebar GitHub draws again afterwards.
  closeMenu();

  if (checked === undefined) {
    return isStillOnPage() ? 'not-saved' : 'left-page';
  }

  const shown = await waitFor(
    () => classicSidebarShows(labelName) || undefined,
    stepTimeoutMs,
    isStillOnPage,
  );

  return shown !== undefined
    ? 'labelled'
    : isStillOnPage()
      ? 'not-saved'
      : 'left-page';
};

// The React sidebar

const findReactPickerButton = (): HTMLButtonElement | undefined => {
  const element = document.querySelector(reactPickerButtonSelector);

  return element instanceof HTMLButtonElement ? element : undefined;
};

/**
 * Clicks `Manage labels` and returns the filter of the picker it opens. Called
 * only when no picker is open already: the button toggles it, so a click on an
 * open one would close it.
 */
const openReactPicker = async (
  isStillOnPage: () => boolean,
): Promise<HTMLInputElement | undefined> => {
  const pickerButton = findReactPickerButton();

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
const findReactOption = (labelName: string): HTMLElement | undefined =>
  Array.from(document.querySelectorAll('[role="option"]')).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && accessibleNameOf(element) === labelName,
  );

const isSelected = (option: Element): boolean =>
  option.getAttribute('aria-selected') === 'true';

/** Escape on the filter, which is how the picker closes from the keyboard. */
const closeReactPicker = (filter: HTMLInputElement): void => {
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
 * which is past the section — every sidebar section has one.
 */
const reactSidebarShows = (labelName: string): boolean => {
  const pickerButton = findReactPickerButton();

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
      return listsLabel(labels, labelName);
    }
  }

  return false;
};

const addThroughReactPicker = async (
  labelName: string,
  isStillOnPage: () => boolean,
): Promise<AddLabelResult> => {
  // Each wait gives up as soon as the page is another one: the user may follow
  // a link while this waits, and the next pull request's picker must not be the
  // one worked.
  const mut_openFilter = findFilter() ?? (await openReactPicker(isStillOnPage));

  if (!isStillOnPage()) {
    if (mut_openFilter !== undefined) {
      closeReactPicker(mut_openFilter);
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
    () => findReactOption(labelName),
    stepTimeoutMs,
    isStillOnPage,
  );

  if (!isStillOnPage()) {
    closeReactPicker(mut_openFilter);

    return 'left-page';
  }

  if (option === undefined) {
    closeReactPicker(mut_openFilter);

    return 'no-such-label';
  }

  if (isSelected(option)) {
    closeReactPicker(mut_openFilter);

    return 'already-labelled';
  }

  option.click();

  // Found again on every poll rather than held: a picker that re-renders its
  // list replaces the element that was clicked.
  const selected = await waitFor(
    () => {
      const current = findReactOption(labelName);

      return current !== undefined && isSelected(current) ? current : undefined;
    },
    stepTimeoutMs,
    isStillOnPage,
  );

  // Closing is what saves the selection, so it is closed whatever happened.
  // Whether it does save is read off the sidebar below rather than assumed: a
  // picker that took Escape as "cancel" would leave the label off, and that is
  // reported as `not-saved`, not as success.
  closeReactPicker(mut_openFilter);

  if (selected === undefined) {
    return isStillOnPage() ? 'not-saved' : 'left-page';
  }

  const shown = await waitFor(
    () => reactSidebarShows(labelName) || undefined,
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
 * Which sidebar the page has. The classic one is asked first: its filter input
 * is in the page whether the menu is open or not, so the React picker's way of
 * telling an open picker — the filter being there — would read it as open.
 */
const findPicker = (): 'classic' | 'react' | undefined =>
  findClassicPicker() !== undefined
    ? 'classic'
    : findReactPickerButton() !== undefined || findFilter() !== undefined
      ? 'react'
      : undefined;
