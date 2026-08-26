#!/usr/bin/env tsx

/**
 * Generates cross-version diffs for each `strict-lib/vX.Y` series, writing them
 * into `strict-lib/vX.Y/output/diff-from-prev/`.
 *
 * For every consecutive version pair `vX.(Y-1)` -> `vX.Y` three sets of diffs are
 * produced:
 *
 * - `official/<name>.diff` — diff between the upstream TypeScript lib files
 *   (`temp/copied/<name>.d.ts`) of the two versions. Shows what changed in
 *   TypeScript itself between the two releases.
 * - `converted/<name>.diff` — diff between the final converted lib files
 *   (`output/lib-files/<name>.d.ts`) of the two versions. Shows what changed in
 *   this repo's generated output between the two releases.
 * - `converted-branded/<name>.diff` — same as `converted` but for the branded
 *   output (`output/lib-files-branded/<name>.d.ts`), where the per-method
 *   number-branding transforms live. A new upstream API that the conversion
 *   script doesn't know about shows up here as a raw `number` standing out
 *   against its branded siblings — the clearest omission signal.
 *
 * Comparing the two side by side reveals whether the conversion script handled
 * every upstream change: an upstream change that has no corresponding change in
 * the converted output (or vice versa) is a signal that a version-specific
 * transform may be missing.
 *
 * Only files that actually differ are written; identical files are skipped. A
 * `summary.txt` per version lists the changed files for quick review.
 *
 * Prerequisite: every `vX.Y` series must have been generated already (so that
 * both `temp/copied` and `output/lib-files` are populated). Run `pnpm ws:gen`
 * first if unsure.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { $, makeEmptyDir, pathExists } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

// The version directories sit directly under `strict-lib/`; the readdir
// below keeps only `vX.Y`, so `scripts/`, `configs/` and friends are
// filtered out by name rather than by living somewhere else.
const packagesDir = projectRootPath;

/** Subdirectory of a package holding the files to compare, per diff kind. */
const diffKinds = [
  { name: 'official', subDir: path.join('temp', 'copied') },
  { name: 'converted', subDir: path.join('output', 'lib-files') },
  {
    name: 'converted-branded',
    subDir: path.join('output', 'lib-files-branded'),
  },
] as const;

const outputDirName = path.join('output', 'diff-from-prev');

type Version = Readonly<{ dir: string; major: number; minor: number }>;

const discoverVersions = async (): Promise<readonly Version[]> => {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => /^v(\d+)\.(\d+)$/u.exec(e.name))
    .filter((m) => m !== null)
    .map((m) => ({
      dir: m[0],
      major: Number(m[1]),
      minor: Number(m[2]),
    }))
    .toSorted((a, b) => {
      const byMajor = a.major - b.major;

      return byMajor === 0 ? a.minor - b.minor : byMajor;
    });
};

/** Lists `*.d.ts` basenames (without extension) in a directory, sorted. */
const listDtsNames = async (dir: string): Promise<readonly string[]> => {
  if (!(await pathExists(dir))) {
    return [];
  }

  const files = await fs.readdir(dir);

  return files
    .filter((f) => f.endsWith('.d.ts'))
    .map((f) => f.slice(0, -'.d.ts'.length))
    .toSorted((a, b) => a.localeCompare(b));
};

/**
 * Runs `git diff --no-index` between two files (repo-relative paths), returning
 * the diff text (empty string when identical). A missing side is compared
 * against `/dev/null` so added/removed files render as full add/remove diffs.
 */
const gitDiff = async (
  left: string = '/dev/null',
  right: string = '/dev/null',
): Promise<string> => {
  // `git diff` exits 1 when there are differences; `|| true` keeps the diff on
  // stdout instead of turning the non-zero exit into a Result.err.
  const result = await $(
    `git diff --no-index --no-color -- "${left}" "${right}" || true`,
    {
      cwd: projectRootPath,
      maxBuffer: 100 * 1024 * 1024, // 100MB
      silent: true,
    },
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    return '';
  }

  return result.value.stdout;
};

const genDiffForKind = async (
  prev: Version,
  cur: Version,
  kind: (typeof diffKinds)[number],
): Promise<readonly string[]> => {
  const prevDir = path.join(packagesDir, prev.dir, kind.subDir);

  const curDir = path.join(packagesDir, cur.dir, kind.subDir);

  const prevNames = await listDtsNames(prevDir);

  const curNames = await listDtsNames(curDir);

  // A plain-array spread keeps the element type as `string`; `Iterator.concat`
  // resolves to `Iterator<unknown>` in this toolchain, which would poison the
  // downstream `Set`/`names` types.
  // eslint-disable-next-line unicorn/prefer-iterator-concat
  const names = Array.from(new Set([...prevNames, ...curNames])).toSorted(
    (a, b) => a.localeCompare(b),
  );

  const outDir = path.join(packagesDir, cur.dir, outputDirName, kind.name);

  await makeEmptyDir(outDir);

  const mut_changed: string[] = [] as const;

  for (const name of names) {
    const prevFile = path.join(prevDir, `${name}.d.ts`);

    const curFile = path.join(curDir, `${name}.d.ts`);

    const prevRel = (await pathExists(prevFile))
      ? path.relative(projectRootPath, prevFile)
      : undefined;

    const curRel = (await pathExists(curFile))
      ? path.relative(projectRootPath, curFile)
      : undefined;

    const diff = await gitDiff(prevRel, curRel);

    if (diff.trim() === '') {
      continue;
    }

    mut_changed.push(name);

    await fs.writeFile(path.join(outDir, `${name}.diff`), diff);
  }

  return mut_changed;
};

const main = async (): Promise<void> => {
  const versions = await discoverVersions();

  console.info(`Found versions: ${versions.map((v) => v.dir).join(', ')}`);

  // Adjacent (prev, cur) version pairs, e.g. v5.0->v5.1, v5.1->v5.2, ...
  const pairs = Arr.tail(versions).map((cur, idx) => ({
    prev: versions[idx],
    cur,
  }));

  for (const { prev, cur } of pairs) {
    if (prev === undefined) {
      continue;
    }

    console.info(`\n=== ${prev.dir} -> ${cur.dir} ===`);

    const mut_summaryLines: string[] = [
      `Cross-version diff: ${prev.dir} -> ${cur.dir}`,
      '',
    ] as const;

    for (const kind of diffKinds) {
      const changed = await genDiffForKind(prev, cur, kind);

      console.info(`  ${kind.name}: ${changed.length} changed file(s)`);

      mut_summaryLines.push(
        `[${kind.name}] (${kind.subDir}) — ${changed.length} changed file(s):`,
        ...changed.map((name) => `  ${name}.d.ts`),
        '',
      );
    }

    await fs.writeFile(
      path.join(packagesDir, cur.dir, outputDirName, 'summary.txt'),
      mut_summaryLines.join('\n'),
    );
  }

  console.info('\nDone.');
};

await main();
