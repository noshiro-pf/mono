import { expect, test } from '@playwright/test';

test('overview shows the checks', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(demo);

  await expect
    .soft(page.getByTestId('checks').getByRole('listitem'))
    .toHaveCount(5);
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
  async ({ page }) => {
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

    await page
      .getByTestId('plan-import-new')
      .setInputFiles(await download.path());

    await expect
      .soft(page.getByTestId('plan-select').getByRole('option'))
      .toHaveText(['home', 'home']);

    await expect.soft(page.getByTestId('plan-import-warnings')).toBeEmpty();

    await page.getByTestId('tab-overview').click();

    await expect.soft(initialCash).toHaveValue('1234567');
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

/** The app as published, which starts at the sign-in screen. */
const app = '/mono/life-plan-simulator/';
