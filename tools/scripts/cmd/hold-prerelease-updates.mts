import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, isRecord, isString, Obj, Optional } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { parse as parseYaml } from 'yaml';
import {
  closingStdin,
  describeFailure,
  runInherited,
} from '../lib/child-process.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  compareVersions,
  describeHold,
  parseStableVersion,
  readMinimumReleaseAge,
  readRegistryMetadata,
  selectMatureVersion,
  type RegistryMetadata,
} from './mature-updates.mjs';

/**
 * Puts back every range `pnpm update --latest` moved from a stable release to a
 * prerelease. `pnpm-update.yml` runs it right after `update-packages`; run it
 * after that script by hand too.
 *
 * `--latest` means the `latest` dist-tag. When that version is younger than
 * `minimumReleaseAge` and no stable release of its major is old enough, pnpm
 * falls back to a **prerelease of that major** before an older major — on
 * purpose since pnpm/pnpm#16407 (measured, pnpm 12.15 and 12.18: `^5.10.0`
 * became `^6.0.0-beta.6` while 6.0.0 and 6.0.1 were inside the hold). Neither
 * `pnpm update` nor any setting offers a way to keep it to stable releases, and
 * nothing after the update notices: the beta lands in a published package's
 * dependencies through a pull request that merges once CI passes.
 *
 * So each range the update wrote is compared with `HEAD`'s, in every
 * `package.json` and in `pnpm-workspace.yaml`'s catalogs. Where the old one
 * named a stable version and the new one a prerelease, the range is rewritten
 * to the newest stable version the hold accepts below that prerelease's
 * release, keeping the new range's operator — or back to the old range when
 * that version is no newer than it. Then `pnpm install` re-resolves the
 * lockfile to match. A range that already named a prerelease is somebody's
 * choice and is left alone, and a range the script cannot find to rewrite fails
 * the run rather than letting the prerelease through.
 *
 * `HEAD` is the pre-update commit here, as it is for `update-changeset`.
 */
export const main = async (): Promise<void> => {
  const hold = await readMinimumReleaseAge();

  const cutoff = Temporal.Now.instant().epochMilliseconds - hold.milliseconds;

  console.log(describeHold(hold, cutoff));

  const rewrites = await holdPrereleaseUpdates({
    root: projectRootPath,
    cutoff,
    readMetadata: readRegistryMetadata,
  });

  if (!Arr.isNonEmpty(rewrites)) {
    console.log('No range was moved from a stable release to a prerelease.');

    return;
  }

  for (const { file, group, name, from, to, replacement } of rewrites) {
    console.log(
      `${file} (${group}): ${name} ${to} is a prerelease; ${replacement} instead (was ${from}).`,
    );
  }

  // `CI` makes `--frozen-lockfile` the default, and the lockfile is what has to
  // follow the ranges just written. pnpm-update.yml installs once more after
  // this, which on a lockfile already in step takes seconds; the install here
  // is what a run by hand relies on.
  const install = await runInherited(
    'pnpm',
    ['install', '--no-frozen-lockfile'],
    { cwd: projectRootPath },
  );

  if (install.status !== 0) {
    throw new Error(`pnpm install failed: ${describeFailure(install)}`);
  }
};

/**
 * Finds the prerelease moves under `root` (a git work tree, compared with its
 * `HEAD`), rewrites them in place, and returns what it rewrote. Throws when a
 * move's line cannot be found to rewrite.
 */
export const holdPrereleaseUpdates = async ({
  root,
  cutoff,
  readMetadata,
}: Readonly<{
  root: string;
  cutoff: number;
  readMetadata: (packageName: string) => Promise<RegistryMetadata>;
}>): Promise<readonly Rewrite[]> => {
  const files = await changedSpecifierFiles(root);

  const movesByFile = await Promise.all(
    files.map((file) => movesInFile(root, file)),
  );

  const moves = movesByFile.flat();

  if (!Arr.isNonEmpty(moves)) {
    return [];
  }

  const metadataByName: ReadonlyMap<string, RegistryMetadata> = new Map(
    await Promise.all(
      Array.from(
        new Set(moves.map(({ name }) => name)),
        async (name) => [name, await readMetadata(name)] as const,
      ),
    ),
  );

  // Every name was read above; an empty registry only ever answers `move.from`.
  const rewrites = moves.map((move): Rewrite => ({
    ...move,
    replacement: stableSpecifierFor(
      move,
      metadataByName.get(move.name) ?? noMetadata,
      cutoff,
    ),
  }));

  // Every file is rewritten in memory before any is written, so a move that
  // cannot be found leaves the tree as the update left it.
  const rewrittenFiles = await Promise.all(
    Object.entries(Object.groupBy(rewrites, ({ file: f }) => f)).map(
      async ([file, rewritesOfFile = []]) => {
        const absolutePath = path.resolve(root, file);

        const rewrite = isWorkspaceFile(file)
          ? rewriteYamlSpecifier
          : rewriteJsonSpecifier;

        const text = rewritesOfFile.reduce(
          (current, { group, name, to, replacement }) => {
            const next = rewrite(current, group, name, to, replacement);

            if (next === current) {
              throw new Error(
                `${file}: could not find ${name}: ${to} in ${group} to rewrite to ${replacement}.`,
              );
            }

            return next;
          },
          await readText(absolutePath),
        );

        return { absolutePath, text } as const;
      },
    ),
  );

  await Promise.all(
    rewrittenFiles.map(({ absolutePath, text }) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git listed.
      fs.writeFile(absolutePath, text),
    ),
  );

  return rewrites;
};

/**
 * `^`, `~` or nothing, then a full version: the ranges `pnpm update --latest`
 * writes. Anything else — `>=`, `workspace:`, `npm:`, `catalog:` — is
 * `undefined`, and never a move.
 */
export const parseSpecifier = (
  specifier: string,
): ParsedSpecifier | undefined => {
  const operator =
    specifier.startsWith('^') || specifier.startsWith('~')
      ? specifier.slice(0, 1)
      : '';

  // Build metadata (`+…`) says nothing about the release.
  const [version = ''] = specifier.slice(operator.length).split('+', 1);

  const dash = version.indexOf('-');

  const release = dash === -1 ? version : version.slice(0, dash);

  const prerelease = dash === -1 ? undefined : version.slice(dash + 1);

  return /^\d+\.\d+\.\d+$/u.test(release) &&
    (prerelease === undefined || /^[\w.-]+$/u.test(prerelease))
    ? { operator, release, prerelease: prerelease !== undefined }
    : undefined;
};

/**
 * The ranges that went from a stable version to a prerelease, group by group:
 * a group is one dependency field of a manifest, or one catalog.
 */
export const findPrereleaseMoves = (
  baseline: SpecifierGroups,
  current: SpecifierGroups,
): readonly Move[] =>
  Object.entries(current).flatMap(([group, specifiers]) =>
    Object.entries(specifiers).flatMap(([name, to]) => {
      const from = baseline[group]?.[name];

      if (from === undefined || from === to) {
        return [];
      }

      const parsedFrom = parseSpecifier(from);

      const parsedTo = parseSpecifier(to);

      return parsedFrom === undefined ||
        parsedTo === undefined ||
        parsedFrom.prerelease ||
        !parsedTo.prerelease
        ? []
        : [{ group, name, from, to }];
    }),
  );

/**
 * The range to write instead of `move.to`: the newest stable version published
 * by `cutoff` and below `move.to`'s release, behind `move.to`'s operator, when
 * it is newer than the version `move.from` named; otherwise `move.from` itself.
 *
 * Below the prerelease's release, because pnpm takes a prerelease only when no
 * stable release of that major is old enough: a mature stable version above it
 * is one the `latest` tag does not name (a `next`-tagged major, say), which
 * `--latest` would not have taken either. Deprecation is not weighed: `pnpm
 * view <name> versions time` does not carry it, and the install that follows
 * resolves the range written like any other.
 */
export const stableSpecifierFor = (
  move: Move,
  metadata: RegistryMetadata,
  cutoff: number,
): string => {
  const from = parseSpecifier(move.from);

  const to = parseSpecifier(move.to);

  const fromVersion =
    from === undefined ? undefined : parseStableVersion(from.release);

  const ceiling = to === undefined ? undefined : parseStableVersion(to.release);

  if (to === undefined || fromVersion === undefined || ceiling === undefined) {
    return move.from;
  }

  const target = selectMatureVersion(
    {
      ...metadata,
      versions: metadata.versions.filter((version) => {
        const parsed = parseStableVersion(version);

        return parsed !== undefined && compareVersions(parsed, ceiling) < 0;
      }),
    },
    cutoff,
  )?.target;

  const targetVersion =
    target === undefined ? undefined : parseStableVersion(target);

  return target === undefined ||
    targetVersion === undefined ||
    compareVersions(targetVersion, fromVersion) <= 0
    ? move.from
    : `${to.operator}${target}`;
};

/**
 * `"name": "from"` inside the `group` object of a `package.json`, rewritten to
 * `to`. The spacing is the one Prettier writes, which every manifest here is
 * formatted with; a dependency map holds no nested object, so the group ends at
 * the first `}` after it opens. The text comes back unchanged when the entry is
 * not there.
 */
export const rewriteJsonSpecifier = (
  text: string,
  group: string,
  name: string,
  from: string,
  to: string,
): string => {
  const opening = `${JSON.stringify(group)}: {` as const;

  const start = text.indexOf(opening);

  const end = start === -1 ? -1 : text.indexOf('}', start);

  if (end === -1) {
    return text;
  }

  const body = text.slice(start, end).replace(
    `${JSON.stringify(name)}: ${JSON.stringify(from)}`,
    // A function, so that a `$` in the range is not read as a pattern.
    () => `${JSON.stringify(name)}: ${JSON.stringify(to)}`,
  );

  return `${text.slice(0, start)}${body}${text.slice(end)}`;
};

/**
 * The `name: from` line inside `group` of `pnpm-workspace.yaml` — the
 * top-level `catalog`, or `catalogs.<name>` — rewritten to `to`, either side
 * quoted or not, with the quoting and any trailing comment kept. The text comes
 * back unchanged when the entry is not there.
 */
export const rewriteYamlSpecifier = (
  text: string,
  group: string,
  name: string,
  from: string,
  to: string,
): string => {
  const lines = text.split('\n');

  const block = yamlBlock(lines, catalogPath(group));

  if (block === undefined) {
    return text;
  }

  return lines
    .map((line, index) => {
      if (index < block.start || block.end <= index) {
        return line;
      }

      const entry = parseYamlEntryLine(line);

      return entry?.name === name && entry.value === from
        ? `${entry.head}${to}${entry.tail}`
        : line;
    })
    .join('\n');
};

/** The dependency fields of a manifest, each a group. */
export const manifestGroups = (text: string): SpecifierGroups => {
  const manifest = parseOrUndefined((): unknown => JSON.parse(text));

  if (!isRecord(manifest)) {
    return {};
  }

  return Object.fromEntries(
    dependencyFields.map((field) => [field, stringRecord(manifest[field])]),
  );
};

/** `catalog` and each of `catalogs`, each a group. */
export const workspaceGroups = (text: string): SpecifierGroups => {
  const workspace = parseOrUndefined((): unknown => parseYaml(text));

  if (!isRecord(workspace)) {
    return {};
  }

  const catalogs = isRecord(workspace['catalogs'])
    ? Object.entries(workspace['catalogs'])
    : ([] as const);

  return Object.fromEntries(
    Arr.toUnshifted(['catalog', stringRecord(workspace['catalog'])])(
      catalogs.map(
        ([catalogName, catalog]): readonly [
          string,
          ReadonlyRecord<string, string>,
        ] => [`${namedCatalogPrefix}${catalogName}`, stringRecord(catalog)],
      ),
    ),
  );
};

export type ParsedSpecifier = Readonly<{
  operator: string;
  release: string;
  prerelease: boolean;
}>;

export type Move = Readonly<{
  group: string;
  name: string;
  from: string;
  to: string;
}>;

export type Rewrite = FileMove & Readonly<{ replacement: string }>;

export type SpecifierGroups = ReadonlyRecord<
  string,
  ReadonlyRecord<string, string>
>;

type FileMove = Move & Readonly<{ file: string }>;

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

const workspaceFile = 'pnpm-workspace.yaml';

const namedCatalogPrefix = 'catalogs.';

const noMetadata: RegistryMetadata = { versions: [], time: {} } as const;

const execFileAsync = util.promisify(execFile);

const isWorkspaceFile = (file: string): boolean => file === workspaceFile;

/** `catalog` → `['catalog']`; `catalogs.<name>` → `['catalogs', <name>]`. */
const catalogPath = (group: string): readonly string[] =>
  group.startsWith(namedCatalogPrefix)
    ? (['catalogs', group.slice(namedCatalogPrefix.length)] as const)
    : ([group] as const);

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

/** A line YAML gives no structure to: blank, or a comment. */
const isTrivia = (line: string): boolean => {
  const trimmed = line.trim();

  return trimmed === '' || trimmed.startsWith('#');
};

/**
 * `'a'` or `"a"` to `a`; a name with a stray quote is not a name. A name
 * written with a `"` inside single quotes, or the reverse, is not read; no
 * package name has one.
 */
const unquote = (text: string): string | undefined => {
  const first = text.slice(0, 1);

  if (first !== "'" && first !== '"') {
    return /["']/u.test(text) ? undefined : text;
  }

  return text.length >= 2 && text.endsWith(first)
    ? text.slice(1, -1)
    : undefined;
};

/** `key:` with nothing after it but a comment: a block mapping opening. */
const isKeyLine = (line: string, key: string): boolean => {
  const colon = line.indexOf(':');

  if (colon === -1) {
    return false;
  }

  const rest = line.slice(colon + 1).trim();

  return (
    unquote(line.slice(0, colon).trim()) === key &&
    (rest === '' || rest.startsWith('#'))
  );
};

/**
 * The lines, `[start, end)`, of the block a block-style mapping key opens at
 * each step of `keys`, from the top level down; `undefined` when a key is not
 * there as `key:` on a line of its own. Flow style (`catalog: { … }`) is not
 * read, and the rewrite then finds nothing and says so.
 */
const yamlBlock = (
  lines: readonly string[],
  keys: readonly string[],
): Readonly<{ start: number; end: number }> | undefined =>
  keys.reduce<Readonly<{ start: number; end: number }> | undefined>(
    (range, key) => {
      if (range === undefined) {
        return undefined;
      }

      const childIndent = lines
        .slice(range.start, range.end)
        .find((line) => !isTrivia(line));

      if (childIndent === undefined) {
        return undefined;
      }

      const indent = indentOf(childIndent);

      const keyLine = lines.findIndex(
        (line, index) =>
          range.start <= index &&
          index < range.end &&
          indentOf(line) === indent &&
          !isTrivia(line) &&
          isKeyLine(line, key),
      );

      if (keyLine === -1) {
        return undefined;
      }

      const next = lines.findIndex(
        (line, index) =>
          keyLine < index &&
          index < range.end &&
          !isTrivia(line) &&
          indentOf(line) <= indent,
      );

      return { start: keyLine + 1, end: next === -1 ? range.end : next };
    },
    { start: 0, end: lines.length },
  );

/**
 * `  name: value  # comment`, the name and the value each quoted or not: what a
 * catalog entry looks like. `head` runs up to the value, `tail` from its end.
 */
const parseYamlEntryLine = (
  line: string,
):
  | Readonly<{ name: string; value: string; head: string; tail: string }>
  | undefined => {
  const colon = line.indexOf(':');

  if (colon === -1 || !/^\s/u.test(line)) {
    return undefined;
  }

  const name = unquote(line.slice(0, colon).trim());

  const afterColon = line.slice(colon + 1);

  const body = afterColon.trimStart();

  const quote =
    body.startsWith("'") || body.startsWith('"') ? body.slice(0, 1) : '';

  const valueStart =
    colon + 1 + (afterColon.length - body.length) + quote.length;

  const valueAndRest = line.slice(valueStart);

  const valueLength = valueAndRest.search(/[\s"#']|$/u);

  const value = valueAndRest.slice(0, valueLength);

  const tail = valueAndRest.slice(valueLength);

  return name === undefined || value === '' || !tail.startsWith(quote)
    ? undefined
    : { name, value, head: line.slice(0, valueStart), tail };
};

const stringRecord = (value: unknown): ReadonlyRecord<string, string> =>
  isRecord(value)
    ? Obj.filterMap(value, (specifier) =>
        isString(specifier) ? Optional.some(specifier) : Optional.none,
      )
    : ({} as const);

const parseOrUndefined = (parse: () => unknown): unknown => {
  try {
    return parse();
  } catch {
    return undefined;
  }
};

const readText = (absolutePath: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git listed.
  fs.readFile(absolutePath, 'utf8');

/** What the update rewrote: the manifests and the workspace file. */
const changedSpecifierFiles = async (
  root: string,
): Promise<readonly string[]> => {
  const { stdout } = await closingStdin(
    execFileAsync(
      'git',
      [
        'diff',
        '--name-only',
        '--no-relative',
        'HEAD',
        '--',
        workspaceFile,
        ':(glob)**/package.json',
      ],
      { cwd: root, encoding: 'utf8' },
    ),
  );

  return stdout.split('\n').filter((line) => line !== '');
};

/** The file as `HEAD` has it, or `''` for one the update added. */
const baselineText = async (root: string, file: string): Promise<string> => {
  try {
    const { stdout } = await closingStdin(
      execFileAsync('git', ['show', `HEAD:${file}`], {
        cwd: root,
        encoding: 'utf8',
      }),
    );

    return stdout;
  } catch {
    return '';
  }
};

const movesInFile = async (
  root: string,
  file: string,
): Promise<readonly FileMove[]> => {
  const [baseline, current] = await Promise.all([
    baselineText(root, file),
    readText(path.resolve(root, file)),
  ]);

  const parse = isWorkspaceFile(file) ? workspaceGroups : manifestGroups;

  return findPrereleaseMoves(parse(baseline), parse(current)).map((move) => ({
    ...move,
    file,
  }));
};

if (isDirectlyExecuted(import.meta.url)) {
  await main();
}
