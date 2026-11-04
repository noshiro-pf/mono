import { expect, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

test(
  'a press on the rail moves the slider to the nearest step',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const slider = page.getByRole('slider', { name: '分割数' });

    // 2 to 30: the left end, the right end, then 14 steps of 28 in.
    await pressRail(page, '分割数', 0);

    await expect.soft(slider).toHaveValue('2');

    await pressRail(page, '分割数', 1);

    await expect.soft(slider).toHaveValue('30');

    await pressRail(page, '分割数', 0.5);

    await expect.soft(slider).toHaveValue('16');
  },
);

test(
  'a drag along the rail follows the pointer',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const point = await railPoint(page, '彩度', 0.2);

    await page.mouse.move(point.x, point.y);

    await page.mouse.down();

    await expect
      .soft(page.getByRole('slider', { name: '彩度' }))
      .toHaveValue('20');

    // 0 to 100 by 5: 0.62 of the way is 62, nearest 60.
    const end = await railPoint(page, '彩度', 0.62);

    await page.mouse.move(end.x, end.y, { steps: 5 });

    await page.mouse.up();

    await expect
      .soft(page.getByRole('slider', { name: '彩度' }))
      .toHaveValue('60');
  },
);

/**
 * A point on the rail of the slider captioned `caption`, `ratio` of the way
 * from its left end.
 *
 * The rail spans the width of the caption's wrapper, which has neither a role
 * nor a test id in the version this spec was first run against, so the wrapper
 * is the caption's parent. The height is the centre of the slider's input,
 * which fills the thumb, and the thumb sits centred on the rail.
 */
const railPoint = async (
  page: DeepReadonly<Page>,
  caption: string,
  ratio: number,
): Promise<Readonly<{ x: number; y: number }>> => {
  // eslint-disable-next-line playwright/no-raw-locators -- see above
  const wrapper = page.getByText(caption, { exact: true }).locator('xpath=..');

  await wrapper.scrollIntoViewIfNeeded();

  const wrapperBox = await wrapper.boundingBox();

  const thumbBox = await page
    .getByRole('slider', { name: caption })
    .boundingBox();

  if (wrapperBox === null || thumbBox === null) {
    throw new Error(`The slider "${caption}" is not laid out`);
  }

  // Kept a pixel inside each end, so that the press lands on the rail.
  return {
    x: wrapperBox.x + 1 + (wrapperBox.width - 2) * ratio,
    y: thumbBox.y + thumbBox.height / 2,
  };
};

const pressRail = async (
  page: DeepReadonly<Page>,
  caption: string,
  ratio: number,
): Promise<void> => {
  const point = await railPoint(page, caption, ratio);

  await page.mouse.click(point.x, point.y);
};
