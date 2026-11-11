import { expect, test, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import {
  createAnswer,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
} from './answer-page-steps.mjs';

// Every element the keyboard stops at shows that it has the focus, and its ring
// is not cut off by the page or by a box around it; an element clicked with the
// mouse keeps no ring. The app turned every ring off, the keyboard's too, and
// showing them drew the navbar's partly above the page.

test(
  'the pages shown signed out show keyboard focus, and no ring on a click',
  { tag: '@regression' },
  async ({ page }) => {
    for (const [url, testId] of [
      ['/signIn/', 'sign-in-page'],
      ['/register/', 'register-page'],
    ] as const) {
      // eslint-disable-next-line no-await-in-loop -- one page after another
      await page.goto(url);

      // eslint-disable-next-line no-await-in-loop -- one page after another
      await expect.soft(page.getByTestId(testId)).toBeVisible();

      expect
        // eslint-disable-next-line no-await-in-loop -- one page after another
        .soft(await tabStopsWithoutFocusShown(page), url)
        .toStrictEqual([]);
    }

    await page.goto('/');

    await expect
      .soft(page.getByRole('button', { name: '日程調整ページを作成' }))
      .toBeVisible();

    expect.soft(await tabStopsWithoutFocusShown(page)).toStrictEqual([]);

    const addButton = page
      .getByTestId('datetime-list')
      .getByTestId('add-button');

    await addButton.click();

    await expect.soft(addButton).toBeFocused();

    await expect.soft(addButton).toHaveCSS('outline-style', 'none');
  },
);

test(
  'the answer page shows keyboard focus, and its own checkboxes no ring on a click',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: 'フォーカスリング',
      numDates: 2,
    });

    await createAnswer(answerPage, 'Alice');

    // The detailed filter, whose checkboxes draw their own ring, and the answer
    // being edited, open.
    await answerPage.getByTestId('toggle-detailed-filter').click();

    await answerPage.getByTestId('add-answer-button').click();

    await expect
      .soft(answerPage.getByTestId('answer-being-edited-section'))
      .toBeVisible();

    expect.soft(await tabStopsWithoutFocusShown(answerPage)).toStrictEqual([]);

    // `CheckboxView`: a hidden input, and the square after it that takes the
    // click and draws the ring.
    const checkbox = answerPage
      .getByTestId('detailed-filter')
      .getByRole('checkbox')
      .first();

    // Clicked where the mouse would, on the square drawn over the input.
    await checkbox.scrollIntoViewIfNeeded();

    const box = await checkbox.boundingBox();

    expect.soft(box).not.toBeNull();

    if (box !== null) {
      await answerPage.mouse.click(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
    }

    await expect.soft(checkbox).toBeFocused();

    expect
      .soft(
        await checkbox.evaluate((input) =>
          input.nextElementSibling === null
            ? undefined
            : getComputedStyle(input.nextElementSibling).outlineStyle,
        ),
      )
      .toBe('none');
  },
);

/**
 * The focused element, whether it, its next sibling (a checkbox's indicator) or
 * one of its two nearest ancestors (an input group's box) is drawn differently
 * from when it is not focused, and whether the ring on it or on that sibling
 * reaches past the page or past an ancestor that clips what overflows it.
 * Blurs and refocuses it, so the next Tab goes on from it, and waits a frame
 * after each, as a component may restyle itself on `focusin` / `focusout` a
 * little later (the tag input's box). Run in the page.
 */
const inspectFocusedElement = async (): Promise<
  Readonly<{ id: string; focusShown: boolean; ringCut: boolean }> | undefined
> => {
  const nextFrame = async (): Promise<void> => {
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  };

  await nextFrame();

  const element = document.activeElement;

  if (!(element instanceof HTMLElement) || element === document.body) {
    return undefined;
  }

  const drawn = (): string =>
    [
      element,
      element.nextElementSibling,
      element.parentElement,
      element.parentElement?.parentElement,
    ]
      .map((e) => {
        if (e === null || e === undefined) {
          return '';
        }

        const s = getComputedStyle(e);

        return [
          s.outlineStyle,
          s.outlineWidth,
          s.outlineColor,
          s.boxShadow,
          s.backgroundColor,
          s.borderColor,
        ].join(' ');
      })
      .join('|');

  const focused = drawn();

  // Whether `e`'s ring, if it draws a visible one, reaches past the page or
  // past an ancestor whose overflow is clipped.
  const isRingCut = (e: Element): boolean => {
    const s = getComputedStyle(e);

    if (s.outlineStyle === 'none' || s.opacity === '0') {
      return false;
    }

    const reach =
      Number.parseFloat(s.outlineOffset) + Number.parseFloat(s.outlineWidth);

    const r = e.getBoundingClientRect();

    const ring = {
      top: r.top - reach,
      left: r.left - reach,
      bottom: r.bottom + reach,
      right: r.right + reach,
    };

    const page = document.documentElement;

    const mut_boxes = [
      {
        top: -window.scrollY,
        left: -window.scrollX,
        bottom: page.scrollHeight - window.scrollY,
        right: page.scrollWidth - window.scrollX,
      },
    ];

    for (
      let mut_a = e.parentElement;
      mut_a !== null && mut_a !== page && mut_a !== document.body;
      mut_a = mut_a.parentElement
    ) {
      const a = getComputedStyle(mut_a);

      if (a.overflowX === 'visible' && a.overflowY === 'visible') {
        continue;
      }

      const b = mut_a.getBoundingClientRect();

      mut_boxes.push({
        top: b.top + mut_a.clientTop,
        left: b.left + mut_a.clientLeft,
        bottom: b.top + mut_a.clientTop + mut_a.clientHeight,
        right: b.left + mut_a.clientLeft + mut_a.clientWidth,
      });
    }

    // Half a pixel for rounding.
    return mut_boxes.some(
      (box) =>
        ring.top < box.top - 0.5 ||
        ring.left < box.left - 0.5 ||
        ring.bottom > box.bottom + 0.5 ||
        ring.right > box.right + 0.5,
    );
  };

  const rect = element.getBoundingClientRect();

  const ringCut = [element, element.nextElementSibling].some(
    (e) => e !== null && isRingCut(e),
  );

  element.blur();

  await nextFrame();

  const blurred = drawn();

  element.focus();

  await nextFrame();

  return {
    id: [
      element.tagName.toLowerCase(),
      element.closest<HTMLElement>('[data-e2e]')?.dataset['e2e'] ?? '',
      (element.getAttribute('aria-label') ?? element.textContent)
        .trim()
        .slice(0, 20),
      Math.round(rect.top + window.scrollY),
      Math.round(rect.left + window.scrollX),
    ].join(' '),
    focusShown: focused !== blurred,
    ringCut,
  };
};

/**
 * Tabs through `page` from its top until the focus comes back round, and
 * returns each stop that looks no different focused than not, or whose ring is
 * cut off.
 */
const tabStopsWithoutFocusShown = async (
  page: DeepReadonly<Page>,
): Promise<readonly string[]> => {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  const mut_seen = new Set<string>();

  const mut_failures: string[] = [];

  for (const _ of Array.from({ length: maxTabStops })) {
    // eslint-disable-next-line no-await-in-loop -- one stop after another
    await page.keyboard.press('Tab');

    // eslint-disable-next-line no-await-in-loop -- one stop after another
    const tabStop = await page.evaluate(inspectFocusedElement);

    if (tabStop === undefined) {
      continue;
    }

    if (mut_seen.has(tabStop.id)) {
      break;
    }

    mut_seen.add(tabStop.id);

    if (!tabStop.focusShown) {
      mut_failures.push(`${tabStop.id}: looks the same focused`);
    }

    if (tabStop.ringCut) {
      mut_failures.push(`${tabStop.id}: its ring is cut off`);
    }
  }

  return mut_failures;
};

const maxTabStops = 200;
