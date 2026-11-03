import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import { render } from 'synstate-dom';
import { page } from 'vitest/browser';
import { cases, mountBlueprint } from './blueprint-cases.js';
import { freezeAnimations } from './helpers.mjs';

// Draws each case of `blueprint-cases.tsx` twice, with Blueprint React and with
// this library, under Blueprint's own style sheets, light and dark, and compares
// the two screenshots pixel by pixel. The markup test catches a class or an
// attribute that differs; this catches what it cannot see: text, the order of
// text and elements, and what a component sets inline.
describe('visual parity with Blueprint React', () => {
  test.each(
    cases.flatMap((testCase) =>
      themes.map((theme) => [testCase[0], theme, testCase] as const),
    ),
  )(
    '%s, %s, is drawn as Blueprint React draws it',
    async (_name, theme, testCase) => {
      const [, theirs, ours] = testCase;

      freezeAnimations();

      // One side at a time, in the same place, so that both are drawn at the same
      // offset and taken from the same scroll position.
      const theirShot = await shotOf(theme, (target) =>
        mountBlueprint(theirs.element, target),
      );

      const ourShot = await shotOf(theme, (target) => render(ours, target));

      const result = await compare(theirShot, ourShot);

      assert.deepStrictEqual(result, { size: result.size, differingPixels: 0 });
    },
  );
});

const themes = ['light', 'dark'] as const;

type Theme = (typeof themes)[number];

type Shot = Readonly<{
  png: string;
  /** What the side takes up, as `width x height`. */
  size: string;
}>;

/**
 * Waits until every icon is drawn, which Blueprint React does once its paths
 * have loaded, whatever its size, rendering an empty span until then; then for
 * two frames, for what a component sets after it has mounted.
 */
const drawn = async (container: HTMLElement): Promise<void> => {
  await expect
    .poll(
      () =>
        Array.from(
          container.querySelectorAll('.bp6-icon:not(:has(> svg))'),
          (icon) => icon.className,
        ),
      { timeout: 10_000 },
    )
    .toStrictEqual([]);

  for (const _ of [0, 1]) {
    // eslint-disable-next-line no-await-in-loop -- one frame after the other
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  }
};

/**
 * Mounts a side with `mount` in a box at the top left of the page, in `theme`,
 * waits until it is drawn, takes its screenshot, and unmounts it.
 */
const shotOf = async (
  theme: Theme,
  mount: (target: HTMLElement) => () => void,
): Promise<Shot> => {
  const container = document.createElement('div');

  const boxStyle = (width: number): string =>
    `position: absolute; left: 0; top: 0; box-sizing: border-box; width: ${width}px; padding: 8px; background: ${theme === 'dark' ? '#252a31' : 'white'};` as const;

  container.setAttribute('style', boxStyle(376));

  if (theme === 'dark') {
    container.classList.add('bp6-dark');
  }

  document.body.append(container);

  let mut_unmount: (() => void) | undefined = undefined;

  try {
    mut_unmount = mount(container);

    await drawn(container);

    // A side wider than the box widens it, so that what overflows is in the
    // screenshot too.
    if (container.scrollWidth > container.clientWidth) {
      container.setAttribute('style', boxStyle(container.scrollWidth));
    }

    return {
      png: await page.screenshot({ element: container, save: false }),
      size: `${container.scrollWidth}x${container.scrollHeight}`,
    };
  } finally {
    mut_unmount?.();

    container.remove();
  }
};

/**
 * One 32-bit value per pixel of the screenshot, and the size, the side's and
 * the image's.
 */
const pixelsOf = async (
  shot: Shot,
): Promise<Readonly<{ pixels: Uint32Array; size: string }>> => {
  const response = await fetch(`data:image/png;base64,${shot.png}`);

  const image = await createImageBitmap(await response.blob());

  const canvas = new OffscreenCanvas(image.width, image.height);

  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('no 2d context');
  }

  context.drawImage(image, 0, 0);

  const { data } = context.getImageData(0, 0, image.width, image.height);

  return {
    pixels: new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4),
    size: `${shot.size} (image ${image.width}x${image.height})`,
  };
};

/**
 * The size both sides take up, and how many pixels of their screenshots differ;
 * -1 when the sizes do, with both sizes.
 */
const compare = async (
  theirs: Shot,
  ours: Shot,
): Promise<Readonly<{ size: string; differingPixels: number }>> => {
  const [a, b] = await Promise.all([pixelsOf(theirs), pixelsOf(ours)]);

  if (a.size !== b.size) {
    return { size: `${a.size} vs ${b.size}`, differingPixels: -1 };
  }

  return {
    size: a.size,
    differingPixels: a.pixels.reduce(
      (count, pixel, i) => (pixel === b.pixels[i] ? count : count + 1),
      0,
    ),
  };
};
