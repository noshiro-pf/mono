import { expect, test } from '@playwright/test';

// As `demo.spec.mts`: the in-memory demo, with the sample data of
// `src/demo/sample-data.mts`, whose one done task is 「仕様をまとめる」.
const DEMO = '/mono/task-manager/?storage=memory';

test(
  'leaves the done tasks out of the graph until 「表示設定」 shows them',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await page.getByTestId('view-dag').click();

    const canvas = page.getByTestId('dag-canvas');

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    const nodes = page.getByTestId('dag-node');

    const spec = nodes.and(
      page.getByRole('button', { name: /仕様をまとめる/u }),
    );

    // Eight of the nine nodes, and seven of the ten edges: none from it.
    await expect.soft(nodes).toHaveCount(8);

    await expect.soft(spec).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);

    // What waited for it is shown with the status it has, not blocked.
    await expect
      .soft(
        nodes.and(
          page.getByRole('button', { name: /利用者向けドキュメント/u }),
        ),
      )
      .toHaveAccessibleName(/状態: 着手可/u);

    // In 「アーク」 too: the eight nodes left, and the DAG's seven edges.
    await page.getByTestId('dag-mode-arc').click();

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(nodes).toHaveCount(8);

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(7);

    await page.getByTestId('dag-mode-dag').click();

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await page.getByTestId('dag-settings').click();

    const showDone = page.getByTestId('dag-show-done');

    await expect.soft(showDone).not.toBeChecked();

    // By its label, as a reader would: the switch's knob covers the box.
    await page
      .getByText('完了済みのタスク・到達済みのマイルストーンを表示')
      .click();

    await expect.soft(showDone).toBeChecked();

    await page.keyboard.press('Escape');

    await expect.soft(nodes).toHaveCount(9);

    await expect.soft(spec).toHaveCount(1);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(10);

    // Kept on this device: a new visit, which the URL does not open on the
    // graph.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await page.getByTestId('view-dag').click();

    await expect.soft(canvas).toHaveAttribute('data-animating', 'false');

    await expect.soft(nodes).toHaveCount(9);

    // The list's own 「完了を隠す」 is another setting.
    await page.getByTestId('view-list').click();

    await expect.soft(page.getByTestId('hide-done')).not.toBeChecked();

    await expect.soft(page.getByTestId('task-row')).toHaveCount(6);
  },
);
