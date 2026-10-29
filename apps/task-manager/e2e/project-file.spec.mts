import { expect, test } from '@playwright/test';
import { strict as assert } from 'node:assert';
import { text } from 'node:stream/consumers';
import { Arr, isRecord } from 'ts-data-forge';

// The in-memory demo, on the list, with the sample data of
// `src/demo/sample-data.mts`.
const LIST = '/mono/task-manager/?storage=memory&view=list';

test(
  'exports the project, and replaces it with a file after a backup',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(LIST);

    await expect.soft(page.getByTestId('task-row')).toHaveCount(6);

    const exported = page.waitForEvent('download');

    await page.getByTestId('export-project').click();

    const download = await exported;

    expect
      .soft(download.suggestedFilename())
      .toMatch(/^task-manager-\d{4}-\d{2}-\d{2}-\d{6}\.json$/u);

    const stream = await download.createReadStream();

    const exportedText = await text(stream);

    const file: unknown = JSON.parse(exportedText);

    expect.soft(isRecord(file) && file['format']).toBe('task-manager-project');

    assert.ok(isRecord(file) && Arr.isArray(file['tasks']));

    const [first] = file['tasks'];

    // The project with one task, depending on nothing.
    const one = {
      ...file,
      tasks: [
        {
          ...(isRecord(first) ? first : {}),
          id: 'imported',
          title: '読み込んだタスク',
          dependencies: [],
          groupId: null,
        },
      ],
      milestones: [],
      groups: [],
      dagLayout: null,
    };

    await page.getByTestId('import-project').setInputFiles({
      name: 'one.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(one)),
    });

    const dialog = page.getByTestId('project-import-dialog');

    await expect
      .soft(dialog.getByTestId('project-import-message'))
      .toContainText(
        '「one.json」の内容（タスク 1・マイルストーン 0・グループ 0）',
      );

    const backedUp = page.waitForEvent('download');

    await dialog.getByTestId('project-import-confirm').click();

    const backup = await backedUp;

    expect.soft(backup.suggestedFilename()).toMatch(/^task-manager-backup-/u);

    await expect.soft(dialog).toBeHidden();

    await expect.soft(page.getByTestId('task-row')).toHaveCount(1);

    await expect
      .soft(page.getByTestId('task-row'))
      .toContainText('読み込んだタスク');

    await expect.soft(page.getByTestId('milestone-row')).toHaveCount(0);
  },
);

test(
  'says why a file cannot be read, and changes nothing',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(LIST);

    await page.getByTestId('import-project').setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{'),
    });

    const dialog = page.getByTestId('project-import-dialog');

    await expect
      .soft(dialog.getByTestId('project-import-errors'))
      .toHaveText('JSON として読めません。');

    await dialog.getByTestId('project-import-close').click();

    await expect.soft(dialog).toBeHidden();

    await expect.soft(page.getByTestId('task-row')).toHaveCount(6);
  },
);
