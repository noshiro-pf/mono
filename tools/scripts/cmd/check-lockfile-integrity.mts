import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, asUint32, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `pnpm-lock.yaml` refers to a package it does not contain.
 *
 * Git merges the lockfile line by line, so a rebase can join two sides that
 * each were consistent into one that is not: one side's importer pointing at a
 * snapshot only the other side's peer set produced, with neither in conflict.
 * pnpm does not notice. `pnpm install --frozen-lockfile` succeeds and links the
 * package to a directory that does not exist, and `--lockfile-only` leaves the
 * file as it is, so nothing in CI fails until something happens to resolve the
 * package (#2232).
 *
 * So this reads the lockfile alone and checks what pnpm takes on trust:
 *
 * - every importer dependency resolves to a key of `snapshots:`;
 * - every `dependencies` / `optionalDependencies` entry of a snapshot does too;
 * - every snapshot, peer suffix removed, has its entry in `packages:`.
 *
 * The file holds two YAML documents — the package manager's own lockfile
 * first, then the workspace's — and each is checked against itself.
 */
export const checkLockfileIntegrity = async (): Promise<
  Result<number, string>
> => {
  const lockfilePath = path.resolve(projectRootPath, LOCKFILE_NAME);

  const lockfile = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(lockfilePath, 'utf8'),
  );

  if (Result.isErr(lockfile)) {
    return Result.err(
      `Failed to read ${LOCKFILE_NAME}: ${unknownToString(lockfile.value)}`,
    );
  }

  const { referenceCount, danglingReferences } = findDanglingReferences(
    lockfile.value,
  );

  if (referenceCount === 0) {
    return Result.err(
      [
        `Found no references to check in ${LOCKFILE_NAME}.`,
        'Its layout has probably changed; teach check-lockfile-integrity.mts',
        'the new one rather than letting this check pass on nothing.',
      ].join('\n'),
    );
  }

  if (!Arr.isNonEmpty(danglingReferences)) {
    return Result.ok(referenceCount);
  }

  return Result.err(
    [
      `${LOCKFILE_NAME} refers to ${danglingReferences.length} package(s) it does not contain:`,
      '',
      ...danglingReferences.map(
        ({ lineNumber, from, key, missingFrom }) =>
          `  ${LOCKFILE_NAME}:${lineNumber}  ${from} -> ${key} (not in ${missingFrom}:)`,
      ),
      '',
      'This is usually a merge or rebase that joined both sides of the lockfile',
      'without a conflict. pnpm installs it without complaint and links the',
      'package to a directory that does not exist. Regenerate the lockfile from',
      "the base branch's copy:",
      '',
      `  git checkout origin/main -- ${LOCKFILE_NAME} && pnpm install`,
    ].join('\n'),
  );
};

export type DanglingReference = Readonly<{
  lineNumber: number;
  /** The importer or snapshot holding the reference. */
  from: string;
  /** The key the reference resolves to. */
  key: string;
  missingFrom: 'snapshots' | 'packages';
}>;

/**
 * Every reference in the lockfile whose target is missing, and how many
 * references were checked.
 *
 * The lockfile is read with a line scanner, as `check-lockfile-tarballs.mts`
 * reads it: pnpm writes it with a fixed two-space indent, one entry per line,
 * so the indent alone says what a line is.
 */
export const findDanglingReferences = (
  lockfile: string,
): Readonly<{
  referenceCount: number;
  danglingReferences: readonly DanglingReference[];
}> => {
  const documents = splitDocuments(lockfile.split('\n'));

  const results = documents.map(checkDocument);

  return {
    referenceCount: results.reduce(
      (sum, { referenceCount }) => sum + referenceCount,
      0,
    ),
    danglingReferences: results.flatMap(
      ({ danglingReferences }) => danglingReferences,
    ),
  };
};

/**
 * The key of `snapshots:` a dependency resolves to.
 *
 * pnpm writes the version alone when the dependency is installed under its
 * own name (`1.0.0(peer@2.0.0)` → `name@1.0.0(peer@2.0.0)`), and the full key
 * when it is not — an alias (`typescript@7.0.2`) or a `file:` dependency
 * (`name@file:path`). `link:` points at a workspace directory and has no
 * snapshot, so it resolves to nothing.
 */
export const snapshotKeyOf = (
  name: string,
  version: string,
): string | undefined => {
  if (version.startsWith('link:')) {
    return undefined;
  }

  const withoutPeers = stripPeerSuffix(version);

  return withoutPeers.lastIndexOf('@') > 0 ? version : `${name}@${version}`;
};

type DocumentLine = Readonly<{
  lineNumber: number;
  text: string;
}>;

type Reference = Readonly<{
  lineNumber: number;
  from: string;
  key: string;
}>;

const LOCKFILE_NAME = 'pnpm-lock.yaml';

const IMPORTER_DEPENDENCY_FIELDS: ReadonlySet<string> = new Set<string>([
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'packageManagerDependencies',
]);

const SNAPSHOT_DEPENDENCY_FIELDS: ReadonlySet<string> = new Set<string>([
  'dependencies',
  'optionalDependencies',
]);

const unquote = (text: string): string =>
  text.length >= 2 && text.startsWith("'") && text.endsWith("'")
    ? text.slice(1, -1).replaceAll("''", "'")
    : text;

/**
 * `key: value` or `key:`, with either side possibly single-quoted, as pnpm
 * writes them. A line that is not a mapping entry — blank, a list item, a
 * comment — is `undefined`.
 */
const parseMappingLine = (
  text: string,
): Readonly<{ key: string; value: string | undefined }> | undefined => {
  if (text === '' || text.startsWith('#') || text.startsWith('- ')) {
    return undefined;
  }

  const keyEnd =
    QUOTED_KEY_PATTERN.exec(text)?.[0].length ?? text.search(/:(?: |$)/u);

  if (keyEnd <= 0 || text[keyEnd] !== ':') {
    return undefined;
  }

  const rest = text.slice(keyEnd + 1).trim();

  return {
    key: unquote(text.slice(0, keyEnd)),
    value: rest === '' ? undefined : unquote(rest),
  };
};

const scanLine = (
  context: ScanContext,
  { lineNumber, text }: DocumentLine,
): Readonly<{ context: ScanContext; found?: Found }> => {
  const trimmed = text.trimStart();

  const parsed = parseMappingLine(trimmed);

  if (parsed === undefined) {
    return { context };
  }

  const { key, value } = parsed;

  switch (text.length - trimmed.length) {
    case 0:
      return { context: { ...context, section: key } };

    case 2: {
      const kind =
        context.section === 'packages'
          ? 'package'
          : context.section === 'snapshots'
            ? 'snapshot'
            : undefined;

      return {
        context: { ...context, entry: key },
        ...(kind === undefined
          ? {}
          : { found: { kind, reference: { lineNumber, from: key, key } } }),
      };
    }

    case 4:
      return { context: { ...context, field: key } };

    case 6: {
      const target =
        value !== undefined &&
        context.section === 'snapshots' &&
        SNAPSHOT_DEPENDENCY_FIELDS.has(context.field)
          ? snapshotKeyOf(key, value)
          : undefined;

      return {
        context: { ...context, dependencyName: key },
        ...(target === undefined
          ? {}
          : {
              found: {
                kind: 'snapshot-reference',
                reference: { lineNumber, from: context.entry, key: target },
              },
            }),
      };
    }

    case 8: {
      const target =
        value !== undefined &&
        key === 'version' &&
        context.section === 'importers' &&
        IMPORTER_DEPENDENCY_FIELDS.has(context.field)
          ? snapshotKeyOf(context.dependencyName, value)
          : undefined;

      if (target === undefined) {
        return { context };
      }

      const importer = context.entry === '.' ? '(root)' : context.entry;

      return {
        context,
        found: {
          kind: 'importer-reference',
          reference: {
            lineNumber,
            from: `${importer} ${context.field}.${context.dependencyName}`,
            key: target,
          },
        },
      };
    }

    default:
      return { context };
  }
};

/**
 * One pass over a document, remembering the key last seen at each indent
 * that matters: the section at 0, the importer or snapshot at 2, its field at
 * 4 and, under an importer, the dependency name at 6.
 */
const scanDocument = (
  lines: readonly DocumentLine[],
): Readonly<{
  packageKeys: ReadonlySet<string>;
  snapshots: readonly Reference[];
  importerReferences: readonly Reference[];
  snapshotReferences: readonly Reference[];
}> => {
  const mut_found: Found[] = [];

  let mut_context: ScanContext = {
    section: '',
    entry: '',
    field: '',
    dependencyName: '',
  };

  for (const line of lines) {
    const { context, found } = scanLine(mut_context, line);

    mut_context = context;

    if (found !== undefined) {
      mut_found.push(found);
    }
  }

  const referencesOf = (kind: Found['kind']): readonly Reference[] =>
    mut_found.filter((f) => f.kind === kind).map(({ reference }) => reference);

  return {
    packageKeys: new Set(referencesOf('package').map(({ key }) => key)),
    snapshots: referencesOf('snapshot'),
    importerReferences: referencesOf('importer-reference'),
    snapshotReferences: referencesOf('snapshot-reference'),
  };
};

/** `name@1.0.0(peer@2.0.0)` → `name@1.0.0`. */
const stripPeerSuffix = (key: string): string => {
  const peerStart = key.indexOf('(');

  return peerStart === -1 ? key : key.slice(0, peerStart);
};

const checkDocument = (
  lines: readonly DocumentLine[],
): Readonly<{
  referenceCount: number;
  danglingReferences: readonly DanglingReference[];
}> => {
  const { packageKeys, snapshots, importerReferences, snapshotReferences } =
    scanDocument(lines);

  const snapshotKeys = new Set(snapshots.map(({ key }) => key));

  const missingSnapshots: readonly DanglingReference[] = [
    ...importerReferences,
    ...snapshotReferences,
  ]
    .filter(({ key }) => !snapshotKeys.has(key))
    .map((reference) => ({ ...reference, missingFrom: 'snapshots' }));

  const missingPackages: readonly DanglingReference[] = snapshots
    .filter(({ key }) => !packageKeys.has(stripPeerSuffix(key)))
    .map(({ lineNumber, key }) => ({
      lineNumber,
      from: 'snapshots',
      key: stripPeerSuffix(key),
      missingFrom: 'packages',
    }));

  return {
    referenceCount:
      importerReferences.length + snapshotReferences.length + snapshots.length,
    danglingReferences: [...missingSnapshots, ...missingPackages].toSorted(
      (a, b) => a.lineNumber - b.lineNumber,
    ),
  };
};

type ScanContext = Readonly<{
  section: string;
  entry: string;
  field: string;
  dependencyName: string;
}>;

type Found = Readonly<{
  kind: 'package' | 'snapshot' | 'importer-reference' | 'snapshot-reference';
  reference: Reference;
}>;

const splitDocuments = (
  lines: readonly string[],
): readonly (readonly DocumentLine[])[] => {
  const numbered = lines.map((text, index) => ({
    lineNumber: index + 1,
    text,
  }));

  const separators = numbered
    .filter(({ text }) => text === DOCUMENT_SEPARATOR)
    .map(({ lineNumber }) => lineNumber);

  const documentIndexOf = (lineNumber: number): number =>
    separators.filter((separator) => separator < lineNumber).length;

  return Arr.seq(asUint32(separators.length + 1))
    .map((documentIndex) =>
      numbered.filter(
        ({ lineNumber, text }) =>
          text !== DOCUMENT_SEPARATOR &&
          documentIndexOf(lineNumber) === documentIndex,
      ),
    )
    .filter(Arr.isNonEmpty);
};

const DOCUMENT_SEPARATOR = '---';

/** A single-quoted key, in which `''` is an escaped quote. */
const QUOTED_KEY_PATTERN = /^'(?:[^']|'')*'/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkLockfileIntegrity();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${LOCKFILE_NAME} contains every package it refers to (${result.value} references checked).`,
  );
}
