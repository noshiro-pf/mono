import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import {
  addressBar,
  dragDividerTo,
  frameOf,
  go,
  openSplitView,
  paneBoxes,
  paneButton,
  panes,
  preset,
  splitterBoxes,
  splitters,
} from './helpers.mjs';

// The stage is 1280 × 686 (`stageSize`), and dividers are 6 px wide.

test(
  'a new split view opens as four empty panes',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 637, 340],
        [0, 346, 637, 340],
        [643, 0, 637, 340],
        [643, 346, 637, 340],
      ]);

    await expect.soft(splitters(page)).toHaveCount(3);

    await expect
      .soft(panes(page).getByText('Type an address in the bar above'))
      .toHaveCount(4);
  },
);

test(
  'each preset lays the panes out',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    const presets = [
      ['1', [[0, 0, 1280, 686]]],
      [
        '2 cols',
        [
          [0, 0, 637, 686],
          [643, 0, 637, 686],
        ],
      ],
      [
        '3 cols',
        [
          [0, 0, 425, 686],
          [431, 0, 422, 686],
          [859, 0, 421, 686],
        ],
      ],
      [
        '2 rows',
        [
          [0, 0, 1280, 340],
          [0, 346, 1280, 340],
        ],
      ],
      [
        '3 rows',
        [
          [0, 0, 1280, 227],
          [0, 233, 1280, 224],
          [0, 463, 1280, 223],
        ],
      ],
      [
        '2×2',
        [
          [0, 0, 637, 340],
          [0, 346, 637, 340],
          [643, 0, 637, 340],
          [643, 346, 637, 340],
        ],
      ],
      [
        '2×3',
        [
          [0, 0, 425, 340],
          [0, 346, 425, 340],
          [431, 0, 422, 340],
          [431, 346, 422, 340],
          [859, 0, 421, 340],
          [859, 346, 421, 340],
        ],
      ],
      [
        'L1+R2',
        [
          [0, 0, 637, 686],
          [643, 0, 637, 340],
          [643, 346, 637, 340],
        ],
      ],
      [
        'T1+B2',
        [
          [0, 0, 1280, 340],
          [0, 346, 637, 340],
          [643, 346, 637, 340],
        ],
      ],
    ] as const;

    for (const [title, boxes] of presets) {
      // eslint-disable-next-line no-await-in-loop -- one preset after another
      await preset(page, title).click();

      // eslint-disable-next-line no-await-in-loop -- read after each click
      await expect.soft(panes(page)).toHaveCount(boxes.length);

      // eslint-disable-next-line no-await-in-loop -- read after each click
      await expect
        .configure({ soft: true })
        .poll(async () => paneBoxes(page), title)
        .toStrictEqual(boxes);
    }

    // The last, T1+B2: one divider under the top pane, one between the two
    // below.
    await expect.soft(splitters(page)).toHaveCount(2);
  },
);

test(
  'a pane splits to the right and downwards',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await paneButton(panes(page).first(), 'Split to the right').click();

    await expect.soft(panes(page)).toHaveCount(2);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page), 'split to the right')
      .toStrictEqual([
        [0, 0, 637, 686],
        [643, 0, 637, 686],
      ]);

    await paneButton(panes(page).nth(1), 'Split downwards').click();

    await expect.soft(panes(page)).toHaveCount(3);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page), 'then the right one downwards')
      .toStrictEqual([
        [0, 0, 637, 686],
        [643, 0, 637, 340],
        [643, 346, 637, 340],
      ]);

    // A vertical divider between the columns, and a horizontal one between the
    // two panes on the right.
    await expect
      .configure({ soft: true })
      .poll(async () => splitterBoxes(page), 'dividers')
      .toStrictEqual([
        ['horizontal', 643, 340, 637, 6],
        ['vertical', 637, 0, 6, 686],
      ]);

    await expect.soft(splitters(page)).toHaveCount(2);
  },
);

test(
  'closing a pane gives its room to the pane beside it',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await paneButton(panes(page).nth(1), 'Close this pane').click();

    await expect.soft(panes(page)).toHaveCount(1);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([[0, 0, 1280, 686]]);

    await expect.soft(splitters(page)).toHaveCount(0);

    // The last pane cannot be closed.
    await expect
      .soft(paneButton(panes(page), 'Close this pane'))
      .toBeDisabled();
  },
);

test(
  'dragging a divider resizes the panes on both sides of it',
  { tag: '@smoke' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await dragDividerTo(page, splitters(page), 440);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 437, 686],
        [443, 0, 837, 686],
      ]);

    // The divider stays under the pointer, between the two.
    await expect.soft(splitters(page)).toHaveCSS('left', '437px');
  },
);

test(
  'dragging a pane by its grip onto another swaps the two',
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await go(panes(page).first(), pageUrl('second'));

    const visit = await frameOf(panes(page).first())
      .getByText(/^visit \d+$/u)
      .innerText();

    const grip = await paneButton(
      panes(page).first(),
      'Move this pane',
    ).boundingBox();

    if (grip === null) {
      throw new Error('The grip is not laid out');
    }

    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);

    await page.mouse.down();

    const target = await panes(page).nth(1).boundingBox();

    if (target === null) {
      throw new Error('The right-hand pane is not laid out');
    }

    // The middle of the right-hand pane.
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
      { steps: 8 },
    );

    await page.mouse.up();

    // The pane keeps its place in the document and its page, without a reload,
    // and is drawn on the right.
    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [643, 0, 637, 686],
        [0, 0, 637, 686],
      ]);

    await expect
      .soft(addressBar(panes(page).first()))
      .toHaveValue(pageUrl('second'));

    await expect
      .soft(frameOf(panes(page).first()).getByText(/^visit \d+$/u))
      .toHaveText(visit);
  },
);
