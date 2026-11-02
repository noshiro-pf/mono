// cspell:ignore pcpp
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
  splitters,
  zoomButton,
} from './helpers.mjs';

test(
  'a reload comes back to the same layout, ratios, addresses and zoom',
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, 'L1+R2').click();

    await go(panes(page).nth(0), pageUrl('second'));

    await go(panes(page).nth(2), pageUrl('refuses-framing'));

    await paneButton(panes(page).nth(2), 'Zoom in').click();

    // The second divider is the one between the columns.
    await dragDividerTo(page, splitters(page).nth(1), 440);

    // Saved a moment after the last change, the drag, and the tab's address
    // with it: wait for the ratio the drag left.
    await expect.poll(() => page.url()).toContain('layout=r34.3pcpp');

    await expect
      .poll(async () =>
        page.evaluate(async () => {
          const stored = await chrome.storage.local.get('workspace:e2e');

          return stored;
        }),
      )
      .toMatchObject({
        'workspace:e2e': {
          state: {
            root: { axis: 'row', ratio: expect.closeTo(0.343, 3) },
            panes: expect.arrayContaining([
              expect.objectContaining({ zoom: 1.1 }),
            ]),
          },
        },
      });

    const boxes = await paneBoxes(page);

    await page.reload();

    await panes(page).first().waitFor();

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual(boxes);

    await expect
      .soft(addressBar(panes(page).nth(0)))
      .toHaveValue(pageUrl('second'));

    await expect.soft(addressBar(panes(page).nth(1))).toHaveValue('');

    await expect
      .soft(addressBar(panes(page).nth(2)))
      .toHaveValue(pageUrl('refuses-framing'));

    await expect
      .soft(frameOf(panes(page).nth(2)).getByRole('heading'))
      .toHaveText('framed anyway');

    await expect.soft(zoomButton(panes(page).nth(2))).toHaveText('110%');
  },
);

test(
  "the tab's address describes the view, and opens it as described",
  { tag: '@smoke' },
  async ({ page, extensionId, pageUrl }) => {
    await openSplitView(page, extensionId);

    await preset(page, '2 cols').click();

    await go(panes(page).nth(1), pageUrl('second'));

    await expect
      .soft(page)
      .toHaveURL(/[?&]layout=rpp&url=&url=http:\/\/localhost:\d+\/second$/u);

    // A view described by hand: three rows, the first at 20%, and an address in
    // the last.
    await page.goto(
      `chrome-extension://${extensionId}/split.html?ws=described&layout=c20pcpp&url=&url=&url=${pageUrl('/')}`,
    );

    await expect.soft(panes(page)).toHaveCount(3);

    await expect
      .configure({ soft: true })
      .poll(async () => paneBoxes(page))
      .toStrictEqual([
        [0, 0, 1280, 136],
        [0, 142, 1280, 269],
        [0, 417, 1280, 269],
      ]);

    await expect
      .soft(frameOf(panes(page).nth(2)).getByRole('heading'))
      .toHaveText('home');
  },
);
