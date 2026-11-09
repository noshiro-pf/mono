import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { readScripts } from '../scripts/lib/manifest-scripts.mjs';
import {
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
} from '../scripts/lib/repo-files.mjs';
import { readShellCommands } from '../scripts/lib/shell-commands.mjs';

/**
 * The config object for `eslint.config.mts` in `eslint.published-deps.mts`
 * names every one, but ESLint lints only what the root `check:published-deps`
 * script hands it, and a config in a directory its globs miss is skipped with
 * nothing failing. The globs name directories rather than `**`, so that ESLint
 * does not walk the whole tree and untracked copies of the repository; this
 * holds them to the tracked configs instead.
 */
describe('check:published-deps', () => {
  test('hands ESLint every tracked eslint.config.mts', async () => {
    const globs = await scriptGlobs();

    expect(globs).not.toStrictEqual([]);

    const tracked = await trackedEslintConfigs();

    const missed = tracked.filter((file) =>
      globs.every((glob) => !path.posix.matchesGlob(file, glob)),
    );

    expect(
      missed,
      'add a glob covering these to `check:published-deps` in the root package.json',
    ).toStrictEqual([]);
  });
});

const ESLINT_CONFIG = 'eslint.config.mts';

/** The script's globs for lint configs, however spelled, `./` taken off. */
const scriptGlobs = async (): Promise<readonly string[]> => {
  const text = await readRepositoryFile('package.json');

  assert.isTrue(Result.isOk(text));

  const body =
    readScripts(JSON.parse(text.value))['check:published-deps'] ?? '';

  const { commands, problems } = readShellCommands(body);

  expect(problems).toStrictEqual([]);

  return commands
    .flat()
    .filter((word) => word.includes('eslint.config'))
    .map((word) => word.replace(/^\.\//u, ''));
};

/** Tracked files named exactly `eslint.config.mts`, outside `experimental/`. */
const trackedEslintConfigs = async (): Promise<readonly string[]> => {
  const files = await listTrackedFiles();

  assert.isTrue(Result.isOk(files));

  return files.value.filter(
    (file) =>
      path.posix.basename(file) === ESLINT_CONFIG && !isUnderExperimental(file),
  );
};
