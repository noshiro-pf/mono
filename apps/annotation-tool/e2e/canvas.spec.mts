import { expect, type Locator, type Page, test } from '@playwright/test';
import { Arr, asUint32, Num, Result } from 'ts-data-forge';
import type { DeepReadonly, FixedLengthTuple } from 'ts-type-forge';
import { labelButton } from './locators.mjs';

test(
  "dragging on the canvas draws a box in the selected label's colour",
  { tag: '@smoke' },
  async ({ page }) => {
    const blank = await openBlankCanvas(page);

    await labelButton(page, 'Cat').click();

    await drag(page, { x: 150, y: 150 }, { x: 350, y: 300 });

    const cat = await labelColor(page, 'Cat');

    const drawn = await canvasShot(page);

    // A line down through the box crosses its top and bottom edges, a line
    // across it its left and right edges.
    expect
      .soft(await edges(page, { blank, drawn, color: cat, axis: 'x', at: 200 }))
      .toStrictEqual([150, 300]);

    expect
      .soft(await edges(page, { blank, drawn, color: cat, axis: 'y', at: 200 }))
      .toStrictEqual([150, 350]);
  },
);

test(
  'a box moves by its face and resizes by its corner',
  { tag: '@smoke' },
  async ({ page }) => {
    const blank = await openBlankCanvas(page);

    await labelButton(page, 'Cat').click();

    await drag(page, { x: 150, y: 150 }, { x: 350, y: 300 });

    const cat = await labelColor(page, 'Cat');

    // Grabbed inside: the whole box moves by (+50, +30).
    await drag(page, { x: 250, y: 225 }, { x: 300, y: 255 });

    const moved = await canvasShot(page);

    expect
      .soft(
        await edges(page, {
          blank,
          drawn: moved,
          color: cat,
          axis: 'x',
          at: 250,
        }),
        'moved: horizontal edges',
      )
      .toStrictEqual([180, 330]);

    expect
      .soft(
        await edges(page, {
          blank,
          drawn: moved,
          color: cat,
          axis: 'y',
          at: 230,
        }),
        'moved: vertical edges',
      )
      .toStrictEqual([200, 400]);

    // Grabbed by the bottom-right corner: only that corner moves.
    await drag(page, { x: 400, y: 330 }, { x: 450, y: 400 });

    const resized = await canvasShot(page);

    expect
      .soft(
        await edges(page, {
          blank,
          drawn: resized,
          color: cat,
          axis: 'x',
          at: 250,
        }),
        'resized: horizontal edges',
      )
      .toStrictEqual([180, 400]);

    expect
      .soft(
        await edges(page, {
          blank,
          drawn: resized,
          color: cat,
          axis: 'y',
          at: 250,
        }),
        'resized: vertical edges',
      )
      .toStrictEqual([200, 450]);
  },
);

test(
  'each box keeps the colour of the label it was drawn with',
  { tag: '@smoke' },
  async ({ page }) => {
    const blank = await openBlankCanvas(page);

    await labelButton(page, 'Cat').click();

    await drag(page, { x: 150, y: 150 }, { x: 350, y: 300 });

    await labelButton(page, 'Eagle').click();

    await drag(page, { x: 100, y: 420 }, { x: 300, y: 550 });

    const cat = await labelColor(page, 'Cat');

    const eagle = await labelColor(page, 'Eagle');

    expect.soft(eagle).not.toStrictEqual(cat);

    const drawn = await canvasShot(page);

    // The line x = 170 crosses both boxes, clear of their corner and middle
    // handles.
    expect
      .soft(
        await edges(page, { blank, drawn, color: cat, axis: 'x', at: 170 }),
        'Cat',
      )
      .toStrictEqual([150, 300]);

    expect
      .soft(
        await edges(page, { blank, drawn, color: eagle, axis: 'x', at: 170 }),
        'Eagle',
      )
      .toStrictEqual([420, 550]);
  },
);

type Rgb = FixedLengthTuple<3, number>;

type CanvasPoint = Readonly<{ x: number; y: number }>;

const canvas = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('annotation-canvas');

/**
 * The canvas as it appears on screen, in CSS pixels, as a base64 PNG. It is
 * read from a screenshot since WebGL keeps no buffer to read back once it has
 * drawn; so it holds the image under the boxes too.
 */
const canvasShot = async (page: DeepReadonly<Page>): Promise<string> => {
  const png = await canvas(page).screenshot({ scale: 'css' });

  // `toBase64` is Node 25's; `engines.node` still allows 22.

  return png.toString('base64');
};

/**
 * Opens the app and returns the canvas before anything is drawn on it, once the
 * sample image under it has loaded, so that the shot holds the same image as
 * the later ones.
 */
const openBlankCanvas = async (page: DeepReadonly<Page>): Promise<string> => {
  await page.goto('/');

  await expect
    .poll(async () =>
      page
        .getByTestId('sample-image')
        .evaluate(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth > 0,
        ),
    )
    .toBe(true);

  return canvasShot(page);
};

/**
 * A press at `from` and a release at `to`, in canvas pixels, then the pointer
 * moves off the canvas, so that the hover highlight goes. The crosshair stays
 * where the drag ended, at a corner of the box, drawn under the boxes.
 */
const drag = async (
  page: DeepReadonly<Page>,
  from: CanvasPoint,
  to: CanvasPoint,
): Promise<void> => {
  const box = await canvas(page).boundingBox();

  if (box === null) {
    throw new Error('The canvas is not laid out');
  }

  await page.mouse.move(box.x + from.x, box.y + from.y);

  await page.mouse.down();

  await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 5 });

  await page.mouse.up();

  // Just past the canvas's top-left corner, wherever the layout puts it.
  await page.mouse.move(Math.max(0, box.x - 1), Math.max(0, box.y - 1));
};

/** A channel `labelColor`'s pattern has matched, so all digits. */
const toChannel = (digits: string): number =>
  Result.unwrapOkOr(Num.safeParseFloat(digits), Number.NaN);

/**
 * The colour of a label's button, which is the colour its boxes are drawn in.
 */
const labelColor = async (
  page: DeepReadonly<Page>,
  labelName: string,
): Promise<Rgb> => {
  const css = await labelButton(page, labelName).evaluate(
    (button) => getComputedStyle(button).backgroundColor,
  );

  const channels = /^rgb\((?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/u.exec(
    css,
  )?.groups;

  if (
    channels?.['r'] === undefined ||
    channels['g'] === undefined ||
    channels['b'] === undefined
  ) {
    throw new Error(
      `The button of ${labelName} is not an opaque colour: ${css}`,
    );
  }

  return [
    toChannel(channels['r']),
    toChannel(channels['g']),
    toChannel(channels['b']),
  ];
};

/**
 * Where a line of `drawn` crosses something drawn in `color`: the centre of each
 * run of such pixels, rounded. `x` scans the column `at` downwards, `y` the row
 * `at` across. A pixel that already had the colour in `blank`, the same canvas
 * before anything was drawn, is part of the image and not counted.
 */
const edges = async (
  page: DeepReadonly<Page>,
  scan: Readonly<{
    blank: string;
    drawn: string;
    color: Rgb;
    axis: 'x' | 'y';
    at: number;
  }>,
): Promise<readonly number[]> => {
  const [blankPixels, drawnPixels] = await page.evaluate(
    async ([shots, axis, at]) =>
      Promise.all(
        shots.map(async (base64) => {
          const response = await fetch(`data:image/png;base64,${base64}`);

          const image = await createImageBitmap(await response.blob());

          const offscreen = new OffscreenCanvas(image.width, image.height);

          const context = offscreen.getContext('2d');

          if (context === null) {
            throw new Error('No 2D context');
          }

          context.drawImage(image, 0, 0);

          return Array.from(
            axis === 'x'
              ? context.getImageData(at, 0, 1, image.height).data
              : context.getImageData(0, at, image.width, 1).data,
          );
        }),
      ),
    [[scan.blank, scan.drawn], scan.axis, scan.at] as const,
  );

  // Within 3 per channel: the canvas and the button round the same colour
  // separately.
  const isColor = (pixels: readonly number[] | undefined, i: number): boolean =>
    scan.color.every(
      (channel, c) => Math.abs((pixels?.[i * 4 + c] ?? 0) - channel) <= 3,
    );

  const hits = Arr.seq(
    asUint32(Math.floor((drawnPixels?.length ?? 0) / 4)),
  ).filter((i) => isColor(drawnPixels, i) && !isColor(blankPixels, i));

  // Consecutive hits are one run: it starts at a hit that does not follow
  // another and ends at one that is not followed.
  const starts = hits.filter((i, k) => hits[k - 1] !== i - 1);

  const ends = hits.filter((i, k) => hits[k + 1] !== i + 1);

  return starts.map((start, k) => Math.round((start + (ends[k] ?? start)) / 2));
};
