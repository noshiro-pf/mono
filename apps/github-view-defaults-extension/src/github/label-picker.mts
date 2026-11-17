import { Arr } from 'ts-data-forge';
import { cssStringOf, type PageDom } from './page-dom.mjs';

/**
 * Puts a label on the pull request on `dom` by working GitHub's own label
 * picker — the gear beside "Labels" in the conversation tab's sidebar — the way
 * a person would: open it, select the label, close it, and read the sidebar
 * back.
 *
 * It is done through the page rather than through the REST API because the page
 * is signed in already: the label is added as the user, with the permissions
 * they have, and the extension holds no token and sends nothing for it.
 *
 * `dom` is the page in a tab, or a page in a pane of Split View, which only
 * Split View can act on (`page-dom.mts`); every step is a `PageDom` call, so
 * the two cannot drift apart.
 *
 * GitHub has drawn the sidebar two ways, and has gone from the one to the other
 * and back, so both are worked; which one a page has is read off the page each
 * time. What is read of either is accessibility attributes as far as they go,
 * which are what GitHub keeps stable longest:
 *
 * - **The server-rendered sidebar** (`addThroughClassicPicker`): a `<details>`
 *   holding the `Filter labels` input, opened and closed by its `<summary>`;
 *   its `role="menuitemcheckbox"` items, loaded when it opens, say whether they
 *   are on by `aria-checked` and name their label by the `data-label-name` of
 *   the checkbox inside. Closing it is what submits the change.
 * - **The React sidebar** (`addThroughReactPicker`): the button labelled
 *   `Manage labels`, which opens a dialog holding the `Filter labels` input and
 *   `role="option"` items, each named by `aria-labelledby` and saying whether
 *   it is on by `aria-selected`. Closing it with Escape is what saves.
 *
 * When any of it is missing the result says which step failed, and nothing is
 * left open. `isStillOnPage` is asked before every step that acts, so that a
 * page left while this waits is not the one labelled.
 */
export const addLabelThroughPicker = async (
  dom: PageDom,
  labelName: string,
  isStillOnPage: () => boolean | Promise<boolean>,
): Promise<AddLabelResult> => {
  // The conversation may still be rendering after a client-side navigation to
  // it, so the page is waited on until one picker or the other is there.
  const picker = await waitFor(
    async () => findPicker(dom),
    pickerButtonTimeoutMs,
    isStillOnPage,
  );

  return !(await isStillOnPage())
    ? 'left-page'
    : picker === undefined
      ? 'no-picker'
      : picker === 'classic'
        ? addThroughClassicPicker(dom, labelName, isStillOnPage)
        : addThroughReactPicker(dom, labelName, isStillOnPage);
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
  lookUp: () => Promise<T | undefined>,
  timeoutMs: number,
  isStillOnPage: () => boolean | Promise<boolean>,
): Promise<T | undefined> => {
  const deadline = performance.now() + timeoutMs;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await isStillOnPage())) {
      return undefined;
    }

    // eslint-disable-next-line no-await-in-loop
    const found = await lookUp();

    if (found !== undefined || performance.now() >= deadline) {
      return found;
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, pollIntervalMs);
    });
  }
};

const findFilter = async (dom: PageDom): Promise<number | undefined> =>
  dom.query(filterSelector);

/** Whether any of `links` reads exactly `labelName`. */
const listsLabel = async (
  dom: PageDom,
  links: readonly number[],
  labelName: string,
): Promise<boolean> => {
  const texts = await Promise.all(links.map(async (link) => dom.text(link)));

  return texts.includes(labelName);
};

// The server-rendered sidebar

/**
 * The `<details>` the filter input is in. Found afresh every time: GitHub
 * replaces the whole sidebar section when the labels change.
 */
const findClassicPicker = async (dom: PageDom): Promise<number | undefined> => {
  const filter = await findFilter(dom);

  return filter === undefined ? undefined : dom.closest(filter, 'details');
};

/**
 * The item for exactly `labelName`: the one around the checkbox whose
 * `data-label-name` is the label's. Its text runs the name into the label's
 * description, so `merge-queued` and a label called `merge-queued-later` could
 * not be told apart by that.
 */
const findClassicItem = async (
  dom: PageDom,
  picker: number,
  labelName: string,
): Promise<number | undefined> => {
  const checkbox = await dom.query(
    `input[data-label-name=${cssStringOf(labelName)}]`,
    picker,
  );

  return checkbox === undefined
    ? undefined
    : dom.closest(checkbox, classicItemSelector);
};

const isChecked = async (dom: PageDom, item: number): Promise<boolean> =>
  (await dom.attribute(item, 'aria-checked')) === 'true';

/**
 * Whether the labels listed beside the menu, in the same sidebar section, name
 * `labelName`. Only that section: the timeline names labels too ("added
 * merge-queued"), and a match there would say nothing about whether the label
 * is on now. The links inside the menu are its own, not the list.
 */
const classicSidebarShows = async (
  dom: PageDom,
  labelName: string,
): Promise<boolean> => {
  const picker = await findClassicPicker(dom);

  const section = picker === undefined ? undefined : await dom.parent(picker);

  return (
    section !== undefined &&
    listsLabel(
      dom,
      await dom.queryAll(':scope > :not(details) a', section),
      labelName,
    )
  );
};

const addThroughClassicPicker = async (
  dom: PageDom,
  labelName: string,
  isStillOnPage: () => boolean | Promise<boolean>,
): Promise<AddLabelResult> => {
  const picker = await findClassicPicker(dom);

  const summary =
    picker === undefined
      ? undefined
      : await dom.query(':scope > summary', picker);

  if (picker === undefined || summary === undefined) {
    return 'no-picker';
  }

  // A menu the user already opened is used as it is: the summary toggles it, so
  // a click would close it.
  if (!(await dom.isOpen(picker))) {
    await dom.click(summary);
  }

  const closeMenu = async (): Promise<void> => {
    if (await dom.isOpen(picker)) {
      await dom.click(summary);
    }
  };

  // The items are loaded once the menu opens. All of them are, so the filter is
  // left alone: the item is there whether or not the list is filtered to it.
  const item = await waitFor(
    async () => findClassicItem(dom, picker, labelName),
    stepTimeoutMs,
    isStillOnPage,
  );

  if (!(await isStillOnPage())) {
    await closeMenu();

    return 'left-page';
  }

  if (item === undefined) {
    const anyItem = await dom.query(classicItemSelector, picker);

    await closeMenu();

    return anyItem === undefined ? 'no-picker' : 'no-such-label';
  }

  if (await isChecked(dom, item)) {
    await closeMenu();

    return 'already-labelled';
  }

  await dom.click(item);

  const checked = await waitFor(
    async () => ((await isChecked(dom, item)) ? item : undefined),
    stepTimeoutMs,
    isStillOnPage,
  );

  // Closing is what submits the change, so it is closed whatever happened, and
  // whether it was saved is read off the sidebar GitHub draws again afterwards.
  await closeMenu();

  if (checked === undefined) {
    return (await isStillOnPage()) ? 'not-saved' : 'left-page';
  }

  const shown = await waitFor(
    async () => (await classicSidebarShows(dom, labelName)) || undefined,
    stepTimeoutMs,
    isStillOnPage,
  );

  return shown !== undefined
    ? 'labelled'
    : (await isStillOnPage())
      ? 'not-saved'
      : 'left-page';
};

// The React sidebar

const findReactPickerButton = async (
  dom: PageDom,
): Promise<number | undefined> => dom.query(reactPickerButtonSelector);

/**
 * Clicks `Manage labels` and returns the filter of the picker it opens. Called
 * only when no picker is open already: the button toggles it, so a click on an
 * open one would close it.
 */
const openReactPicker = async (
  dom: PageDom,
  isStillOnPage: () => boolean | Promise<boolean>,
): Promise<number | undefined> => {
  const pickerButton = await findReactPickerButton(dom);

  if (pickerButton === undefined || !(await isStillOnPage())) {
    return undefined;
  }

  await dom.click(pickerButton);

  return waitFor(async () => findFilter(dom), stepTimeoutMs, isStillOnPage);
};

/** The text of the elements `aria-labelledby` names, or the element's own. */
const accessibleNameOf = async (
  dom: PageDom,
  element: number,
): Promise<string> => {
  const ids = await dom.attribute(element, 'aria-labelledby');

  if (ids === undefined) {
    return dom.text(element);
  }

  const texts = await Promise.all(
    ids.split(/\s+/u).map(async (id) => {
      const named = await dom.query(`[id=${cssStringOf(id)}]`);

      return named === undefined ? '' : dom.text(named);
    }),
  );

  return texts.join(' ').trim();
};

/**
 * The option whose name is exactly `labelName`. The name is the text of the
 * elements `aria-labelledby` points at; the option's own text runs the name
 * into the label's description, so `merge-queued` and a label called
 * `merge-queued-later` cannot be told apart by it.
 */
const findReactOption = async (
  dom: PageDom,
  labelName: string,
): Promise<number | undefined> => {
  const options = await dom.queryAll('[role="option"]');

  const names = await Promise.all(
    options.map(async (option) => accessibleNameOf(dom, option)),
  );

  return options[names.indexOf(labelName)];
};

const isSelected = async (dom: PageDom, option: number): Promise<boolean> =>
  (await dom.attribute(option, 'aria-selected')) === 'true';

/** Escape on the filter, which is how the picker closes from the keyboard. */
const closeReactPicker = async (dom: PageDom, filter: number): Promise<void> =>
  dom.key(filter, 'Escape');

/**
 * Whether the sidebar's "Labels" section lists `labelName`.
 *
 * The section is found from the picker's button rather than by a class name,
 * which GitHub generates: it is the nearest ancestor of the button that holds
 * links, and the search stops at the first ancestor holding a second heading,
 * which is past the section — every sidebar section has one.
 */
const reactSidebarShows = async (
  dom: PageDom,
  labelName: string,
): Promise<boolean> => {
  const pickerButton = await findReactPickerButton(dom);

  for (
    let mut_ancestor =
      pickerButton === undefined ? undefined : await dom.parent(pickerButton);
    mut_ancestor !== undefined;
    // eslint-disable-next-line no-await-in-loop
    mut_ancestor = await dom.parent(mut_ancestor)
  ) {
    // eslint-disable-next-line no-await-in-loop
    const [tagName, option, headings, labels] = await Promise.all([
      dom.tagName(mut_ancestor),
      dom.query('[role="option"]', mut_ancestor),
      dom.queryAll(headingSelector, mut_ancestor),
      dom.queryAll('a', mut_ancestor),
    ]);

    if (tagName === 'BODY' || option !== undefined || headings.length > 1) {
      // The open picker, whose options are not the sidebar, or past the
      // Labels section.
      return false;
    }

    if (Arr.isNonEmpty(labels)) {
      return listsLabel(dom, labels, labelName);
    }
  }

  return false;
};

const addThroughReactPicker = async (
  dom: PageDom,
  labelName: string,
  isStillOnPage: () => boolean | Promise<boolean>,
): Promise<AddLabelResult> => {
  // Each wait gives up as soon as the page is another one: the user may follow
  // a link while this waits, and the next pull request's picker must not be the
  // one worked.
  const filter =
    (await findFilter(dom)) ?? (await openReactPicker(dom, isStillOnPage));

  if (!(await isStillOnPage())) {
    if (filter !== undefined) {
      await closeReactPicker(dom, filter);
    }

    return 'left-page';
  }

  if (filter === undefined) {
    return 'no-picker';
  }

  await dom.input(filter, labelName);

  const option = await waitFor(
    async () => findReactOption(dom, labelName),
    stepTimeoutMs,
    isStillOnPage,
  );

  if (!(await isStillOnPage())) {
    await closeReactPicker(dom, filter);

    return 'left-page';
  }

  if (option === undefined) {
    await closeReactPicker(dom, filter);

    return 'no-such-label';
  }

  if (await isSelected(dom, option)) {
    await closeReactPicker(dom, filter);

    return 'already-labelled';
  }

  await dom.click(option);

  // Found again on every poll rather than held: a picker that re-renders its
  // list replaces the element that was clicked.
  const selected = await waitFor(
    async () => {
      const current = await findReactOption(dom, labelName);

      return current !== undefined && (await isSelected(dom, current))
        ? current
        : undefined;
    },
    stepTimeoutMs,
    isStillOnPage,
  );

  // Closing is what saves the selection, so it is closed whatever happened.
  // Whether it does save is read off the sidebar below rather than assumed: a
  // picker that took Escape as "cancel" would leave the label off, and that is
  // reported as `not-saved`, not as success.
  await closeReactPicker(dom, filter);

  if (selected === undefined) {
    return (await isStillOnPage()) ? 'not-saved' : 'left-page';
  }

  const shown = await waitFor(
    async () => (await reactSidebarShows(dom, labelName)) || undefined,
    stepTimeoutMs,
    isStillOnPage,
  );

  return shown !== undefined
    ? 'labelled'
    : (await isStillOnPage())
      ? 'not-saved'
      : 'left-page';
};

/**
 * Which sidebar the page has. The classic one is asked first: its filter input
 * is in the page whether the menu is open or not, so the React picker's way of
 * telling an open picker — the filter being there — would read it as open.
 */
const findPicker = async (
  dom: PageDom,
): Promise<'classic' | 'react' | undefined> =>
  (await findClassicPicker(dom)) !== undefined
    ? 'classic'
    : (await findReactPickerButton(dom)) !== undefined ||
        (await findFilter(dom)) !== undefined
      ? 'react'
      : undefined;
