import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  PAGES_SITE_ORIGIN,
  PAGES_SITE_ROOT,
  pagesAstroSites,
} from '../../configs/pages-apps.mjs';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when an Astro documentation site's `base` in its `astro.config.mjs` is
 * not the directory `build-pages-site.mts` copies it into, or its `site` is not
 * the Pages origin; and when an `apps/*\/astro.config.*` is not one of
 * `pagesAstroSites` (`tools/configs/pages-apps.mts`).
 *
 * The directory is written twice by hand: as `siteDir` in `pagesAstroSites`,
 * where the built site is copied, and as `base` in the site's config, which
 * Astro bakes into every asset URL and link. When one side changes alone the
 * site builds, deploys and loads its HTML, then asks for its scripts and styles
 * at a path nothing serves — a page with no failing check anywhere. A site added
 * by copying a directory is listed or refused.
 *
 * `base` and `site` are read as string literals each on a line of their own, so
 * a computed one is reported rather than guessed at.
 */
export const checkAstroSiteBase = async (): Promise<Result<number, string>> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const mut_configs: AstroConfig[] = [];

  const mut_missing: string[] = [];

  for (const { packageDir, siteDir } of pagesAstroSites) {
    const relativePath = tracked.value.find(
      (file) =>
        ASTRO_CONFIG.test(file) && file.startsWith(`apps/${packageDir}/`),
    );

    if (relativePath === undefined) {
      mut_missing.push(
        `apps/${packageDir}: pagesAstroSites lists it, and it has no astro.config.* to read.`,
      );

      continue;
    }

    const text = await readRepositoryFile(relativePath);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    mut_configs.push({ relativePath, text: text.value, siteDir });
  }

  const problems = [
    ...mut_missing,
    ...findAstroBaseProblems(mut_configs),
    ...unlistedAstroConfigs(
      tracked.value,
      pagesAstroSites.map(({ packageDir }) => packageDir),
    ).map(
      (file) =>
        `${file}: an Astro site that pagesAstroSites in tools/configs/pages-apps.mts does not list, so build-pages-site.mts never publishes it. List it there, or remove it.`,
    ),
  ] as const;

  return Arr.isNonEmpty(problems)
    ? Result.err(
        [
          `❌ ${problems.length} Astro site(s) are not where build-pages-site.mts puts them:`,
          '',
          ...problems.map((problem) => `  ${problem}`),
          '',
          `Each site's \`base\` is '${PAGES_SITE_ROOT}<siteDir>/' and its \`site\` '${PAGES_SITE_ORIGIN}', as string literals.`,
        ].join('\n'),
      )
    : Result.ok(mut_configs.length);
};

/**
 * A line for each Astro config whose `base` or `site` is not where
 * `build-pages-site.mts` puts the site.
 */
export const findAstroBaseProblems = (
  configs: readonly AstroConfig[],
): readonly string[] =>
  configs.flatMap(({ relativePath, text, siteDir }) => {
    const expectedBase = `${PAGES_SITE_ROOT}${siteDir}/` as const;

    const base = BASE.exec(text)?.groups?.['value'];

    const site = SITE.exec(text)?.groups?.['value'];

    return [
      ...(base === expectedBase
        ? []
        : [
            `${relativePath}: \`base\` is ${describe(base)}, and build-pages-site.mts copies the site to '${expectedBase}'.`,
          ]),
      ...(site === PAGES_SITE_ORIGIN
        ? []
        : [
            `${relativePath}: \`site\` is ${describe(site)}, and the Pages site is served from '${PAGES_SITE_ORIGIN}'.`,
          ]),
    ];
  });

/**
 * The tracked `apps/<dir>/astro.config.*` whose `<dir>` is not among
 * `packageDirs`.
 */
export const unlistedAstroConfigs = (
  trackedFiles: readonly string[],
  packageDirs: readonly string[],
): readonly string[] =>
  trackedFiles.filter(
    (file) =>
      ASTRO_CONFIG.test(file) &&
      !packageDirs.includes(path.posix.basename(path.posix.dirname(file))),
  );

type AstroConfig = Readonly<{
  /** Relative to the repository root. */
  relativePath: string;
  text: string;
  siteDir: string;
}>;

/** An app's Astro config, directly in its package directory. */
const ASTRO_CONFIG = /^apps\/[^/]+\/astro\.config\.[cm]?[jt]s$/u;

const BASE = /^\s*base:\s*(?<quote>['"])(?<value>[^'"\n]*)\k<quote>,?\s*$/mu;

const SITE = /^\s*site:\s*(?<quote>['"])(?<value>[^'"\n]*)\k<quote>,?\s*$/mu;

const describe = (value: string | undefined): string =>
  value === undefined
    ? 'not a string literal on its own line'
    : (`'${value}'` as const);

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkAstroSiteBase().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} Astro site(s) read; each one's base is the directory build-pages-site.mts copies it to.`,
  );
}
