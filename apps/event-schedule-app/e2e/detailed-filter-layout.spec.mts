import { expect, test } from '@playwright/test';
import {
  createAnswer,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
} from './answer-page-steps.mjs';

// The box of the answer page's detailed filter holds everything in it, nothing
// around it scrolls sideways for it, and its icons keep their size, on a
// desktop and on phones down to 360px wide. Its date inputs once took the width
// of their group and stood out of it, and on a phone rows that could not wrap
// kept it wider than the screen. (At 320px the page is wider than the screen
// for other reasons.) The event and its answer are Firestore writes, so this
// runs against the emulators.

const viewportWidths = [1280, 390, 360] as const;

test(
  'the detailed filter fits its box and the screen',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: '詳細フィルターの幅',
      numDates: 3,
    });

    // A respondent, so that the rows of checkboxes for one are drawn.
    await createAnswer(answerPage, 'Alice');

    await answerPage.getByTestId('toggle-detailed-filter').click();

    const filter = answerPage.getByTestId('detailed-filter');

    await expect.soft(filter).toBeVisible();

    const mut_overflows: unknown[] = [];

    for (const width of viewportWidths) {
      // eslint-disable-next-line no-await-in-loop -- one width after another
      await answerPage.setViewportSize({ width, height: 900 });

      // eslint-disable-next-line no-await-in-loop -- one width after another
      mut_overflows.push({ width, ...(await filter.evaluate(overflowOf)) });
    }

    expect.soft(mut_overflows).toStrictEqual(
      viewportWidths.map((width) => ({
        width,
        outOfBox: [],
        scrolling: [],
        squeezed: [],
      })),
    );
  },
);

/**
 * What stands out of `box` past its border, which of the elements around it
 * scroll sideways, and which of its icons are drawn narrower than their
 * `width`. Run in the page.
 */
const overflowOf = (
  box: Element,
): Readonly<{
  outOfBox: readonly string[];
  scrolling: readonly string[];
  squeezed: readonly string[];
}> => {
  const describe = (element: Element): string =>
    [
      element.tagName.toLowerCase(),
      element instanceof HTMLElement ? (element.dataset['e2e'] ?? '') : '',
      element.textContent.trim().slice(0, 20),
    ].join(' ');

  // Within the border, and within half a pixel of rounding.
  const left = box.getBoundingClientRect().left + box.clientLeft - 0.5;

  const right = left + box.clientWidth + 1;

  const outOfBox = Array.from(box.querySelectorAll('*'))
    .filter((element) => {
      const { left: l, right: r, width } = element.getBoundingClientRect();

      return width > 0 && (l < left || r > right);
    })
    .map(describe);

  const mut_scrolling: string[] = [];

  for (
    let mut_element = box.parentElement;
    mut_element !== null;
    mut_element = mut_element.parentElement
  ) {
    const { overflowX } = getComputedStyle(mut_element);

    if (
      (overflowX === 'auto' || overflowX === 'scroll') &&
      mut_element.scrollWidth > mut_element.clientWidth
    ) {
      mut_scrolling.push(describe(mut_element));
    }
  }

  if (document.documentElement.scrollWidth > window.innerWidth) {
    mut_scrolling.push('the page');
  }

  const squeezed = Array.from(box.querySelectorAll('svg'))
    .filter(
      (svg) =>
        svg.getBoundingClientRect().width < svg.width.baseVal.value - 0.5,
    )
    .map(describe);

  return { outOfBox, scrolling: mut_scrolling, squeezed };
};
