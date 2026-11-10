import { expect } from '@playwright/test';
import { test } from './fixtures.mjs';
import {
  addressBar,
  dividerBoxes,
  dividers,
  dragDividerTo,
  frameOf,
  go,
  openSplitView,
  paneBoxes,
  paneButton,
  panes,
  preset,
} from './helpers.mjs';

// The stage is 1280 × 686, and dividers are 6px wide.

test(
  'a new split view opens as four empty panes',
  { tag: '@layout' },
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

    await expect.soft(dividers(page)).toHaveCount(3);

    await expect
      .soft(panes(page).getByText('Type an address in the bar above'))
      .toHaveCount(4);
  },
);

test(
  'each preset lays the panes out',
  { tag: '@layout' },
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

    for (const [label, boxes] of presets) {
      // eslint-disable-next-line no-await-in-loop -- one preset after another
      await preset(page, label).click();

      // eslint-disable-next-line no-await-in-loop -- read after each click
      await expect
        .configure({ soft: true })
        .poll(async () => paneBoxes(page), label)
        .toStrictEqual(boxes);
    }

    // The root's divider keeps its place in the tree and turns with it.
    await preset(page, '2 cols').click();

    await expect
      .soft(dividers(page))
      .toHaveAttribute('aria-orientation', 'vertical');

    await preset(page, '2 rows').click();

    await expect
      .soft(dividers(page))
      .toHaveAttribute('aria-orientation', 'horizontal');
  },
);

test(
  'a pane splits to the right and downwards, and closes',
  { tag: '@layout' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '1').click();

    await paneButton(panes(page).first(), 'Split to the right').click();

    await paneButton(panes(page).nth(1), 'Split downwards').click();

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 637, 686],
        [643, 0, 637, 340],
        [643, 346, 637, 340],
      ]);

    await expect
      .configure({ soft: true })
      .poll(async () => dividerBoxes(page))
      .toStrictEqual([
        ['horizontal', 643, 340, 637, 6],
        ['vertical', 637, 0, 6, 686],
      ]);

    await paneButton(panes(page).nth(2), 'Close this pane').click();

    await paneButton(panes(page).nth(1), 'Close this pane').click();

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([[0, 0, 1280, 686]]);

    // The last pane stays.
    await expect
      .soft(paneButton(panes(page), 'Close this pane'))
      .toBeDisabled();
  },
);

test(
  'a split past 64 panes is refused with a notice (L11)',
  { tag: '@layout' },
  async ({ page, extensionId }) => {
    // 64 panes: each `r` halves what is left, so the first is half the stage.
    await openSplitView(
      page,
      extensionId,
      `?ws=e2e-cap&layout=${'rp'.repeat(63)}p`,
    );

    await expect.soft(panes(page)).toHaveCount(64);

    await paneButton(panes(page).first(), 'Split to the right').click();

    await expect
      .soft(page.getByTestId('view-notice'))
      .toHaveText('A split view holds at most 64 panes.');

    await expect.soft(panes(page)).toHaveCount(64);
  },
);

test(
  'dragging a divider resizes the panes on both sides',
  { tag: '@layout' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await dragDividerTo(page, dividers(page), 440);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 437, 686],
        [443, 0, 837, 686],
      ]);

    await expect.soft(dividers(page)).toHaveAttribute('aria-valuenow', '34');
  },
);

test(
  'a divider is a separator the keyboard moves (#3412)',
  { tag: '@layout' },
  async ({ page, extensionId }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    const divider = page.getByRole('separator', {
      name: 'Resize the panes to the left and right',
    });

    await expect.soft(divider).toHaveAttribute('aria-orientation', 'vertical');

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '50');

    await expect.soft(divider).toHaveAttribute('aria-valuemin', '5');

    await expect.soft(divider).toHaveAttribute('aria-valuemax', '95');

    await divider.focus();

    // 2% of the 1274px the two panes share, rounded: 25px a press.
    await page.keyboard.press('ArrowRight');

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 662, 686],
        [668, 0, 612, 686],
      ]);

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '52');

    await page.keyboard.press('ArrowLeft');

    await page.keyboard.press('ArrowLeft');

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '48');

    // Up and down mean nothing to a vertical divider.
    await page.keyboard.press('ArrowDown');

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '48');

    await page.keyboard.press('Home');

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '5');

    await page.keyboard.press('End');

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 1210, 686],
        [1216, 0, 64, 686],
      ]);

    await expect.soft(divider).toHaveAttribute('aria-valuenow', '95');
  },
);

test(
  'a pane dragged by its grip onto another swaps with it, without reloading',
  { tag: '@layout' },
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

    const target = await panes(page).nth(1).boundingBox();

    if (grip === null || target === null) {
      throw new Error('The panes are not laid out');
    }

    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);

    await page.mouse.down();

    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
      {
        steps: 8,
      },
    );

    await expect.soft(page.getByText('Swap', { exact: true })).toBeVisible();

    await page.mouse.up();

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

test(
  'the page follows the OS colour scheme and a framed page draws as in a tab (L12)',
  { tag: '@layout' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    const pane = panes(page).first();

    await go(pane, pageUrl('/demo/notes'));

    const frame = pane.getByTestId('pane-frame');

    const heading = frameOf(pane).getByRole('heading', { name: 'notes' });

    const pageLooks = async (): Promise<readonly unknown[]> =>
      page.evaluate(() => {
        const style = getComputedStyle(document.body);

        return [style.colorScheme, style.backgroundColor];
      });

    const looks = async (): Promise<readonly unknown[]> => [
      ...(await pageLooks()),
      ...(await frame.evaluate((element) => {
        const style = getComputedStyle(element);

        return [style.colorScheme, style.backgroundColor];
      })),
      // What the framed page is told, which is what a page in a tab is told.
      await heading.evaluate(
        () => matchMedia('(prefers-color-scheme: dark)').matches,
      ),
    ];

    await page.emulateMedia({ colorScheme: 'dark' });

    await expect
      .poll(looks)
      .toStrictEqual([
        'dark',
        'rgb(31, 33, 38)',
        'light',
        'rgb(255, 255, 255)',
        true,
      ]);

    await page.emulateMedia({ colorScheme: 'light' });

    await expect
      .poll(looks)
      .toStrictEqual([
        'light',
        'rgb(238, 240, 243)',
        'light',
        'rgb(255, 255, 255)',
        false,
      ]);
  },
);

test(
  'a framed page that declares a dark scheme draws on its own dark canvas (L12)',
  { tag: '@layout' },
  async ({ page, context, extensionId, pageUrl }) => {
    // A page that leaves its background to the browser, as many dark sites do.
    await context.route(/\/dark-page$/u, async (route) => {
      await route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><meta name="color-scheme" content="dark"><h1>dark</h1>',
      });
    });

    await openSplitView(page, extensionId);

    const pane = panes(page).first();

    await go(pane, pageUrl('/dark-page'));

    await frameOf(pane).getByRole('heading', { name: 'dark' }).waitFor();

    // A screenshot's pixel, read back through a canvas on the page.
    const canvasRed = async (): Promise<number> => {
      const shot = await pane.getByTestId('pane-frame').screenshot();

      return page.evaluate(async (base64) => {
        const response = await fetch(`data:image/png;base64,${base64}`);

        const bitmap = await createImageBitmap(await response.blob());

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

        const context2d = canvas.getContext('2d');

        context2d?.drawImage(bitmap, 0, 0);

        return (
          context2d?.getImageData(bitmap.width - 10, bitmap.height - 10, 1, 1)
            .data[0] ?? -1
        );
      }, shot.toString('base64'));
    };

    await page.emulateMedia({ colorScheme: 'light' });

    await expect.poll(canvasRed).toBeLessThan(64);

    await page.emulateMedia({ colorScheme: 'dark' });

    await expect.poll(canvasRed).toBeLessThan(64);
  },
);
