#!/usr/bin/env tsx

/**
 * Creates a single changeset that bumps the per-version source packages
 * (optionally restricted to a subset of TypeScript versions) at once.
 *
 * This repo publishes one package per TypeScript version, generated at
 * `packages/vX.Y/output/lib` with both flavors inside it. Neither the
 * declarations nor the manifest are pnpm workspace members, so
 * `changeset version` cannot bump them directly. Instead, each version's single source
 * harness package `strict-ts-lib-vX.Y-source` (`packages/vX.Y/package.json`, a
 * private workspace member) is the version carrier: `ws:gen` stamps its version
 * onto every generated sub-package of that version. So the changeset targets
 * those `-source` packages — `changeset version` bumps them (private, so it
 * does not publish them), and the next `ws:gen` propagates the new version.
 * Targeting the generated names instead would be lost on regeneration, because
 * they are re-stamped from the (unbumped) `-source` version.
 *
 * Usage:
 *   tsx scripts/cmd/create-changeset.mts <major|minor|patch> [summary...] [--version=<range>] [--dry-run]
 *
 * `--version` selects which TypeScript versions to release. Its value is a
 * `&`-separated list of terms (all must hold). A term is a version (`5`, `5.9`,
 * `v5.9`) optionally prefixed by a comparator (`>=`, `<=`, `>`, `<`, `=`):
 *   --version=5             only v5.x (major 5, any minor)
 *   --version=5.9           only v5.9
 *   --version=">=5.3&<=5.5" only v5.3 .. v5.5
 *   --version=">=5.7"       only v5.7 and newer
 * A bare major (`5`) matches the whole major line; a comparator on a bare major
 * (`>=5`) compares at the major level. Omit `--version` to release everything.
 *
 * Examples:
 *   pnpm changeset:all minor "Regenerate lib for TypeScript 5.9"
 *   pnpm changeset:all patch --version=5.9
 *   pnpm changeset:all minor --version=">=5.3&<=5.5"
 */

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import {
  parseVersionExpr,
  versionFromPath,
  type Version,
} from '../version-filter.mjs';

const BUMP_TYPES = ['major', 'minor', 'patch'] as const;

type BumpType = (typeof BUMP_TYPES)[number];

const changesetDir = path.join(projectRootPath, '.changeset');

// The version directories sit directly under `strict-lib/`; the readdir
// below keeps only `vX.Y`, so `scripts/`, `configs/` and friends are
// filtered out by name rather than by living somewhere else.
const packagesDir = projectRootPath;

const usage =
  'Usage: tsx scripts/cmd/create-changeset.mts <major|minor|patch> [summary...] [--version=<range>] [--dry-run]';

const isBumpType = (value: string): value is BumpType =>
  (BUMP_TYPES as readonly string[]).includes(value);

/** The subset of `package.json` fields this script reads. */
const packageJsonType = t.record({
  name: t.optional(t.string()),
  private: t.optional(t.boolean()),
});

type PackageJson = t.TypeOf<typeof packageJsonType>;

/** The subset of `.changeset/config.json` this script reads. */
const changesetConfigType = t.record({
  ignore: t.optional(t.array(t.string())),
});

/** Reads a `--name=value` flag from the argument list. */
const getFlagValue = (
  args: readonly string[],
  name: string,
): string | undefined =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const parsePackageJson = (text: string): PackageJson | undefined => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) return undefined;

  const result = packageJsonType.validate(parsed.value);

  return Result.isOk(result) ? result.value : undefined;
};

/**
 * Reads a version harness `package.json` (e.g. `packages/v5.9/package.json`)
 * and returns its `name` (`strict-ts-lib-vX.Y-source`). These are private
 * workspace members and the version carriers, so `changeset version` bumps
 * their version — the value `ws:gen` stamps onto every generated sub-package —
 * without publishing them.
 */
const readSourcePackageName = async (
  packageJsonPath: string,
): Promise<string | undefined> =>
  parsePackageJson(await fs.readFile(packageJsonPath, 'utf8'))?.name;

/** Package names to skip, from `.changeset/config.json`'s `ignore` field. */
const readIgnoredNames = async (): Promise<ReadonlySet<string>> => {
  const parsed = Json.parse(
    await fs.readFile(path.join(changesetDir, 'config.json'), 'utf8'),
  );

  if (Result.isErr(parsed)) return new Set<string>();

  const result = changesetConfigType.validate(parsed.value);

  return new Set(Result.isOk(result) ? (result.value.ignore ?? []) : []);
};

const main = async (): Promise<void> => {
  const args = Arr.skip(process.argv, 2);

  const dryRun = args.includes('--dry-run');

  const [bumpArg, ...summaryParts] = args.filter((a) => !a.startsWith('--'));

  if (bumpArg === undefined || !isBumpType(bumpArg)) {
    console.error(usage);

    process.exit(1);
  }

  const versionExpr = getFlagValue(args, 'version');

  const versionPredicate =
    versionExpr === undefined ? undefined : parseVersionExpr(versionExpr);

  if (versionExpr !== undefined && versionPredicate === undefined) {
    console.error(
      `Invalid --version="${versionExpr}" (examples: 5, 5.9, ">=5.3&<=5.5").`,
    );

    process.exit(1);
  }

  const matchesVersion = (v: Version | undefined): boolean =>
    versionPredicate === undefined
      ? true
      : v !== undefined && versionPredicate(v);

  const scopeLabel = versionExpr ?? 'all';

  const summary = Arr.isNonEmpty(summaryParts)
    ? summaryParts.join(' ')
    : (`Bump ${scopeLabel === 'all' ? 'all packages' : `packages matching "${scopeLabel}"`} (${bumpArg}).` as const);

  // Only the per-version source packages (`packages/vX.Y/package.json`), which
  // are the workspace members `changeset version` can bump.
  const globbed = await glob(path.join(packagesDir, 'v*', 'package.json'), {
    ignore: ['**/node_modules/**'],
  });

  if (Result.isErr(globbed)) {
    console.error(globbed.value);

    process.exit(1);
  }

  const ignored = await readIgnoredNames();

  const scopedPaths = globbed.value.filter(
    (p) =>
      !p.includes(`${path.sep}node_modules${path.sep}`) &&
      matchesVersion(versionFromPath(p)),
  );

  const resolved = await Promise.all(scopedPaths.map(readSourcePackageName));

  const names = resolved
    .filter((n): n is string => n !== undefined)
    .filter((n) => !ignored.has(n))
    .toSorted((a, b) => a.localeCompare(b));

  if (Arr.isEmpty(names)) {
    console.error(
      `No source packages matched (scope: ${scopeLabel}). Check --version.`,
    );

    process.exit(1);
  }

  if (dryRun) {
    console.info(
      `[dry-run] would bump ${names.length} source package(s) (${bumpArg}, scope: ${scopeLabel}):\n  ${Arr.take(names, 5).join('\n  ')}`,
    );

    return;
  }

  const frontmatter = names.map((n) => `'${n}': ${bumpArg}`).join('\n');

  const content = `---\n${frontmatter}\n---\n\n${summary}\n` as const;

  const scopeSlug =
    scopeLabel === 'all'
      ? 'all'
      : scopeLabel.replaceAll(/[^a-z0-9]+/giu, '-').replaceAll(/^-+|-+$/gu, '');

  const filePath = path.join(
    changesetDir,
    `bump-${scopeSlug}-${bumpArg}-${randomUUID().slice(0, 8)}.md`,
  );

  await fs.writeFile(filePath, content, 'utf8');

  console.info(
    `Wrote ${path.relative(projectRootPath, filePath)} bumping ${names.length} source package(s) (${bumpArg}, scope: ${scopeLabel}).`,
  );
};

await main();
