import { expect, test } from '@playwright/test';

/**
 * What "Introducing synstate-dom" tells the reader to watch for in its demos
 * (`src/components/synstate-dom-demo/`). A synstate-dom change that reran a
 * component or recreated a `For` row would make the page contradict itself
 * without failing anything else.
 */

for (const lang of ['', 'ja/'] as const) {
  test.describe(`${lang}synstate-dom/introduction`, () => {
    test(
      'the counter component runs once',
      { tag: '@demo' },
      async ({ page }) => {
        await page.goto(`${lang}synstate-dom/introduction/`);

        const demo = page.getByTestId('counter');

        await demo.getByRole('button', { name: '+1' }).click();

        await demo.getByRole('button', { name: '+1' }).click();

        await expect.soft(demo).toContainText('Mounted by If');

        await demo.getByRole('button', { name: 'Toggle visibility' }).click();

        await expect.soft(demo).toContainText('Count:2');

        await expect.soft(demo).toContainText('Doubled (map):4');

        await expect.soft(demo).not.toContainText('Mounted by If');

        await expect.soft(demo).toContainText('Component calls:1');
      },
    );

    test(
      'a newer query aborts the request of an older one',
      { tag: '@demo' },
      async ({ page }) => {
        // The demo's timers (a 300 ms debounce, a 400 ms request) run on a
        // clock the test advances, so the order below is exact.
        await page.clock.install();

        await page.goto(`${lang}synstate-dom/introduction/`);

        const demo = page.getByTestId('search');

        // The one paragraph of the demo: its status line.
        const statusLine = demo.getByRole('paragraph');

        const input = demo.getByRole('textbox');

        await input.fill('berry');

        await page.clock.runFor(300);

        await expect.soft(statusLine).toHaveText('Searching for "berry"…');

        await input.fill('an');

        await page.clock.runFor(300);

        await expect.soft(statusLine).toHaveText('Searching for "an"…');

        // Past the moment the 'berry' request would have answered.
        await page.clock.runFor(200);

        await expect.soft(statusLine).toHaveText('Searching for "an"…');

        await expect.soft(demo.getByRole('listitem')).toHaveCount(0);

        await page.clock.runFor(200);

        await expect.soft(statusLine).toHaveText('5 results for "an"');

        await expect
          .soft(demo.getByRole('listitem'))
          .toHaveText(['banana', 'cranberry', 'mango', 'orange', 'tangerine']);
      },
    );

    test(
      'the For list keeps a row per key',
      { tag: '@demo' },
      async ({ page }) => {
        await page.goto(`${lang}synstate-dom/introduction/`);

        const demo = page.getByTestId('todo');

        const input = demo.getByRole('textbox');

        await input.fill('Write docs');

        await input.press('Enter');

        await demo.getByRole('checkbox', { name: 'Try the demos' }).check();

        await expect
          .soft(demo.getByRole('listitem'))
          .toHaveText([
            /Read the guide\s*row #1/u,
            /Try the demos\s*row #2/u,
            /Write docs\s*row #3/u,
          ]);

        await expect.soft(demo).toContainText('1 remaining');

        const removeFirst = demo
          .getByRole('button', { name: 'Remove' })
          .first();

        await removeFirst.click();

        await removeFirst.click();

        await removeFirst.click();

        await expect.soft(demo).toContainText('Nothing to do.');
      },
    );
  });
}
