import { expect, test, type Locator } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import {
  answerPageLoadTimeout,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
} from './answer-page-steps.mjs';

// On a wide screen the answer page keeps its cards to the page's width, so that
// a form's buttons stay near its inputs, and the table's toggle widens the
// answers section alone to the screen, for reading many answers side by side.
// The choice survives a reload. Where the screen is no wider than the page the
// toggle has nothing to do and is hidden, and on a phone nothing scrolls
// sideways. The event is a Firestore write, so this runs against the emulators.

test(
  'the answers section alone widens to the screen, and stays so',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    await page.setViewportSize({ width: 2560, height: 1200 });

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: '回答ページの幅',
      numDates: 2,
    });

    await answerPage.setViewportSize({ width: 2560, height: 1200 });

    // The edit button ends the event info card, the add button the answers.
    const eventInfoRight = async (): Promise<number> =>
      rightOf(answerPage.getByTestId('edit-event-settings'));

    const answersRight = async (): Promise<number> =>
      rightOf(answerPage.getByTestId('add-answer-button'));

    const toggle = answerPage.getByTestId('toggle-table-full-width');

    await expect.soft(toggle).toBeVisible({ timeout: answerPageLoadTimeout });

    // In line with the buttons beside it.
    const toggleBox = await toggle.boundingBox();

    const screenshotBox = await answerPage
      .getByRole('button', { name: '画像として保存' })
      .boundingBox();

    expect
      .soft([toggleBox?.y, toggleBox?.height])
      .toStrictEqual([screenshotBox?.y, screenshotBox?.height]);

    // At the page's width, both cards end at the same place, far from the
    // screen's right edge.
    expect.soft(await eventInfoRight()).toBeLessThan(2000);

    expect.soft(await answersRight()).toBeCloseTo(await eventInfoRight(), 0);

    await toggle.click();

    await expect
      .poll(answersRight)
      .toBeGreaterThan((await eventInfoRight()) + 500);

    await answerPage.reload();

    await expect
      .poll(answersRight, { timeout: answerPageLoadTimeout })
      .toBeGreaterThan((await eventInfoRight()) + 500);

    await toggle.click();

    await expect.poll(answersRight).toBeCloseTo(await eventInfoRight(), 0);

    // The toggle is shown exactly where the page has padding to take away, so
    // that its container query and the padding keep the same width: at each
    // width across where the padding reaches zero, both or neither.
    const mut_rows: Readonly<{
      width: number;
      shown: boolean;
      padded: boolean;
    }>[] = [];

    for (const width of boundaryWidths) {
      // eslint-disable-next-line no-await-in-loop -- one width after another
      await answerPage.setViewportSize({ width, height: 900 });

      mut_rows.push({
        width,
        // eslint-disable-next-line no-await-in-loop -- one width after another
        ...(await toggle.evaluate(toggleAndPaddingOf)),
      });
    }

    expect
      .soft(mut_rows.filter(({ shown, padded }) => shown !== padded))
      .toStrictEqual([]);

    // Both sides of the boundary were reached.
    expect
      .soft(new Set(mut_rows.map(({ shown }) => shown)))
      .toStrictEqual(new Set<boolean>([true, false]));

    await answerPage.setViewportSize({ width: 390, height: 844 });

    expect
      .soft(
        await answerPage.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      )
      .toBe(0);
  },
);

/**
 * Every width, 1px apart, across the one where the page's padding reaches zero
 * (1220px of page, plus whatever the window takes for itself).
 */
const boundaryWidths = Array.from({ length: 101 }, (_, i) => 1180 + i);

/**
 * Whether `toggle` is shown, and whether the page's child that holds it has
 * padding: the child of the container its query reads, the nearest ancestor
 * that is one. Throws where there is none. Run in the page.
 */
const toggleAndPaddingOf = (
  toggle: Element,
): Readonly<{ shown: boolean; padded: boolean }> => {
  for (
    let mut_child: Element = toggle;
    mut_child.parentElement !== null;
    mut_child = mut_child.parentElement
  ) {
    if (
      getComputedStyle(mut_child.parentElement).containerType === 'inline-size'
    ) {
      return {
        shown: toggle.checkVisibility(),
        padded: Number.parseFloat(getComputedStyle(mut_child).paddingLeft) > 0,
      };
    }
  }

  throw new Error('The toggle is in no inline-size container.');
};

/** The x of the right edge of what `locator` finds. */
const rightOf = async (locator: DeepReadonly<Locator>): Promise<number> => {
  const box = await locator.boundingBox();

  return box === null ? Number.NaN : box.x + box.width;
};
