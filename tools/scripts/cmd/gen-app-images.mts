// cspell:ignore Noto
import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { chromium, type Page } from 'playwright';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly, StrictOmit } from 'ts-type-forge';
import {
  type AppHead,
  linkTargets,
  parseAppHead,
  publicPathOf,
} from '../lib/app-head.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Draws a browser app's `public/apple-touch-icon.png` and
 * `public/og-image.png` from its `public/favicon.svg` and what its
 * `index.html` says: `og:title`, `og:description`.
 *
 * Run by hand, when the icon or the text changes — not part of `gen`: a
 * Chromium or font update would otherwise dirty the tree with byte-level
 * differences. It draws only what the page links to: the touch icon when it
 * has `<link rel="apple-touch-icon">` and a `favicon.svg` to draw it from
 * (an app whose icon is a raster drawing keeps the PNG it has), the card
 * when it has `og:image`. The text is set in Noto Sans JP from Google Fonts,
 * so this needs the network.
 */
export const genAppImages = async (
  appDir: string,
): Promise<Result<readonly string[], string>> => {
  const html = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(appDir, 'index.html'), 'utf8'),
  );

  if (Result.isErr(html)) {
    return Result.err(
      `${appDir} has no index.html to read: ${unknownToString(html.value)}`,
    );
  }

  const head = parseAppHead(html.value);

  const publicDir = path.join(appDir, 'public');

  const favicon = await readOptional(path.join(publicDir, 'favicon.svg'));

  const touchIconPath = linkTargets(head, 'apple-touch-icon')
    .map(publicPathOf)
    .find((href) => href !== undefined);

  await using browser = await chromium.launch();

  {
    const page = await browser.newPage();

    const mut_written: string[] = [];

    if (touchIconPath !== undefined && favicon !== undefined) {
      const square = squareCorners(favicon.toString('utf8'));

      if (Result.isErr(square)) {
        return square;
      }

      const target = path.join(publicDir, touchIconPath);

      await renderTouchIcon(page, square.value, target);

      mut_written.push(target);
    }

    const ogImage = head.meta.get('og:image');

    if (ogImage !== undefined) {
      const card = cardText(head);

      if (Result.isErr(card)) {
        return card;
      }

      const icon =
        favicon !== undefined
          ? toDataUri('image/svg+xml', favicon)
          : touchIconPath === undefined
            ? undefined
            : await readOptional(path.join(publicDir, touchIconPath)).then(
                (png) =>
                  png === undefined ? undefined : toDataUri('image/png', png),
              );

      if (icon === undefined) {
        return Result.err(
          `${appDir}: no favicon.svg or apple-touch-icon to put on the card.`,
        );
      }

      const ogImageUrl = new URL(ogImage);

      const target = path.join(publicDir, path.basename(ogImageUrl.pathname));

      await renderCard(page, { ...card.value, icon }, target);

      mut_written.push(target);
    }

    return Result.ok(mut_written);
  }
};

/**
 * `favicon.svg` with the corners of its background square taken off: iOS
 * rounds a touch icon itself, and a transparent corner is filled with black.
 * The background is the first `<rect>` spanning the whole 32×32 view box.
 */
export const squareCorners = (svg: string): Result<string, string> =>
  svg.includes(SQUARE_BACKGROUND)
    ? Result.ok(svg.replace(ROUNDED_BACKGROUND_RADIUS, ''))
    : Result.err(
        'favicon.svg does not start its drawing with <rect width="32" height="32" rx="…" fill="…">, the background this would square off.',
      );

const SQUARE_BACKGROUND = '<rect width="32" height="32"';

/** The ` rx="…"` of the first `<rect>` that spans the whole view box. */
const ROUNDED_BACKGROUND_RADIUS =
  /(?<=<rect width="32" height="32") rx="[^"]*"/u;

const TOUCH_ICON_SIZE = 180;

const OG_IMAGE_WIDTH = 1200;

const OG_IMAGE_HEIGHT = 630;

const renderTouchIcon = async (
  page: DeepReadonly<Page>,
  svg: string,
  target: string,
): Promise<void> => {
  await page.setViewportSize({
    width: TOUCH_ICON_SIZE,
    height: TOUCH_ICON_SIZE,
  });

  await page.setContent(dedent`
    <!doctype html>
    <style>
      body { margin: 0; }
      img { display: block; width: 100vw; height: 100vh; }
    </style>
    <img src="${toDataUri('image/svg+xml', Buffer.from(svg))}" />
  `);

  await page.locator('img').evaluate((img: HTMLImageElement) => img.decode());

  await page.screenshot({ path: target });
};

type Card = Readonly<{
  title: string;
  description: string;
  /** The page's `lang`, which `word-break: auto-phrase` breaks lines by. */
  lang: string;
  icon: string;
}>;

/**
 * The card #2551 drew for life-plan-simulator by hand, made repeatable: the
 * icon on the left and the name and a line about the app beside it, on the
 * light grey of a GitHub page. No screenshot, nothing personal — the
 * repository is public.
 */
const renderCard = async (
  page: DeepReadonly<Page>,
  { title, description, lang, icon }: Card,
  target: string,
): Promise<void> => {
  await page.setViewportSize({
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  });

  await page.setContent(dedent`
    <!doctype html>
    <html lang="${lang}">
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=block"
    />
    <style>
      body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        gap: 60px;
        padding: 0 80px;
        box-sizing: border-box;
        background: #f6f8fa;
        font-family: 'Noto Sans JP', sans-serif;
      }
      img { flex: none; width: 240px; height: 240px; border-radius: 52px; }
      h1, p { word-break: auto-phrase; line-break: strict; text-wrap: pretty; }
      h1 { margin: 0; font-size: 76px; font-weight: 700; line-height: 1.15; color: #1f2328; }
      p { margin: 24px 0 0; font-size: 38px; line-height: 1.45; color: #59636e; }
    </style>
    <img src="${icon}" />
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
    </div>
  `);

  // Google Fonts splits Noto Sans JP into subsets by `unicode-range`, and a
  // browser fetches one only when text asks for it; `document.fonts.ready`
  // can resolve before layout has asked. So each face is loaded for the very
  // text it sets, and then checked for it.
  const loaded = await page.evaluate(
    async (faces: readonly (readonly [font: string, text: string])[]) => {
      await document.querySelector('img')?.decode();

      await Promise.all(
        faces.map(([font, text]) => document.fonts.load(font, text)),
      );

      return faces.every(([font, text]) => document.fonts.check(font, text));
    },
    [
      ['700 76px "Noto Sans JP"', title],
      ['400 38px "Noto Sans JP"', description],
    ] as const,
  );

  if (!loaded) {
    throw new Error(
      'Noto Sans JP did not load from Google Fonts; the card would be set in a fallback font.',
    );
  }

  await page.screenshot({ path: target });
};

const cardText = (head: AppHead): Result<StrictOmit<Card, 'icon'>, string> => {
  const title = head.meta.get('og:title') ?? head.title;

  const description = head.meta.get('og:description');

  return title === undefined || description === undefined
    ? Result.err('index.html needs og:title and og:description for the card.')
    : Result.ok({ title, description, lang: head.lang ?? 'en' });
};

const readOptional = async (file: string): Promise<Buffer | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const result = await Result.fromPromise(fs.readFile(file));

  return Result.isErr(result) ? undefined : result.value;
};

const toDataUri = (mediaType: string, bytes: Readonly<Buffer>): string =>
  `data:${mediaType};base64,${bytes.toString('base64')}` as const;

const escapeHtml = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const USAGE = dedent`
  Usage: pnpm run gen:app-images -- <app directory>...

  Draws public/apple-touch-icon.png and public/og-image.png of each browser
  app from its public/favicon.svg and the og:* of its index.html.
`;

if (isDirectlyExecuted(import.meta.url)) {
  const args = Arr.skip(process.argv, 2).filter((arg) => arg !== '--');

  if (args.includes('--help') || args.includes('-h')) {
    console.info(USAGE);

    process.exit(0);
  }

  const appDirs = args.map((arg) => path.resolve(projectRootPath, arg));

  if (!Arr.isNonEmpty(appDirs)) {
    console.error(USAGE);

    process.exit(1);
  }

  for (const appDir of appDirs) {
    const result = await genAppImages(appDir).catch((error: unknown) =>
      Result.err(unknownToString(error)),
    );

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    for (const written of result.value) {
      console.info(`wrote ${path.relative(projectRootPath, written)}`);
    }
  }
}
