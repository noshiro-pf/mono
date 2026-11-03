#!/usr/bin/env tsx

// cspell:ignore EOTP

/**
 * Publishes the bundle packages to the **npm registry** by hand — the root
 * `strict-lib:publish` script.
 *
 * `release.yml` does not run this: it publishes the bundles with `changeset
 * publish`, like every other package. This is for what CI cannot do — a new
 * series' first publish, which has to exist on npm before its trusted
 * publisher can be configured (`docs/first-release.md`) — and for packing a
 * bundle to inspect it before it goes out.
 *
 * Requires an authenticated `npm` (`npm whoami`).
 *
 * Usage:
 *   pnpm run strict-lib:publish -- [--version=<range>] [--publish]
 *     [--tag=<dist-tag>] [--otp=<code>] [--pack-only [--out-dir=<dir>]]
 *
 * Dry-run unless `--publish` is passed. `--version` limits which series are
 * published (`5`, `5.9`, `">=5.3&<=5.5"`). `--tag` sets the dist-tag; without
 * it npm moves `latest`, which is only right for the newest TypeScript series;
 * publish an older series as e.g. `--tag=v5.9`.
 *
 * **Two-factor authentication.** Commands here run through `child_process.exec`,
 * which gives them no TTY, so npm cannot fall back to its interactive
 * one-time-password flow: with 2FA on writes the publish fails outright with
 * `EOTP`. Two ways through, both documented in `docs/first-release.md`:
 *
 * - `--otp=<code>` — a code from the authenticator app. npm treats the presence
 *   of `otp` as `auth-type=legacy`, so it never tries the browser flow. A code
 *   lasts ~30 seconds, which covers one series comfortably; for a wider
 *   `--version` range, publish series by series with a fresh code.
 * - `--pack-only` — stage and pack the tarballs, then stop, printing the
 *   `npm publish` line to run yourself in a real terminal, where npm can prompt
 *   (or open the browser) as usual. This is also the way to inspect a tarball
 *   before it goes out.
 *
 * **Re-runs are safe.** A version already on the registry is skipped rather
 * than re-published, because npm refuses to overwrite one (`EPUBLISHCONFLICT`),
 * so a run that stopped on an expired code can be repeated with a fresh one.
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';
import { collectBundle, packBundle } from '../pack-bundle.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { parseVersionExpr, versionFromPath } from '../version-filter.mjs';

// The version directories sit directly under `strict-lib/`; the readdir below
// keeps only `vX.Y`, so `scripts/`, `configs/` and friends are filtered out by
// name rather than by living somewhere else.
const packagesDir = projectRootPath;

const main = async (): Promise<void> => {
  const args = Arr.skip(process.argv, 2);

  const publish = args.includes('--publish');

  const packOnly = args.includes('--pack-only');

  const distTag = getFlagValue(args, 'tag');

  const otp = getFlagValue(args, 'otp');

  const outDir = path.resolve(
    getFlagValue(args, 'out-dir') ?? path.join(projectRootPath, 'npm-tarballs'),
  );

  const versionExpr = getFlagValue(args, 'version');

  const versionPredicate =
    versionExpr === undefined ? undefined : parseVersionExpr(versionExpr);

  if (versionExpr !== undefined && versionPredicate === undefined) {
    console.error(
      `Invalid --version="${versionExpr}" (examples: 5, 5.9, ">=5.3&<=5.5").`,
    );

    process.exit(1);
  }

  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  const versionNames = entries
    .filter((e) => e.isDirectory() && /^v\d+\.\d+$/u.test(e.name))
    .map((e) => e.name)
    .filter((name) => {
      const v = versionFromPath(`${path.sep}${name}${path.sep}`);

      return (
        versionPredicate === undefined ||
        (v !== undefined && versionPredicate(v))
      );
    })
    .toSorted((a, b) => a.localeCompare(b));

  if (!Arr.isNonEmpty(versionNames)) {
    console.error(
      versionExpr === undefined
        ? 'No version directories found.'
        : `No versions matched --version="${versionExpr}".`,
    );

    process.exit(1);
  }

  // Sequentially, so that a rate limit shows up as "the Nth publish failed"
  // rather than as a burst of simultaneous failures.
  const failures = await versionNames.reduce<Promise<readonly string[]>>(
    async (prev, name) => {
      const acc = await prev;

      const err = await publishVersion(name, {
        publish,
        packOnly,
        distTag,
        otp,
        outDir,
      });

      return err === undefined ? acc : Arr.toPushed(acc, err);
    },
    Promise.resolve([]),
  );

  if (Arr.isNonEmpty(failures)) {
    console.error(`\n${failures.length} version(s) failed:`);

    for (const f of failures) {
      console.error(`  ${f}`);
    }

    process.exit(1);
  }

  if (packOnly) {
    console.info(
      [
        '',
        `Tarballs written to ${outDir}.`,
        '',
        'Publish them from a terminal npm can prompt in:',
        '',
        `  npm publish ${path.join(outDir, '<package>-<version>.tgz')} --access public${distTag === undefined ? '' : ` --tag ${distTag}`}`,
        '',
      ].join('\n'),
    );

    return;
  }

  console.info(
    publish
      ? '\nThe registry has every bundle this checkout produces. ✅'
      : '\n[dry-run] done (pass --publish to publish).',
  );
};

/** What one run does with each bundle it stages. */
type PublishOptions = Readonly<{
  publish: boolean;
  packOnly: boolean;
  distTag: string | undefined;
  otp: string | undefined;
  outDir: string;
}>;

/** Reads a `--name=value` flag from the argument list. */
const getFlagValue = (
  args: readonly string[],
  name: string,
): string | undefined =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

/**
 * Whether this exact version is on the registry already.
 *
 * `npm view <name>@<version> version` exits non-zero for a package that does
 * not exist and prints nothing for a version that does not, so both cases read
 * as "not published" — which is the safe direction: at worst the publish runs
 * and npm rejects it.
 */
const isAlreadyPublished = async (
  name: string,
  version: string,
): Promise<boolean> => {
  const result = await $(`npm view ${name}@${version} version`, {
    silent: true,
  });

  return Result.isOk(result) && result.value.stdout.trim() !== '';
};

/** Publishes one version's bundles; returns an error message on failure. */
const publishVersion = async (
  versionName: string,
  options: PublishOptions,
): Promise<string | undefined> => {
  const { publish, packOnly, distTag, otp, outDir } = options;

  const bundle = await collectBundle(path.join(packagesDir, versionName));

  if (bundle === undefined) {
    console.info(`${versionName}: no bundle package, skipping.`);

    return undefined;
  }

  // `--pack-only` hands the tarballs to a human, so they outlive the run.
  const destDir = packOnly
    ? outDir
    : await fs.mkdtemp(path.join(os.tmpdir(), `npm-${versionName}-`));

  if (packOnly) {
    await fs.mkdir(destDir, { recursive: true });
  }

  try {
    {
      // Ask the registry before packing, so a repeated run skips what went out.
      if (
        publish &&
        !packOnly &&
        (await isAlreadyPublished(bundle.name, bundle.version))
      ) {
        console.info(
          `  skipped ${bundle.name}@${bundle.version} (already on the registry)`,
        );

        return undefined;
      }

      const packed = await packBundle(bundle, destDir);

      if (Result.isErr(packed)) {
        return `${versionName}: pack failed: ${packed.value}`;
      }

      if (packOnly) {
        console.info(`  packed ${packed.value}`);

        return undefined;
      }

      const flags = [
        '--access public',
        distTag === undefined ? '' : `--tag ${distTag}`,
        otp === undefined ? '' : `--otp ${otp}`,
        publish ? '' : '--dry-run',
      ]
        .filter((flag) => flag !== '')
        .join(' ');

      const result = await $(`npm publish ${packed.value} ${flags}`);

      if (Result.isErr(result)) {
        return `${versionName}: npm publish failed for ${bundle.name}${
          otp === undefined
            ? ' (an EOTP here means 2FA: pass --otp=<code>, or --pack-only and publish by hand)'
            : ' (an EOTP here means the code expired: re-run with a fresh --otp=<code>)'
        }`;
      }

      console.info(
        `  ${publish ? 'published' : 'would publish'} ${bundle.name}@${bundle.version}`,
      );
    }

    return undefined;
  } finally {
    if (!packOnly) {
      await fs.rm(destDir, { recursive: true, force: true });
    }
  }
};

await main();
