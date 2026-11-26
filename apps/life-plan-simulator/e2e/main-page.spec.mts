import { expect, test } from '@playwright/test';

test('overview shows the checks', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(demo);

  await expect
    .soft(page.getByTestId('checks').getByRole('listitem'))
    .toHaveCount(6);
});

test('housing loan summary', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(demo);

  await page.getByTestId('tab-housing-loan').click();

  const firstPayment = page.getByTestId('loan-first-payment');

  await expect.soft(firstPayment).toHaveText(/^[1-9][\d,]* 円$/u);

  // Inputs are committed on `change`, which `fill` alone does not fire.
  await page.getByTestId('loan-principal').fill('0');

  await page.getByTestId('loan-principal').press('Enter');

  await expect.soft(firstPayment).toHaveText('0 円');

  await expect.soft(page.getByTestId('loan-total-payment')).toHaveText('0 円');
});

test('derived values are not editable', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(demo);

  await page.getByTestId('tab-living-cost').click();

  const total = page.getByTestId('living-cost-total');

  await expect.soft(total).toHaveText(/^[1-9][\d,]* 円$/u);

  expect.soft(await total.evaluate((el) => el.tagName)).toBe('OUTPUT');

  await page.getByTestId('tab-cash-flow').click();

  const table = page.getByTestId('cash-flow-table');

  await expect.soft(table.getByRole('row')).not.toHaveCount(0);

  await expect.soft(table.getByRole('textbox')).toHaveCount(0);

  await expect.soft(table.getByRole('spinbutton')).toHaveCount(0);
});

test('plans keep their own inputs', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(demo);

  const initialCash = page.getByTestId('initial-cash');

  const planSelect = page.getByTestId('plan-select');

  const defaultCash = await initialCash.inputValue();

  await page.getByTestId('plan-create').click();

  await expect.soft(page.getByTestId('plan-name')).toHaveValue('プラン 2');

  await initialCash.fill('1234567');

  await initialCash.press('Enter');

  await planSelect.selectOption({ label: 'プラン 1' });

  await expect.soft(initialCash).toHaveValue(defaultCash);

  await planSelect.selectOption({ label: 'プラン 2' });

  await expect.soft(initialCash).toHaveValue('1234567');

  const planName = page.getByTestId('plan-name');

  await planName.fill('持ち家');

  await planName.press('Enter');

  await expect
    .soft(planSelect.getByRole('option'))
    .toHaveText(['プラン 1', '持ち家']);

  await page.getByTestId('plan-duplicate').click();

  await expect.soft(planName).toHaveValue('持ち家 のコピー');

  await expect.soft(initialCash).toHaveValue('1234567');

  await page.getByTestId('plan-delete').click();

  await page.getByTestId('plan-delete-confirm').click();

  await expect
    .soft(planSelect.getByRole('option'))
    .toHaveText(['プラン 1', '持ち家']);
});

test(
  'a plan exported to a file reads back as a new plan',
  { tag: '@smoke' },
  async ({ page }, testInfo) => {
    await page.goto(demo);

    const initialCash = page.getByTestId('initial-cash');

    await initialCash.fill('1234567');

    await initialCash.press('Enter');

    // ASCII, because Chromium saves a download as "download" when its name is
    // not in the locale's character set, and a container's locale may be C.
    await page.getByTestId('plan-name').fill('home');

    await page.getByTestId('plan-name').press('Enter');

    await page.getByTestId('tab-data').click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('plan-export').click(),
    ]);

    expect.soft(download.suggestedFilename()).toBe('home.json');

    // Changed after the export, so that the value below is the file's.
    await page.getByTestId('tab-overview').click();

    await initialCash.fill('1');

    await initialCash.press('Enter');

    await page.getByTestId('tab-data').click();

    // `download.path()` is named by a GUID; saved as the exported name, the
    // message names the file as a person's would.
    const saved = testInfo.outputPath('home.json');

    await download.saveAs(saved);

    await page.getByTestId('plan-import-new').setInputFiles(saved);

    await expect
      .soft(page.getByTestId('plan-select').getByRole('option'))
      .toHaveText(['home', 'home']);

    const fileStatus = page.getByTestId('plan-file-status');

    await expect.soft(fileStatus).toHaveRole('status');

    await expect
      .soft(fileStatus.getByRole('paragraph'))
      .toHaveText('home.json を読み込みました。');

    await expect.soft(page.getByTestId('plan-import-warnings')).toBeEmpty();

    await page.getByTestId('tab-overview').click();

    await expect.soft(initialCash).toHaveValue('1234567');
  },
);

test(
  'the file status keeps its message and warnings together',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(demo);

    await page.getByTestId('tab-data').click();

    const importCurrent = page.getByTestId('plan-import-current');

    const message = page.getByTestId('plan-file-status').getByRole('paragraph');

    const warnings = page
      .getByTestId('plan-import-warnings')
      .getByRole('listitem');

    await importCurrent.setInputFiles(partialPlanFile);

    await expect
      .soft(message)
      .toHaveText(/^partial\.json を読み込みました。次の値は/u);

    await expect.soft(warnings).not.toHaveCount(0);

    // A failed read replaces the warnings with its own message.
    await importCurrent.setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{'),
    });

    await expect
      .soft(message)
      .toHaveText(/^broken\.json を読み込めませんでした: /u);

    await expect.soft(warnings).toHaveCount(0);

    // So does a reset.
    await importCurrent.setInputFiles(partialPlanFile);

    await expect.soft(warnings).not.toHaveCount(0);

    await page.getByRole('button', { name: '既定値に戻す' }).click();

    await page.getByRole('button', { name: '戻す', exact: true }).click();

    await expect.soft(message).toHaveText('入力値を既定値に戻しました。');

    await expect.soft(warnings).toHaveCount(0);
  },
);

test(
  'the same message is drawn afresh, so that it is announced again',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(demo);

    await page.getByTestId('tab-data').click();

    const importCurrent = page.getByTestId('plan-import-current');

    const message = page.getByTestId('plan-file-status').getByRole('paragraph');

    await importCurrent.setInputFiles(partialPlanFile);

    await expect.soft(message).toHaveText(/^partial\.json を読み込みました。/u);

    const first = await message.elementHandle();

    await importCurrent.setInputFiles(partialPlanFile);

    await expect
      .poll(async () => first.evaluate((p) => p.isConnected))
      .toBe(false);

    await expect.soft(message).toHaveText(/^partial\.json を読み込みました。/u);
  },
);

test(
  'the file status describes the plan open, and goes when another is opened',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(demo);

    await page.getByTestId('tab-data').click();

    const fileStatus = page.getByTestId('plan-file-status');

    await page
      .getByTestId('plan-import-current')
      .setInputFiles(partialPlanFile);

    await expect.soft(fileStatus.getByRole('paragraph')).toHaveCount(1);

    await page.getByTestId('plan-create').click();

    await expect
      .soft(page.getByTestId('plan-select').getByRole('option'))
      .toHaveCount(2);

    await expect.soft(fileStatus.getByRole('paragraph')).toHaveCount(0);

    await expect.soft(fileStatus.getByRole('listitem')).toHaveCount(0);

    // Back on the plan it was about, it does not come back.
    await page.getByTestId('plan-select').selectOption({ index: 0 });

    await expect
      .soft(page.getByTestId('plan-select'))
      .toHaveValue(
        (await page
          .getByTestId('plan-select')
          .getByRole('option')
          .first()
          .getAttribute('value')) ?? '',
      );

    await expect.soft(fileStatus.getByRole('paragraph')).toHaveCount(0);
  },
);

test('asks to sign in', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(app);

  await expect
    .soft(page.getByTestId('sign-in'))
    .toHaveText('Google でサインイン');
});

test(
  'the theme follows the choice, or the system',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(demo);

    const isDark = (): Promise<boolean> =>
      page.evaluate(() => document.body.classList.contains('bp6-dark'));

    // 「システム設定に合わせる」 is the default.
    await expect.poll(isDark).toBe(true);

    await page.emulateMedia({ colorScheme: 'light' });

    await expect.poll(isDark).toBe(false);

    await page.getByTestId('theme-dark').click();

    await expect.poll(isDark).toBe(true);

    // The choice is this browser's, and outlasts a reload.
    await page.reload();

    await expect.poll(isDark).toBe(true);

    await expect
      .soft(page.getByTestId('theme-dark'))
      .toHaveAttribute('aria-checked', 'true');

    await page.getByTestId('theme-light').click();

    await expect.poll(isDark).toBe(false);
  },
);

/**
 * The in-memory demo (`?storage=memory`), signed in with one plan of the
 * default inputs; nothing here needs the Firebase emulators.
 */
const demo = '/mono/life-plan-simulator/?storage=memory';

/** A plan file with no inputs, which reads back as the defaults with warnings. */
const partialPlanFile = {
  name: 'partial.json',
  mimeType: 'application/json',
  buffer: Buffer.from('{ "input": {} }'),
} as const;

/** The app as published, which starts at the sign-in screen. */
const app = '/mono/life-plan-simulator/';
