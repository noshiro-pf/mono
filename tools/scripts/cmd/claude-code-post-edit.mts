import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// Erased by Node, as a top-level `import type` is; see the header.
import type { UnknownRecord } from 'ts-type-forge';

/**
 * The `PostToolUse` hook `.claude/settings.json` runs after Claude Code's
 * `Edit`, `Write` and `MultiEdit`: Prettier `--write` on the edited file, and
 * oxlint on it when its package lints with oxlint. What either reports goes
 * back to the model on stderr with exit code 2, which is how a `PostToolUse`
 * hook speaks to it (the edit has already happened; nothing is blocked).
 *
 * **Fast, or it is a net loss.** Prettier takes about half a second and
 * oxlint a fifth of one. ESLint is not run: this repository's configs are
 * type-aware, and one file costs the whole package's program — 5 s in
 * `split-view-extension`, 12 s in `ts-data-forge`, on every edit. The
 * package's `fix:lint`, or `pnpm run check-changed`, runs it once at the end.
 *
 * **Silent when it cannot run.** No repository root above the file, no
 * `node_modules`, a file outside the repository, under `experimental/`
 * (nothing checks it), under `strict-lib/` (oxfmt owns it, not Prettier), in
 * `node_modules/` or a `dist/`, or a deleted file: exit 0 with nothing
 * printed. A tool that fails to start, rather than finding something, is
 * silent too, so a broken toolchain never reads as a finding about the edit.
 *
 * **Run with `node`, not `tsx`.** The hook starts on whatever Node the
 * session has, possibly before `pnpm install`, so this imports only `node:*`
 * modules at runtime, uses only erasable syntax and no `Temporal`; the test
 * holds that. `$CLAUDE_PROJECT_DIR`, which the hook command uses to find this
 * file, names the checkout the session started in, not a worktree it moved to;
 * the repository root is therefore found from the edited file, so that a
 * worktree's own `node_modules` and configs are the ones used.
 */
export const main = (stdin: string): number => {
  const file = readFilePath(stdin);

  const root =
    file === undefined ? undefined : findRepositoryRoot(path.dirname(file));

  if (file === undefined || root === undefined) {
    return 0;
  }

  const relative = path.relative(root, file).split(path.sep).join('/');

  const bin = path.join(root, 'node_modules', '.bin');

  if (
    !isEligible(relative) ||
    !exists(file) ||
    !exists(path.join(bin, 'prettier'))
  ) {
    return 0;
  }

  const prettier = spawnSync(
    path.join(bin, 'prettier'),
    [
      '--write',
      '--ignore-unknown',
      // An import added by one edit and first used by the next would
      // otherwise be removed in between by prettier-plugin-organize-imports.
      // Prettier warns that it does not know the option before the plugin
      // loads, and then honors it; `error` keeps that warning out of what
      // the model is shown.
      '--organize-imports-skip-destructive-code-actions=true',
      '--log-level=error',
      file,
    ],
    { cwd: root, encoding: 'utf8' },
  );

  const packageDir = findPackageDir(root, path.dirname(file));

  const oxlint =
    packageDir !== undefined &&
    LINTED_FILE.test(relative) &&
    exists(path.join(bin, 'oxlint')) &&
    lintsWithOxlint(packageDir)
      ? spawnSync(path.join(bin, 'oxlint'), ['--quiet', file], {
          cwd: packageDir,
          encoding: 'utf8',
        })
      : undefined;

  const findings = [
    // Prettier exits 2 for a file it cannot parse and for its own failures
    // alike (a plugin that does not load, a broken config); only the first
    // is about the edit, and only it says `SyntaxError`.
    ...(prettier.status === 2 && prettier.stderr.includes('SyntaxError')
      ? ([
          `Prettier could not format ${relative}:\n${prettier.stderr.trim()}`,
        ] as const)
      : ([] as const)),
    // 1 is "found something"; any other failure is the tool's, not the edit's.
    ...(oxlint?.status === 1
      ? ([
          `oxlint reports, in ${relative}:\n${`${oxlint.stdout}${oxlint.stderr}`.trim()}`,
        ] as const)
      : ([] as const)),
  ] as const;

  if (findings.length === 0) {
    return 0;
  }

  process.stderr.write(`${findings.join('\n\n')}\n`);

  return 2;
};

/** The `tool_input.file_path` of a hook's stdin, when there is one. */
export const readFilePath = (stdin: string): string | undefined => {
  const input = parseJson(stdin);

  const toolInput = isObject(input) ? input['tool_input'] : undefined;

  const filePath = isObject(toolInput) ? toolInput['file_path'] : undefined;

  return typeof filePath === 'string' && path.isAbsolute(filePath)
    ? filePath
    : undefined;
};

/**
 * Whether a repository-relative path is one this hook formats: inside the
 * repository and outside every directory it must leave alone.
 */
export const isEligible = (relative: string): boolean =>
  relative !== '' &&
  !relative.startsWith('../') &&
  !path.isAbsolute(relative) &&
  SKIPPED_ROOTS.every((dir) => !relative.startsWith(dir)) &&
  relative.split('/').every((segment) => !SKIPPED_SEGMENTS.has(segment));

const SKIPPED_ROOTS = ['experimental/', 'strict-lib/'] as const;

const SKIPPED_SEGMENTS: ReadonlySet<string> = new Set<string>([
  'node_modules',
  'dist',
  '.git',
]);

const LINTED_FILE = /\.(?:ts|mts|cts|tsx|js|mjs|cjs|jsx)$/u;

/** The nearest directory holding `pnpm-workspace.yaml`. */
const findRepositoryRoot = (start: string): string | undefined =>
  findUp(start, (dir) => exists(path.join(dir, 'pnpm-workspace.yaml')));

/** The nearest directory below the root holding a `package.json`. */
const findPackageDir = (root: string, start: string): string | undefined =>
  findUp(start, (dir) => exists(path.join(dir, 'package.json')), root);

const findUp = (
  dir: string,
  found: (candidate: string) => boolean,
  stopAt?: string,
): string | undefined => {
  if (dir === stopAt) {
    return undefined;
  }

  if (found(dir)) {
    return dir;
  }

  const parent = path.dirname(dir);

  return parent === dir ? undefined : findUp(parent, found, stopAt);
};

/** Whether the package's own lint runs oxlint, so its verdict is the package's. */
const lintsWithOxlint = (packageDir: string): boolean => {
  const manifest = parseJson(
    readText(path.join(packageDir, 'package.json')) ?? '',
  );

  const scripts = isObject(manifest) ? manifest['scripts'] : undefined;

  const lint = isObject(scripts) ? scripts['check:lint'] : undefined;

  return typeof lint === 'string' && lint.includes('oxlint');
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const readText = (file: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package.json above the edited file.
    return fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
};

// eslint-disable-next-line security/detect-non-literal-fs-filename -- paths derived from the edited file.
const exists = (file: string): boolean => fs.existsSync(file);

const isObject = (value: unknown): value is UnknownRecord =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge may not be installed when this runs (see the header).
  typeof value === 'object' && value !== null;

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: this runs with `node`
 * alone (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  process.exit(main(fs.readFileSync(0, 'utf8')));
}
