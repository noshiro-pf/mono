import { expect, test, type Locator } from '@playwright/test';

// As `demo.spec.mts`: the in-memory demo, with the sample data of
// `src/demo/sample-data.mts` — its done task 「仕様をまとめる」 left out.
const DEMO = '/mono/task-manager/?storage=memory';

test(
  'shows the tasks of a label, what they are joined to faint, and keeps it in the URL',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    const canvas = page.getByTestId('dag-canvas');

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    const nodes = page.getByTestId('dag-node');

    await expect.soft(nodes).toHaveCount(8);

    await expect.soft(page.getByTestId('dag-filtered')).toHaveCount(0);

    await page.getByTestId('dag-settings').click();

    await page
      .getByTestId('dag-settings-panel')
      .getByText('UI', { exact: true })
      .click();

    await page.keyboard.press('Escape');

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(page).toHaveURL(/[?&]label=UI(?:&|$)/u);

    await expect.soft(page.getByTestId('dag-filtered')).toHaveCount(1);

    // The two tasks labelled 「UI」, and the milestone that waits for one
    // of them; what they are joined to besides, faint.
    await expect.soft(nodes).toHaveCount(5);

    const node = (title: RegExp): Locator =>
      nodes.and(page.getByRole('button', { name: title }));

    await expect
      .soft(node(/画面設計/u))
      .toHaveAttribute('data-outside', 'false');

    await expect
      .soft(node(/画面を実装する/u))
      .toHaveAttribute('data-outside', 'false');

    await expect
      .soft(node(/実装完了/u))
      .toHaveAttribute('data-outside', 'false');

    await expect
      .soft(node(/API を実装する/u))
      .toHaveAttribute('data-outside', 'true');

    await expect
      .soft(node(/結合テスト/u))
      .toHaveAttribute('data-outside', 'true');

    await expect.soft(node(/利用者向けドキュメント/u)).toHaveCount(0);

    // A reload, or the link, opens the same part of the graph.
    await page.reload();

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(nodes).toHaveCount(5);

    // Both a group and a label: only what is in both, 「画面設計」 alone.
    await page.getByTestId('dag-settings').click();

    await page
      .getByTestId('dag-settings-panel')
      .getByText('グループなし', { exact: true })
      .click();

    await page.keyboard.press('Escape');

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(nodes).toHaveCount(2);

    await expect
      .soft(node(/画面設計/u))
      .toHaveAttribute('data-outside', 'false');

    await expect
      .soft(node(/画面を実装する/u))
      .toHaveAttribute('data-outside', 'true');

    // Cleared: the whole graph again, and nothing in the URL.
    await page.getByTestId('dag-settings').click();

    await page.getByTestId('dag-filter-clear').click();

    await page.keyboard.press('Escape');

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(nodes).toHaveCount(8);

    await expect.soft(page).not.toHaveURL(/label=|group=/u);
  },
);
