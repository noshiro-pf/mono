import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  handWritten,
  memberDirs,
  memberTsconfigs,
  type MemberDir,
  type MemberTsconfig,
} from '../../configs/member-tsconfig.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes each workspace member's `tsconfig.json` from what it can read off the
 * member, and from its entry in `tools/configs/member-tsconfig.mts` for what it
 * cannot. A member declares a departure there — a JSX factory, Node.js alone, a
 * compiler option, a directory left out — with the note the generator writes
 * above it; one in `handWritten` keeps the file it has.
 *
 * Derived for every member:
 *
 * - `extends`: the shared type-check and Vite bases, and the Node-only one for
 *   a member that runs under Node.js alone.
 * - `libReplacement: true`, which `check:root:tsconfig-lib-replacement`
 *   requires.
 * - `paths`, for a member that has `samples/`: its own name and each subpath of
 *   its `exports` whose target is `./dist/<x>.mjs` (or `.d.mts`), mapped to
 *   `./src/<x>.mts`, the rule `check:root:tsconfig-paths` holds the mapping
 *   to.
 * - `include`: the directories among `src`, `test`, `e2e`, `samples`,
 *   `scripts` and `configs` that hold a file git would commit, in that order.
 *
 * The members are the directories with a `package.json` and a `tsconfig.json`
 * under `apps/`, `libs/` and `languages/`; `verify-npm-packages/` writes its
 * own with `gen:verify-npm-packages`, and the strict-lib harnesses have none.
 * `style-check.yml` runs this and then asserts a clean tree, so a hand edit to
 * a generated file fails there, naming it, and so does `check-changed`.
 */
export const genTsconfig = async (): Promise<Result<number, string>> => {
  const files = await committableFiles();

  if (Result.isErr(files)) {
    return files;
  }

  const members = memberDirsOf(files.value);

  const known = new Set(files.value);

  const problems = declarationProblems(members);

  if (Arr.isNonEmpty(problems)) {
    return Result.err(
      Arr.toUnshifted('❌ tools/configs/member-tsconfig.mts:')(
        problems.map((problem) => `  ${problem}`),
      ).join('\n'),
    );
  }

  const written = await Promise.all(
    members
      .filter((dir) => !hasKey(handWritten, dir))
      .map(async (dir) => {
        const manifest = await readManifest(dir);

        if (Result.isErr(manifest)) {
          return manifest;
        }

        const file = path.join(projectRootPath, dir, 'tsconfig.json');

        const text = renderMemberTsconfig({
          dir,
          name: manifest.value.name,
          manifestExports: manifest.value.manifestExports,
          published: manifest.value.files,
          files: files.value.filter((file_) => file_.startsWith(`${dir}/`)),
          entry: memberTsconfigs[dir] ?? {},
          srcFileExists: (rel) => known.has(`${dir}/${rel}`),
        });

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a member's tsconfig.json
        await fs.writeFile(file, text);

        return Result.ok(file);
      }),
  );

  const failed = written.filter(Result.isErr).map(({ value }) => value);

  if (Arr.isNonEmpty(failed)) {
    return Result.err(failed.join('\n'));
  }

  const paths = written.filter(Result.isOk).map(({ value }) => value);

  const formatted = await formatFiles(paths);

  if (Result.isErr(formatted)) {
    return Result.err(
      `❌ Could not format the tsconfig files: ${unknownToString(formatted.value)}`,
    );
  }

  return Result.ok(paths.length);
};

/** The text of `dir`'s `tsconfig.json`, before Prettier formats it. */
export const renderMemberTsconfig = ({
  dir,
  name,
  manifestExports,
  published,
  files,
  entry,
  srcFileExists,
}: Readonly<{
  /** Repository-relative, `/`-separated. */
  dir: string;
  name: string;
  /** The manifest's `exports`, as read. */
  manifestExports: unknown;
  /** The manifest's `files`, when it has one. */
  published: readonly string[] | undefined;
  /** The member's committable files, repository-relative. */
  files: readonly string[];
  entry: MemberTsconfig;
  /** Whether a file at a member-relative path exists. */
  srcFileExists: (memberRelative: string) => boolean;
}>): string => {
  const up = '../'.repeat(dir.split('/').length);

  const bases = [
    'tsconfig.type-check.json',
    ...(entry.withoutVite === true
      ? ([] as const)
      : (['tsconfig.vite.json'] as const)),
    ...(entry.nodeOnly === true
      ? (['tsconfig.node-only.json'] as const)
      : ([] as const)),
  ] as const;

  const held = memberDirs.filter(
    (sub) =>
      !(entry.omitDirs ?? []).includes(sub) &&
      files.some((file) => file.startsWith(`${dir}/${sub}/`)),
  );

  const paths =
    held.includes('samples') || entry.selfPaths === true
      ? selfPaths(name, manifestExports, srcFileExists)
      : ([] as const);

  const options: readonly string[] = [
    block(
      [STANDARD_NOTES.libReplacement, entry.notes?.libReplacement],
      '"libReplacement": true',
    ),
    ...(entry.jsx === undefined
      ? ([] as const)
      : ([
          block(
            [entry.notes?.jsx],
            `"jsxImportSource": ${JSON.stringify(entry.jsx)}`,
          ),
        ] as const)),
    ...(entry.compilerOptions === undefined
      ? ([] as const)
      : ([
          block(
            [entry.notes?.compilerOptions],
            Object.entries(entry.compilerOptions)
              .map(([key, value]) => `"${key}": ${JSON.stringify(value)}`)
              .join(',\n'),
          ),
        ] as const)),
    ...(Arr.isEmpty(paths)
      ? ([] as const)
      : ([
          block(
            [entry.notes?.paths ?? STANDARD_NOTES.paths],
            `"paths": {\n${paths
              .map(
                ([key, target]) =>
                  `${JSON.stringify(key)}: [${JSON.stringify(target)}]`,
              )
              .join(',\n')}\n}`,
          ),
        ] as const)),
  ] as const;

  const includeNote =
    entry.notes?.include ?? testNote(dir, files, published, held);

  return `${[
    '{',
    ...(entry.notes?.extends === undefined
      ? []
      : [comment(entry.notes.extends)]),
    `"extends": ${JSON.stringify(bases.map((base) => `${up}tools/configs/tsconfig/${base}`))},`,
    `"compilerOptions": {\n${options.join(',\n\n')}\n},`,
    ...(includeNote === undefined ? [] : [comment(includeNote)]),
    `"include": ${JSON.stringify([...held.map((sub) => `./${sub}`), ...(entry.includeFiles ?? [])])}${entry.exclude === undefined ? '' : ','}`,
    ...(entry.exclude === undefined
      ? []
      : Arr.toPushed(
          entry.notes?.exclude === undefined
            ? []
            : [comment(entry.notes.exclude)],
          `"exclude": ${JSON.stringify(entry.exclude)}`,
        )),
    '}',
  ].join('\n')}\n`;
};

/**
 * What is wrong with the declarations, against the members that exist: an entry
 * or a hand-written member naming no member, and a departure with no note.
 */
export const declarationProblems = (
  members: readonly string[],
): readonly string[] =>
  [
    ...Object.keys(memberTsconfigs)
      .filter((dir) => !members.includes(dir))
      .map((dir) => `\`${dir}\` names no member with a tsconfig.json.`),
    ...Object.keys(handWritten)
      .filter((dir) => !members.includes(dir))
      .map(
        (dir) =>
          `\`${dir}\` in \`handWritten\` names no member with a tsconfig.json.`,
      ),
    ...Object.keys(handWritten)
      .filter((dir) => hasKey(memberTsconfigs, dir))
      .map(
        (dir) =>
          `\`${dir}\` is in \`handWritten\` and has an entry; the file is written by hand, so the entry does nothing.`,
      ),
    ...Object.entries(memberTsconfigs).flatMap(([dir, entry]) =>
      entryProblems(entry).map((problem) => `\`${dir}\`: ${problem}`),
    ),
  ] as const;

/** The departures of `entry` that carry no note. */
export const entryProblems = (entry: MemberTsconfig): readonly string[] =>
  [
    entry.compilerOptions !== undefined &&
    entry.notes?.compilerOptions === undefined
      ? '`compilerOptions` needs `notes.compilerOptions`'
      : undefined,
    entry.omitDirs !== undefined && entry.notes?.include === undefined
      ? '`omitDirs` needs `notes.include`'
      : undefined,
    entry.exclude !== undefined && entry.notes?.exclude === undefined
      ? '`exclude` needs `notes.exclude`'
      : undefined,
    entry.selfPaths === true && entry.notes?.paths === undefined
      ? '`selfPaths` needs `notes.paths`'
      : undefined,
    entry.withoutVite === true && entry.notes?.extends === undefined
      ? '`withoutVite` needs `notes.extends`'
      : undefined,
  ].filter(isString);

const STANDARD_NOTES = {
  libReplacement:
    'Opted into the strict standard library. Both TypeScript 6 and 7 default `libReplacement` to false, so the `@typescript/lib-*` links the root `prepare` script writes do nothing without it. Stated here, with a probe: `check:root:tsconfig-lib-replacement` requires both. See docs/strict-typescript-lib-integration.md.',
  paths:
    '`samples/` imports this package by its own name, the way a consumer does. Mapped to the source so that a sample is checked against the code being edited rather than against the last build. See docs/workspace-package-linking.md.',
} as const;

/** The member directories: a `package.json` and a `tsconfig.json`. */
export const memberDirsOf = (files: readonly string[]): readonly string[] => {
  const set = new Set(files);

  return files
    .filter((file) =>
      /^(?:apps|libs)\/[^/]+\/tsconfig\.json$|^languages\/[^/]+\/[^/]+\/tsconfig\.json$/u.test(
        file,
      ),
    )
    .map((file) => file.slice(0, -'/tsconfig.json'.length))
    .filter((dir) => set.has(`${dir}/package.json`))
    .toSorted();
};

/** The files git would commit: tracked or untracked but not ignored. */
export const committableFiles = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await Result.fromPromise(
    util.promisify(execFile)(
      'git',
      ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { cwd: projectRootPath, maxBuffer: 256 * 1024 * 1024 },
    ),
  );

  if (Result.isErr(result)) {
    return Result.err(
      `❌ git ls-files failed: ${unknownToString(result.value)}`,
    );
  }

  return Result.ok(
    Arr.uniq(result.value.stdout.split('\0').filter((file) => file !== '')),
  );
};

/**
 * The note on `./test` when it holds only the strict-lib probe, saying whether
 * the package publishes it.
 */
const testNote = (
  dir: string,
  files: readonly string[],
  published: readonly string[] | undefined,
  held: readonly MemberDir[],
): string | undefined => {
  if (!held.includes('test')) {
    return undefined;
  }

  const testFiles = files.filter((file) => file.startsWith(`${dir}/test/`));

  if (
    !Arr.isFixedLengthArray(1, testFiles) ||
    testFiles[0] !== `${dir}/test/strict-lib-active.mts`
  ) {
    return undefined;
  }

  const unpublished =
    published?.every((entry) => !/^\.?\/?test\b/u.test(entry)) === true
      ? (` It is not published — \`files\` lists ${published.map((entry) => `\`${entry}\``).join(' and ')}.` as const)
      : '';

  return `\`./test\` holds only \`strict-lib-active.mts\`, the probe that fails when the replacement above stops happening.${unpublished}`;
};

/** The `./dist/` file an export condition tree points at, if any. */
const distTarget = (value: unknown): string | undefined => {
  if (isString(value)) {
    return /^\.\/dist\/.+\.(?:mjs|d\.mts)$/u.test(value) ? value : undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ['import', 'default', 'types']) {
    if (!hasKey(value, key)) {
      continue;
    }

    const found = distTarget(value[key]);

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};

/**
 * `[key, target]` for the package's own name and each subpath of its `exports`
 * whose target is under `./dist/`, mapped to the `./src/` file of the same
 * name, when that file exists.
 */
const selfPaths = (
  name: string,
  manifestExports: unknown,
  srcFileExists: (memberRelative: string) => boolean,
): readonly FixedLengthTuple<2, string>[] => {
  if (!isRecord(manifestExports)) {
    return [];
  }

  return Arr.generate(function* () {
    for (const [subpath, value] of Object.entries(manifestExports)) {
      const target = distTarget(value);

      if (target === undefined) {
        continue;
      }

      const source = target
        .replace(/^\.\/dist\//u, './src/')
        .replace(/\.d\.mts$|\.mjs$/u, '.mts');

      if (srcFileExists(source.slice(2))) {
        yield [
          subpath === '.' ? name : `${name}/${subpath.slice(2)}`,
          source,
        ] as const;
      }
    }
  });
};

/**
 * `text` as `//` lines filled to 76 columns, which Prettier leaves as they are;
 * the deepest block is indented by four.
 */
const comment = (text: string): string => {
  const words = text.split(/\s+/u);

  const mut_lines: string[] = [];

  let mut_line = '';

  for (const word of words) {
    if (mut_line !== '' && mut_line.length + 1 + word.length > COMMENT_WIDTH) {
      mut_lines.push(mut_line);

      mut_line = word;
    } else {
      mut_line = mut_line === '' ? word : `${mut_line} ${word}`;
    }
  }

  mut_lines.push(mut_line);

  return mut_lines.map((line) => `// ${line}`).join('\n');
};

/** A block of `body` with the comment written from `notes` above it. */
const block = (
  notes: readonly (string | undefined)[],
  body: string,
): string => {
  const present = notes.filter(isString);

  return Arr.isNonEmpty(present)
    ? `${present.map(comment).join('\n//\n')}\n${body}`
    : body;
};

const COMMENT_WIDTH = 73;

const readManifest = async (
  dir: string,
): Promise<
  Result<
    Readonly<{
      name: string;
      manifestExports: unknown;
      files: readonly string[] | undefined;
    }>,
    string
  >
> => {
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a member's package.json
    fs.readFile(path.join(projectRootPath, dir, 'package.json'), 'utf8'),
  );

  if (Result.isErr(text)) {
    return Result.err(`❌ ${dir}/package.json: ${unknownToString(text.value)}`);
  }

  const parsed: unknown = JSON.parse(text.value);

  if (!isRecord(parsed) || !hasKey(parsed, 'name') || !isString(parsed.name)) {
    return Result.err(`❌ ${dir}/package.json has no name.`);
  }

  const files =
    hasKey(parsed, 'files') &&
    Arr.isArray(parsed.files) &&
    parsed.files.every(isString)
      ? parsed.files
      : undefined;

  return Result.ok({
    name: parsed.name,
    manifestExports: hasKey(parsed, 'exports') ? parsed.exports : undefined,
    files,
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await genTsconfig();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.log(`✓ Wrote ${result.value} member tsconfig.json file(s).`);
}
