import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  fastDeepEqual,
  hasKey,
  isRecord,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted, pathExists } from 'ts-repo-utils';
import type { DeepReadonly } from 'ts-type-forge';
import {
  PAGES_SITE_ORIGIN,
  PAGES_SITE_ROOT,
  PAGES_SLIDES_DIR,
  pagesAppDirs,
  pagesAppUrl,
} from '../../configs/pages-apps.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when something served from the GitHub Pages site — an app, or a slide
 * deck under `docs/reveal-slides/` — has a `firebase.json` whose `hosting` is
 * anything but the redirect from its old Firebase Hosting site, or has only
 * one of `firebase.json` and `.firebaserc`. Pages serves these; a Firebase
 * project behind one may hold its backend (Firestore, Auth), and that is not
 * this check's business.
 *
 * What moved from Firebase Hosting to Pages keeps its Firebase project for a
 * while, deployed once with this redirect so that links to the old `*.web.app`
 * address still arrive. The two files are there exactly as long as the project
 * is: when the project is deleted, both go. Nothing else reads them, so a
 * redirect pointing at the wrong directory, or a `firebase.json` that serves
 * the site again, would otherwise pass every check and be found only by
 * whoever followed an old link.
 *
 * Deploy with `pnpm dlx firebase-tools deploy --only hosting` from the
 * directory holding the two files. `public` is only there because Hosting
 * requires one; the redirect comes before static files, so nothing in it is
 * ever served.
 */
export const checkFirebaseRedirects = async (): Promise<
  Result<number, string>
> => {
  const sites = await Promise.all(
    [...appSites(), ...(await slideDeckSites())].map(
      async ({ dir, pagesUrl }) => {
        const firebaseJsonPath = path.resolve(
          projectRootPath,
          dir,
          'firebase.json',
        );

        return {
          dir,
          pagesUrl,
          firebaseJson: (await pathExists(firebaseJsonPath))
            ? // eslint-disable-next-line security/detect-non-literal-fs-filename
              await fs.readFile(firebaseJsonPath, 'utf8')
            : undefined,
          hasFirebaserc: await pathExists(
            path.resolve(projectRootPath, dir, '.firebaserc'),
          ),
        };
      },
    ),
  );

  const violations = findRedirectViolations(sites);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} site(s) on GitHub Pages have Firebase files that are not the redirect from their old address:`,
        '',
        ...violations.map((v) => `  ${v}`),
        '',
        'Pages serves these. A Firebase project behind one may hold its',
        'backend, and may host only the redirect from its old address; when a',
        'project is deleted, firebase.json and .firebaserc go with it.',
      ].join('\n'),
    );
  }

  return Result.ok(
    sites.filter(
      ({ firebaseJson }) =>
        firebaseJson !== undefined && hostingOf(firebaseJson) !== undefined,
    ).length,
  );
};

/** Where a deck under `docs/reveal-slides/` is served on Pages. */
export const slideDeckUrl = (deck: string): string =>
  `${PAGES_SITE_ORIGIN}${PAGES_SITE_ROOT}${PAGES_SLIDES_DIR}/${deck}/` as const;

/**
 * The one `firebase.json` an app on Pages may have. Elsewhere `public` may
 * name another directory, as long as it exists.
 */
export const redirectConfig = (
  pagesUrl: string,
): DeepReadonly<{
  hosting: {
    public: string;
    redirects: { regex: string; destination: string; type: number }[];
  };
}> =>
  ({
    hosting: {
      public: 'public',
      redirects: [
        {
          regex: '^/(.*)$',
          destination: `${pagesUrl}:1`,
          type: 301,
        },
      ],
    },
  }) as const;

/** A line for each site whose Firebase files are not the redirect. */
export const findRedirectViolations = (
  sites: readonly Readonly<{
    /** The directory holding the files, relative to the repository root. */
    dir: string;
    pagesUrl: string;
    firebaseJson: string | undefined;
    hasFirebaserc: boolean;
  }>[],
): readonly string[] =>
  sites.flatMap(({ dir, pagesUrl, firebaseJson, hasFirebaserc }) => {
    if (firebaseJson === undefined) {
      return hasFirebaserc
        ? [`${dir}/.firebaserc has no firebase.json beside it.`]
        : [];
    }

    if (!hasFirebaserc) {
      return [`${dir}/firebase.json has no .firebaserc beside it.`];
    }

    const hosting = hostingOf(firebaseJson);

    // A Firebase backend (Firestore, Auth) is not a site; only `hosting` is.
    if (hosting === undefined) {
      return [];
    }

    const [catchAll] = redirectConfig(pagesUrl).hosting.redirects;

    return isRedirectOnly(hosting, pagesUrl)
      ? []
      : [
          `${dir}/firebase.json hosts something other than redirects into ${pagesUrl}. Expected "hosting" with "public", optionally "site", and "redirects" of 301s into that page ending in ${JSON.stringify(catchAll)}.`,
        ];
  });

type Site = Readonly<{ dir: string; pagesUrl: string }>;

const appSites = (): readonly Site[] =>
  pagesAppDirs().map((packageDir) => ({
    dir: `apps/${packageDir}`,
    pagesUrl: pagesAppUrl(path.resolve(projectRootPath, 'apps', packageDir)),
  }));

/** Every directory under `docs/reveal-slides/` holding a deck's `index.html`. */
const slideDeckSites = async (): Promise<readonly Site[]> => {
  const listed = await glob('docs/reveal-slides/*/index.html', {
    cwd: projectRootPath,
  });

  if (Result.isErr(listed)) {
    throw new Error(unknownToString(listed.value));
  }

  return listed.value.toSorted().map((indexHtml) => {
    const dir = path.dirname(indexHtml);

    return { dir, pagesUrl: slideDeckUrl(path.basename(dir)) };
  });
};

/**
 * Whether `hosting` does nothing but redirect into `pagesUrl`.
 *
 * Rules for old paths whose shape changed (`/rooms/<id>/` →
 * `/rooms/?id=<id>`) may come first, as long as each is a 301 into the same
 * page; the last is always the catch-all that keeps the path. `public` only
 * has to name a directory that exists, which a deploy checks, and `site` picks
 * the project's Hosting site; neither serves anything, as redirects come
 * before files.
 */
const isRedirectOnly = (hosting: unknown, pagesUrl: string): boolean => {
  if (
    !isRecord(hosting) ||
    Object.keys(hosting).some((key) => !hostingKeys.has(key)) ||
    typeof hosting['public'] !== 'string' ||
    !(hosting['site'] === undefined || typeof hosting['site'] === 'string')
  ) {
    return false;
  }

  const redirects = hosting['redirects'];

  if (!Arr.isArray(redirects) || !Arr.isNonEmpty(redirects)) {
    return false;
  }

  const [catchAll] = redirectConfig(pagesUrl).hosting.redirects;

  return (
    fastDeepEqual(redirects.at(-1), catchAll) &&
    redirects.every(
      (rule) =>
        isRecord(rule) &&
        rule['type'] === 301 &&
        typeof rule['destination'] === 'string' &&
        rule['destination'].startsWith(pagesUrl) &&
        Object.keys(rule).every((key) => ruleKeys.has(key)),
    )
  );
};

const hostingKeys: ReadonlySet<string> = new Set<string>([
  'public',
  'site',
  'redirects',
]);

const ruleKeys: ReadonlySet<string> = new Set<string>([
  'source',
  'regex',
  'destination',
  'type',
]);

/** The `hosting` of a `firebase.json`, or `undefined` when it hosts nothing. */
const hostingOf = (firebaseJson: string): unknown => {
  const parsed: unknown = JSON.parse(firebaseJson);

  return isRecord(parsed) && hasKey(parsed, 'hosting')
    ? parsed.hosting
    : undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkFirebaseRedirects().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} site(s) on GitHub Pages still redirect from Firebase Hosting, each to its own page.`,
  );
}
