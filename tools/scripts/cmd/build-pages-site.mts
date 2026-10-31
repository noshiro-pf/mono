import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted, pathExists } from 'ts-repo-utils';
import {
  PAGES_SLIDES_DIR,
  pagesAppDirs,
  pagesAstroSites,
} from '../../configs/pages-apps.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Collects everything this repository publishes as a website into one
 * directory, laid out the way GitHub Pages will serve it.
 *
 * Until now each library's documentation was built and served by its own
 * repository. Those are archived: the pages still answer, but nothing rebuilds
 * them, so the documentation has been frozen since the consolidation. This
 * gathers them under `noshiro-pf.github.io/mono/` instead.
 *
 * ```text
 * _site/
 *   index.html            a list of what is here
 *   synstate/             the hand-written documentation site (Astro)
 *   synstate-dom/         the same, for synstate-dom
 *   pr-manager/           the Pull Requests Manager app (Vite), and one
 *   …                     directory for each other app in `pages-apps.mts`
 *   slides/               the reveal.js decks in `docs/reveal-slides/`,
 *                         and the Marp decks in `docs/marp-slides/`
 *   ts-data-forge/        TypeDoc output
 *   …
 * ```
 *
 * Reads what each package has already produced — `pnpm run ws:build`,
 * `pnpm run ws:doc`, the Astro builds and `pnpm run build:marp-slides` have to
 * run first — and only copies.
 *
 * An app's directory here and the `base` its bundle was built with have to
 * agree, or the page loads and then asks for its script at a path nothing
 * serves. Both are the app's directory under `apps/`, as listed in
 * `tools/configs/pages-apps.mts`.
 */
export const buildPagesSite = async (): Promise<Result<number, string>> => {
  const outDir = path.resolve(projectRootPath, '_site');

  await fs.rm(outDir, { recursive: true, force: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(outDir, { recursive: true });

  const mut_published: { name: string; from: string }[] = [];

  for (const pkg of await typedocPackages()) {
    const docsDir = path.resolve(projectRootPath, 'libs', pkg, 'docs');

    if (!(await pathExists(path.resolve(docsDir, 'index.html')))) {
      return Result.err(
        [
          `${pkg} has no built documentation at ${docsDir}/index.html.`,
          'Run `pnpm run ws:build && pnpm run ws:doc` first.',
        ].join('\n'),
      );
    }

    await fs.cp(docsDir, path.resolve(outDir, pkg), { recursive: true });

    mut_published.push({ name: pkg, from: 'TypeDoc' });
  }

  for (const { packageDir, siteDir, buildCommand } of pagesAstroSites) {
    const astroDist = path.resolve(projectRootPath, 'apps', packageDir, 'dist');

    if (!(await pathExists(astroDist))) {
      return Result.err(
        [
          `The documentation site has not been built at ${astroDist}.`,
          `Run \`${buildCommand}\` first.`,
        ].join('\n'),
      );
    }

    await fs.cp(astroDist, path.resolve(outDir, siteDir), {
      recursive: true,
    });

    mut_published.push({ name: siteDir, from: 'Astro' });
  }

  for (const appDir of pagesAppDirs()) {
    const appBuild = path.resolve(projectRootPath, 'apps', appDir, 'build');

    if (!(await pathExists(path.resolve(appBuild, 'index.html')))) {
      return Result.err(
        [
          `${appDir} has no built app at ${appBuild}/index.html.`,
          'Run `pnpm run ws:build` first.',
        ].join('\n'),
      );
    }

    await fs.cp(appBuild, path.resolve(outDir, appDir), { recursive: true });

    mut_published.push({ name: appDir, from: 'app' });
  }

  const slidesOut = path.resolve(outDir, PAGES_SLIDES_DIR);

  // A reveal.js deck and a Marp deck land side by side; one name for two
  // decks would have the second silently overwrite the first.
  const mut_deckDirs = new Set<string>();

  // The reveal.js decks are copied as they are: each loads reveal.js from the
  // CDN and needs no build. The Firebase files are the redirect from a deck's
  // old address, and the README and the cspell config are for whoever edits
  // the decks; none of them belongs on the site.
  const revealSource = path.resolve(projectRootPath, 'docs/reveal-slides');

  await fs.cp(revealSource, slidesOut, {
    recursive: true,
    filter: (source) => !notPublishedSlideFiles.has(path.basename(source)),
  });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  for (const entry of await fs.readdir(revealSource, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    mut_deckDirs.add(entry.name);

    mut_published.push({
      name: `${PAGES_SLIDES_DIR}/${entry.name}`,
      from: 'reveal.js',
    });
  }

  // A Marp deck is one self-contained `slides.html`, rendered beside its
  // `slides.md` by `build:marp-slides` and served as its directory's page.
  // A deck directory with no `slides.md` yet (an outline only) is skipped.
  const marpSource = path.resolve(projectRootPath, 'docs/marp-slides');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  for (const entry of await fs.readdir(marpSource, { withFileTypes: true })) {
    const deckSource = path.resolve(marpSource, entry.name);

    if (
      !entry.isDirectory() ||
      !(await pathExists(path.resolve(deckSource, 'slides.md')))
    ) {
      continue;
    }

    const rendered = path.resolve(deckSource, 'slides.html');

    if (!(await pathExists(rendered))) {
      return Result.err(
        [
          `${entry.name} has no rendered deck at ${rendered}.`,
          'Run `pnpm run build:marp-slides` first.',
        ].join('\n'),
      );
    }

    const deckDir = entry.name.replace(/-slides$/u, '');

    if (mut_deckDirs.has(deckDir)) {
      return Result.err(
        `Two decks would be served from ${PAGES_SLIDES_DIR}/${deckDir}/; rename one.`,
      );
    }

    mut_deckDirs.add(deckDir);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path.resolve(slidesOut, deckDir), { recursive: true });

    await fs.copyFile(rendered, path.resolve(slidesOut, deckDir, 'index.html'));

    mut_published.push({
      name: `${PAGES_SLIDES_DIR}/${deckDir}`,
      from: 'Marp',
    });
  }

  const indexPath = path.resolve(outDir, 'index.html');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(indexPath, indexHtml(mut_published));

  return Result.ok(mut_published.length);
};

/** What `docs/reveal-slides/` holds besides the decks and their assets. */
const notPublishedSlideFiles: ReadonlySet<string> = new Set<string>([
  'firebase.json',
  '.firebaserc',
  'README.md',
  'cspell.config.yaml',
]);

/** The packages that build TypeDoc output, found rather than listed. */
const typedocPackages = async (): Promise<readonly string[]> => {
  const libsDir = path.resolve(projectRootPath, 'libs');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs.readdir(libsDir, { withFileTypes: true });

  const mut_found: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const hasTypedoc = await pathExists(
      path.resolve(libsDir, entry.name, 'configs/typedoc.config.mjs'),
    );

    if (hasTypedoc) {
      mut_found.push(entry.name);
    }
  }

  return mut_found.toSorted((a, b) => a.localeCompare(b));
};

const indexHtml = (
  published: readonly Readonly<{ name: string; from: string }>[],
): string =>
  [
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '    <title>noshiro-pf/mono</title>',
    '    <style>',
    '      body { font-family: system-ui, sans-serif; margin: 0 auto; max-width: 40rem; padding: 2rem 1rem; line-height: 1.6; }',
    '      li { margin: 0.25rem 0; }',
    '      .from { color: #666; font-size: 0.85em; }',
    '    </style>',
    '  </head>',
    '  <body>',
    '    <h1>noshiro-pf/mono</h1>',
    '    <p>Documentation for the packages this repository publishes, and the',
    '      applications it hosts here.</p>',
    '    <ul>',
    ...published.map(
      ({ name, from }) =>
        `      <li><a href="./${name}/">${name}</a> <span class="from">${from}</span></li>`,
    ),
    '    </ul>',
    '    <p><a href="https://github.com/noshiro-pf/mono">Source on GitHub</a></p>',
    '  </body>',
    '</html>',
    '',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await buildPagesSite().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(`Assembled ${result.value} site(s) into _site/.`);
}
