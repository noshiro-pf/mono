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
import { isDirectlyExecuted, pathExists } from 'ts-repo-utils';
import type { DeepReadonly } from 'ts-type-forge';
import { pagesAppEntries, pagesAppUrl } from '../../configs/pages-apps.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when an app published to GitHub Pages has a `firebase.json` whose
 * `hosting` is anything but the redirect from its old Firebase Hosting site,
 * or has only one of `firebase.json` and `.firebaserc`. Pages serves the app;
 * a Firebase project behind it may hold its backend (Firestore, Auth), and
 * that is not this check's business.
 *
 * The apps that moved from Firebase Hosting to Pages keep their Firebase
 * project for a while, deployed once with this redirect so that links to the
 * old `*.web.app` address still arrive. The two files are there exactly as
 * long as the project is: when the project is deleted, both go. Nothing else
 * reads them, so a redirect pointing at the wrong directory, or a
 * `firebase.json` that serves `build/` again, would otherwise pass every check
 * and be found only by whoever followed an old link.
 *
 * Deploy with `pnpm dlx firebase-tools deploy --only hosting` from the app's
 * directory. `public` is only there because Hosting requires one; the redirect
 * comes before static files, so nothing in it is ever served.
 */
export const checkFirebaseRedirects = async (): Promise<
  Result<number, string>
> => {
  const apps = await Promise.all(
    pagesAppEntries().map(async ([packageDir]) => {
      const appDir = path.resolve(projectRootPath, 'apps', packageDir);

      const firebaseJsonPath = path.resolve(appDir, 'firebase.json');

      return {
        packageDir,
        pagesUrl: pagesAppUrl(appDir),
        firebaseJson: (await pathExists(firebaseJsonPath))
          ? // eslint-disable-next-line security/detect-non-literal-fs-filename
            await fs.readFile(firebaseJsonPath, 'utf8')
          : undefined,
        hasFirebaserc: await pathExists(path.resolve(appDir, '.firebaserc')),
      };
    }),
  );

  const violations = findRedirectViolations(apps);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} app(s) on GitHub Pages have Firebase files that are not the redirect from their old site:`,
        '',
        ...violations.map((v) => `  ${v}`),
        '',
        'Pages serves these apps. A Firebase project behind one may hold its',
        'backend, and may host only the redirect from its old address; when a',
        'project is deleted, firebase.json and .firebaserc go with it.',
      ].join('\n'),
    );
  }

  return Result.ok(
    apps.filter(
      ({ firebaseJson }) =>
        firebaseJson !== undefined && hostingOf(firebaseJson) !== undefined,
    ).length,
  );
};

/** The one `firebase.json` an app on Pages may have. */
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

/** A line for each app whose Firebase files are not the redirect. */
export const findRedirectViolations = (
  apps: readonly Readonly<{
    packageDir: string;
    pagesUrl: string;
    firebaseJson: string | undefined;
    hasFirebaserc: boolean;
  }>[],
): readonly string[] =>
  apps.flatMap(({ packageDir, pagesUrl, firebaseJson, hasFirebaserc }) => {
    const dir = `apps/${packageDir}` as const;

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

    const expected = redirectConfig(pagesUrl).hosting;

    return fastDeepEqual(hosting, expected)
      ? []
      : [
          `${dir}/firebase.json hosts something other than the redirect to ${pagesUrl}. Expected "hosting": ${JSON.stringify(expected)}`,
        ];
  });

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
    `${result.value} app(s) on GitHub Pages still redirect from Firebase Hosting, each to its own page.`,
  );
}
