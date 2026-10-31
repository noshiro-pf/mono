import { expect, test } from '@playwright/test';

// The in-memory demo: the list, and the graph, whose settings hold the
// language.
const LIST = '/mono/task-manager/?storage=memory&view=list';

const GRAPH = '/mono/task-manager/?storage=memory';

test(
  'shows the page in English with ?lang=en, and keeps the language chosen',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(`${LIST}&lang=en`);

    await expect.soft(page.getByTestId('add-task')).toHaveText('+ Task');

    expect
      .soft(await page.evaluate(() => document.documentElement.lang))
      .toBe('en');

    await expect.soft(page).toHaveTitle('Task Manager');

    await expect
      .soft(page.getByRole('columnheader', { name: 'Priority' }))
      .toBeVisible();

    // Choosing Japanese keeps it, and takes `?lang=en` out of the URL so that
    // it no longer wins.
    await page.goto(`${GRAPH}&lang=en`);

    await page.getByTestId('dag-settings').click();

    await expect
      .soft(page.getByTestId('language-en'))
      .toHaveAttribute('aria-pressed', 'true');

    await page.getByTestId('language-ja').click();

    await expect.soft(page.getByTestId('add-task')).toHaveText('＋タスク');

    expect
      .soft(await page.evaluate(() => document.documentElement.lang))
      .toBe('ja');

    await expect.soft(page).toHaveTitle('タスク管理');

    const url = new URL(page.url());

    expect.soft(url.searchParams.has('lang')).toBe(false);

    // English, chosen, is kept for the next visit.
    await page.getByTestId('dag-settings').click();

    await page.getByTestId('language-en').click();

    await expect.soft(page.getByTestId('add-task')).toHaveText('+ Task');

    await page.goto(LIST);

    await expect.soft(page.getByTestId('add-task')).toHaveText('+ Task');

    // And the URL wins over it.
    await page.goto(`${LIST}&lang=ja`);

    await expect.soft(page.getByTestId('add-task')).toHaveText('＋タスク');

    // Following the browser again, which is Japanese here.
    await page.goto(GRAPH);

    await page.getByTestId('dag-settings').click();

    await expect
      .soft(page.getByTestId('language-en'))
      .toHaveAttribute('aria-pressed', 'true');

    await page.getByTestId('language-auto').click();

    await expect.soft(page.getByTestId('add-task')).toHaveText('＋タスク');

    await page.goto(LIST);

    await expect.soft(page.getByTestId('add-task')).toHaveText('＋タスク');
  },
);

test.describe('in a browser set to English', () => {
  test.use({ locale: 'en-US' });

  test(
    'follows the browser when nothing is chosen',
    { tag: '@smoke' },
    async ({ page }) => {
      await page.goto(LIST);

      await expect.soft(page.getByTestId('add-task')).toHaveText('+ Task');

      expect
        .soft(await page.evaluate(() => document.documentElement.lang))
        .toBe('en');
    },
  );
});
