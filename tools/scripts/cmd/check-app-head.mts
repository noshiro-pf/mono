// cspell:ignore IHDR
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { pagesAppDirs, pagesAppUrl } from '../../configs/pages-apps.mjs';
import {
  type AppHead,
  linkTargets,
  parseAppHead,
  publicPathOf,
} from '../lib/app-head.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a browser app's `index.html` (every `apps/*\/index.html`) names
 * an icon or link-card image that is not there, or is published and lacks
 * what a home screen or a link card needs.
 *
 * None of it fails anywhere else. A missing icon is a 404 in the console and
 * the browser's blank page on the tab; a relative or mis-sized `og:image` is a
 * link card on X, Slack or Discord with no picture, noticed once someone
 * shares the URL; an `og:url` naming another app's site sends crawlers there.
 * What each tag is for is `docs/browser-app-head.md`.
 *
 * "Published" is read from the page: one carrying `og:url` is published there.
 * An app in `tools/configs/pages-apps.mts` is published and must carry the
 * Pages URL it is served from. One with a `.firebaserc` may or may not be
 * deployed — the Firebase site of an app since moved to Pages still answers,
 * or not — so its `og:url`, when present, must name that project's site.
 */
export const checkAppHead = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const appDirs = yield* Result.safeUnwrap(await listBrowserAppDirs());

    const apps = yield* Result.safeUnwrap(
      collectResults(await Promise.all(appDirs.map(readAppFacts))),
    );

    const violations = apps.flatMap(({ relativePath, facts }) =>
      collectAppHeadViolations(facts).map(
        (message) => `${relativePath}: ${message}`,
      ),
    );

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok(apps.length);
  });

/** What is wrong with one app's `<head>`, as one message per problem. */
export const collectAppHeadViolations = (facts: AppFacts): readonly string[] =>
  Arr.generate(function* () {
    const { head, publicFiles } = facts;

    if (!Arr.isNonEmpty(linkTargets(head, 'icon'))) {
      yield 'has no <link rel="icon">, so the tab shows a blank page icon and the console a 404 for /favicon.ico.';
    }

    for (const { rel, href } of head.links) {
      if (!FILE_LINK_RELATIONS.has(rel)) {
        continue;
      }

      const publicPath = publicPathOf(href);

      if (publicPath === undefined) {
        continue;
      }

      const file = publicFiles.get(publicPath);

      if (file === undefined) {
        yield `<link rel="${rel}" href="${href}"> names public/${publicPath}, which does not exist.`;
      } else if (
        publicPath.endsWith('.svg') &&
        hasDoubleHyphenInComment(file.text ?? '')
      ) {
        yield `public/${publicPath} has "--" inside a comment, which XML forbids: a browser rejects the whole file and shows no icon, while an image viewer draws it regardless.`;
      }
    }

    if (linkTargets(head, 'apple-touch-icon').length > 1) {
      yield 'has more than one apple-touch-icon. iOS asks for 180×180 alone and scales it; the other sizes are a favicon generator’s leftovers.';
    }

    const ogUrl = head.meta.get('og:url');

    if (facts.pagesUrl !== undefined && ogUrl !== facts.pagesUrl) {
      yield `is published to Pages at ${facts.pagesUrl}, but og:url is ${ogUrl ?? 'missing'}.`;
    } else if (
      ogUrl !== undefined &&
      facts.pagesUrl === undefined &&
      facts.firebaseUrl !== undefined &&
      ogUrl !== facts.firebaseUrl
    ) {
      yield `deploys to ${facts.firebaseUrl} (.firebaserc), but og:url is ${ogUrl}.`;
    }

    if (ogUrl === undefined) {
      return;
    }

    yield* collectPublishedViolations(facts, ogUrl);
  });

export type AppFacts = Readonly<{
  head: AppHead;
  /** Every file under the app's `public/`, by its path relative to it. */
  publicFiles: ReadonlyMap<string, PublicFile>;
  /** Where Pages serves the app from, when `pages-apps.mts` names it. */
  pagesUrl: string | undefined;
  /** The site of the Firebase project in the app's `.firebaserc`, if any. */
  firebaseUrl: string | undefined;
}>;

export type PublicFile = Readonly<{
  /** The size a PNG declares in its header; `undefined` for any other file. */
  png: Readonly<{ width: number; height: number }> | undefined;
  /** The text of an SVG; `undefined` for any other file. */
  text: string | undefined;
}>;

/** The `<link>` relations whose `href` is a file the page itself serves. */
const FILE_LINK_RELATIONS: ReadonlySet<string> = new Set<string>([
  'icon',
  'shortcut icon',
  'apple-touch-icon',
  'manifest',
]);

/**
 * What a published page carries besides `og:url`. `twitter:title` and the
 * like are not asked for: X reads `og:*` when they are absent.
 */
const PUBLISHED_META = [
  'description',
  'theme-color',
  'apple-mobile-web-app-title',
  'og:type',
  'og:title',
  'og:description',
  'og:image',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'twitter:card',
] as const;

const TOUCH_ICON_SIZE = 180;

const OG_IMAGE_WIDTH = 1200;

const OG_IMAGE_HEIGHT = 630;

/** An absolute https URL of a directory, as written: no query, no fragment. */
const isSiteUrl = (url: string): boolean => {
  const parsed = URL.parse(url);

  return (
    parsed?.protocol === 'https:' &&
    parsed.href === url &&
    parsed.search === '' &&
    parsed.hash === '' &&
    url.endsWith('/')
  );
};

const collectPublishedViolations = (
  { head, publicFiles }: AppFacts,
  ogUrl: string,
): readonly string[] =>
  Arr.generate(function* () {
    for (const key of PUBLISHED_META) {
      if (!head.meta.has(key)) {
        yield `is published (it has og:url) but has no <meta> "${key}".`;
      }
    }

    if (!isSiteUrl(ogUrl)) {
      yield `og:url ${ogUrl} is not an absolute https URL ending in "/".`;
    }

    const twitterCard = head.meta.get('twitter:card');

    if (twitterCard !== undefined && twitterCard !== 'summary_large_image') {
      yield `twitter:card is "${twitterCard}"; "summary_large_image" is the card that shows og:image at its 1200×630.`;
    }

    const touchIcon = linkTargets(head, 'apple-touch-icon')[0];

    if (touchIcon === undefined) {
      yield 'is published but has no <link rel="apple-touch-icon">, so iOS draws the title’s first letter on the home screen.';
    } else {
      const publicPath = publicPathOf(touchIcon);

      const png =
        publicPath === undefined ? undefined : publicFiles.get(publicPath)?.png;

      if (
        publicPath !== undefined &&
        publicFiles.has(publicPath) &&
        (png?.width !== TOUCH_ICON_SIZE || png.height !== TOUCH_ICON_SIZE)
      ) {
        yield `public/${publicPath} is not a ${TOUCH_ICON_SIZE}×${TOUCH_ICON_SIZE} PNG.`;
      }
    }

    const ogImage = head.meta.get('og:image');

    if (ogImage === undefined) {
      return;
    }

    if (!ogImage.startsWith(ogUrl)) {
      yield `og:image ${ogImage} is not under og:url ${ogUrl}. Crawlers do not resolve a relative URL here, and Vite would only prefix the base path.`;

      return;
    }

    const imagePath = ogImage.slice(ogUrl.length);

    const image = publicFiles.get(imagePath);

    if (image === undefined) {
      yield `og:image names public/${imagePath}, which does not exist.`;

      return;
    }

    if (
      image.png?.width !== OG_IMAGE_WIDTH ||
      image.png.height !== OG_IMAGE_HEIGHT
    ) {
      yield `public/${imagePath} is not a ${OG_IMAGE_WIDTH}×${OG_IMAGE_HEIGHT} PNG, the size a large link card is drawn at.`;
    } else if (
      head.meta.get('og:image:width') !== OG_IMAGE_WIDTH.toString() ||
      head.meta.get('og:image:height') !== OG_IMAGE_HEIGHT.toString()
    ) {
      yield `og:image:width / og:image:height do not say ${OG_IMAGE_WIDTH} / ${OG_IMAGE_HEIGHT}, the size of public/${imagePath}.`;
    }
  });

const hasDoubleHyphenInComment = (svg: string): boolean =>
  svg
    .matchAll(/<!--(?<body>[\s\S]*?)-->/gu)
    .some((matched) => matched.groups?.['body']?.includes('--') === true);

const listBrowserAppDirs = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await glob('apps/*/index.html', {
    cwd: projectRootPath,
    absolute: true,
  });

  return Result.isErr(result)
    ? Result.err(
        `Failed to list apps/*/index.html: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value.map(path.dirname).toSorted());
};

/** The width and height in a PNG's `IHDR`, which is always its first chunk. */
const readPngSize = (bytes: Readonly<Buffer>): PublicFile['png'] =>
  bytes.length >= 24 && bytes.subarray(12, 16).toString('latin1') === 'IHDR'
    ? ({
        width: bytes.readUInt32BE(16),
        height: bytes.readUInt32BE(20),
      } as const)
    : undefined;

const readPublicFiles = async (
  publicDir: string,
): Promise<ReadonlyMap<string, PublicFile>> => {
  const listed = await glob('**/*', { cwd: publicDir, dot: false });

  if (Result.isErr(listed)) {
    throw new Error(unknownToString(listed.value));
  }

  const entries = await Promise.all(
    listed.value.map(async (relativePath) => {
      const filePath = path.join(publicDir, relativePath);

      const png = relativePath.endsWith('.png')
        ? readPngSize(
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            await fs.readFile(filePath),
          )
        : undefined;

      const text = relativePath.endsWith('.svg')
        ? // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.readFile(filePath, 'utf8')
        : undefined;

      return [relativePath, { png, text }] as const;
    }),
  );

  return new Map(entries);
};

const readFirebaseProject = async (
  appDir: string,
): Promise<string | undefined> => {
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(appDir, '.firebaserc'), 'utf8'),
  );

  if (Result.isErr(text)) {
    return undefined;
  }

  const parsed: unknown = JSON.parse(text.value);

  const project =
    isRecord(parsed) && isRecord(parsed['projects'])
      ? parsed['projects']['default']
      : undefined;

  return typeof project === 'string' ? project : undefined;
};

const readAppFacts = async (
  appDir: string,
): Promise<
  Result<Readonly<{ relativePath: string; facts: AppFacts }>, string>
> => {
  const relativePath = path.relative(
    projectRootPath,
    path.join(appDir, 'index.html'),
  );

  const result = await Result.fromPromise(
    (async () => {
      const [html, publicFiles, firebaseProject] = await Promise.all([
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.join(appDir, 'index.html'), 'utf8'),
        readPublicFiles(path.join(appDir, 'public')),
        readFirebaseProject(appDir),
      ]);

      return {
        head: parseAppHead(html),
        publicFiles,
        pagesUrl: pagesAppDirs().includes(path.basename(appDir))
          ? pagesAppUrl(appDir)
          : undefined,
        firebaseUrl:
          firebaseProject === undefined
            ? undefined
            : `https://${firebaseProject}.web.app/`,
      } satisfies AppFacts;
    })(),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(result.value)}`,
      )
    : Result.ok({ relativePath, facts: result.value });
};

const collectResults = <A,>(
  results: readonly Result<A, string>[],
): Result<readonly A[], string> => {
  const firstError = results.find(Result.isErr);

  return firstError !== undefined
    ? Result.err(firstError.value)
    : Result.ok(
        Arr.generate(function* () {
          for (const result of results) {
            if (!Result.isErr(result)) {
              yield result.value;
            }
          }
        }),
      );
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ A browser app’s <head> names a file that is not there, or is published',
    '   without what a home screen or a link card needs:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'See docs/browser-app-head.md. `pnpm run gen:app-images -- apps/<name>`',
    'draws apple-touch-icon.png and og-image.png from favicon.svg.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkAppHead().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every browser app's <head> names files that exist (${result.value} apps).`,
  );
}
