import { expect, type Locator, type Page, test } from '@playwright/test';
import { Arr, Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

test(
  'the luminance tab is the one shown first',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect
      .soft(page.getByRole('tab', { name: 'luminance' }))
      .toHaveAttribute('aria-selected', 'true');

    await expect
      .soft(page.getByRole('tab', { name: 'text-color' }))
      .toHaveAttribute('aria-selected', 'false');

    await expect.soft(page.getByTestId('contrast-table')).toBeHidden();
  },
);

test(
  'the sliders start at their defaults',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect.soft(slider(page, '彩度')).toHaveValue('80');

    await expect.soft(slider(page, '明度')).toHaveValue('60');

    await expect.soft(slider(page, '色相0°位置')).toHaveValue('0');

    await expect.soft(slider(page, '分割数')).toHaveValue('14');
  },
);

test(
  'every chart has a bar for each of the 360 hues',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect.soft(bars(page, 'distribution-luminance')).toHaveCount(360);

    await expect.soft(bars(page, 'result-equally-spaced')).toHaveCount(360);

    await expect.soft(bars(page, 'distribution-weighted')).toHaveCount(360);

    await expect.soft(bars(page, 'result-weighted')).toHaveCount(360);

    await expect.soft(bars(page, 'distribution-weighted-log')).toHaveCount(360);

    await expect.soft(bars(page, 'result-weighted-log')).toHaveCount(360);
  },
);

test(
  'the figures for the default sliders',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expectResult(page.getByTestId('result-equally-spaced'), {
      ratios: [
        '1.54',
        '1.63',
        '1.09',
        '1.10',
        '1.03',
        '1.03',
        '1.05',
        '1.85',
        '1.88',
        '1.07',
        '1.35',
        '1.21',
        '1.09',
        '1.05',
      ],
      variance: '0.089472109952',
    });

    await expectResult(page.getByTestId('result-weighted'), {
      ratios: [
        '1.39',
        '1.28',
        '1.24',
        '1.17',
        '1.14',
        '1.15',
        '1.00',
        '1.20',
        '1.21',
        '1.31',
        '1.39',
        '1.62',
        '1.67',
        '1.00',
      ],
      variance: '0.035787294978',
    });

    await expectResult(page.getByTestId('result-weighted-log'), {
      ratios: [
        '1.29',
        '1.30',
        '1.32',
        '1.31',
        '1.21',
        '1.14',
        '1.30',
        '1.32',
        '1.29',
        '1.31',
        '1.12',
        '1.32',
        '1.30',
        '1.10',
      ],
      variance: '0.005867937380',
    });

    // Every bar is drawn from the figures, so their sum shows a stale chart.
    expect
      .soft(
        await barHeightSum(page, 'distribution-luminance'),
        'distribution-luminance',
      )
      .toBeCloseTo(19421, 0);

    expect
      .soft(
        await barHeightSum(page, 'distribution-weighted'),
        'distribution-weighted',
      )
      .toBeCloseTo(21813.6, 0);

    expect
      .soft(
        await barHeightSum(page, 'distribution-weighted-log'),
        'distribution-weighted-log',
      )
      .toBeCloseTo(19362.6, 0);

    // Hue 0 at saturation 80% and lightness 60%.
    await expect
      .soft(
        page
          .getByTestId('result-equally-spaced')
          .getByTestId('color-swatch')
          .first(),
      )
      .toHaveCSS('background-color', 'rgb(235, 71, 71)');
  },
);

test(
  'moving the sliders recomputes every figure',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await slider(page, '分割数').press('ArrowRight');

    await slider(page, '彩度').press('ArrowLeft');

    await slider(page, '明度').press('ArrowRight');

    await slider(page, '色相0°位置').press('ArrowRight');

    await slider(page, '色相0°位置').press('ArrowRight');

    await expectResult(page.getByTestId('result-equally-spaced'), {
      ratios: [
        '1.38',
        '1.46',
        '1.20',
        '1.09',
        '1.06',
        '1.02',
        '1.03',
        '1.18',
        '1.58',
        '1.62',
        '1.12',
        '1.23',
        '1.11',
        '1.07',
        '1.05',
      ],
      variance: '0.038171216844',
    });

    await expectResult(page.getByTestId('result-weighted'), {
      ratios: [
        '1.30',
        '1.21',
        '1.19',
        '1.15',
        '1.14',
        '1.04',
        '1.12',
        '1.00',
        '1.16',
        '1.19',
        '1.25',
        '1.30',
        '1.27',
        '1.40',
        '1.02',
      ],
      variance: '0.011255576170',
    });

    await expectResult(page.getByTestId('result-weighted-log'), {
      ratios: [
        '1.23',
        '1.21',
        '1.23',
        '1.21',
        '1.06',
        '1.08',
        '1.20',
        '1.23',
        '1.23',
        '1.22',
        '1.22',
        '1.11',
        '1.23',
        '1.22',
        '1.10',
      ],
      variance: '0.003695465880',
    });

    // Every bar is drawn from the figures, so their sum shows a stale chart.
    expect
      .soft(
        await barHeightSum(page, 'distribution-luminance'),
        'distribution-luminance',
      )
      .toBeCloseTo(21163.5, 0);

    expect
      .soft(
        await barHeightSum(page, 'distribution-weighted'),
        'distribution-weighted',
      )
      .toBeCloseTo(21638.1, 0);

    expect
      .soft(
        await barHeightSum(page, 'distribution-weighted-log'),
        'distribution-weighted-log',
      )
      .toBeCloseTo(19666.5, 0);

    await expect.soft(slider(page, '彩度')).toHaveValue('75');

    await expect.soft(slider(page, '明度')).toHaveValue('65');

    await expect.soft(slider(page, '色相0°位置')).toHaveValue('2');

    await expect.soft(slider(page, '分割数')).toHaveValue('15');
  },
);

test(
  'the sliders keep their values across a tab switch',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await slider(page, '分割数').press('ArrowRight');

    await page.getByRole('tab', { name: 'text-color' }).click();

    await expect.soft(page.getByTestId('contrast-table')).toBeVisible();

    await page.getByRole('tab', { name: 'luminance' }).click();

    await expect.soft(slider(page, '分割数')).toHaveValue('15');

    await expect
      .soft(
        page.getByTestId('result-equally-spaced').getByTestId('color-swatch'),
      )
      .toHaveCount(15);
  },
);

const slider = (page: DeepReadonly<Page>, label: string): Locator =>
  page.getByRole('slider', { name: label });

/** The bars of the chart in the section `e2eId`. */
const bars = (page: DeepReadonly<Page>, e2eId: string): Locator =>
  page.getByTestId(e2eId).getByTestId('distribution-bar');

/** The sum of the bar heights, in percent, of the chart in the section `e2eId`. */
const barHeightSum = async (
  page: DeepReadonly<Page>,
  e2eId: string,
): Promise<number> =>
  Arr.sum(
    Arr.map(
      await bars(page, e2eId).evaluateAll((barElements) =>
        barElements.map((bar) =>
          bar instanceof HTMLElement ? bar.style.height : '',
        ),
      ),
      (height) =>
        Result.unwrapOkOr(
          Num.safeParseFloat(height.replace(/%$/u, '')),
          Number.NaN,
        ),
    ),
  );

/**
 * What a result section shows for the picked hues: one swatch and one contrast
 * ratio per hue, the variance of those ratios, and the picked hues coloured in
 * its chart (the other bars are transparent).
 *
 * The variance is printed in full, and its last digits depend on the engine's
 * `Math.pow`, whose precision the spec leaves to the implementation; so
 * `variance` is its first 12 decimal places, and more digits must follow. It is
 * below 1 in every case here.
 */
const expectResult = async (
  section: Locator,
  expected: Readonly<{ ratios: readonly string[]; variance: string }>,
): Promise<void> => {
  await expect
    .soft(section.getByTestId('contrast-ratio'))
    .toHaveText(expected.ratios.map((ratio) => `${ratio},`));

  const variance = section.getByTestId('variance');

  await expect
    .soft(variance)
    .toContainText(`コントラスト比の分散：${expected.variance}`);

  await expect.soft(variance).toHaveText(/^コントラスト比の分散：0\.\d{13,}$/u);

  await expect
    .soft(section.getByTestId('color-swatch'))
    .toHaveCount(expected.ratios.length);

  await expect
    .configure({ soft: true })
    .poll(
      async () =>
        section
          .getByTestId('distribution-bar')
          .evaluateAll(
            (barElements) =>
              barElements.filter(
                (bar) =>
                  getComputedStyle(bar).backgroundColor !== 'rgba(0, 0, 0, 0)',
              ).length,
          ),
      'coloured bars',
    )
    .toBe(expected.ratios.length);
};
