import { ESLint } from 'eslint';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';

/**
 * Lints probe text with a package's own `eslint.config.mts` and returns the
 * lines `no-restricted-imports` reports, for the tests that hold a package's
 * import allow-list (`test/eslint-config.test.mts`). A block after the
 * allow-list that sets the rule again turns it off with nothing failing, so
 * the config is read the way `check:lint` reads it, not restated.
 *
 * The probe text is linted under `sourcePath`, relative to `packageRoot`, which
 * only the config's `files` globs read. It names a path where nothing exists,
 * and the probe throws on one that does: a real file's name suggests its
 * contents are linted, and they never are. A block whose `files` names one file
 * can be probed under that file's path alone; list it in `existingPaths`, and
 * the probe lints under it all the same, its contents unread, and throws once
 * nothing is there. The parser builds no TypeScript program, which would refuse
 * a path its tsconfig does not hold. A rule that needs type information throws
 * without one, so only the rule under test runs; it reads syntax alone.
 *
 * A probe that does not parse, or a path the config ignores or has no
 * configuration for, yields no rule's message at all, so an "allows" test would
 * pass having checked nothing. ESLint reports either with a message that names
 * no rule, which is thrown instead.
 */
export const defineImportProbe = ({
  packageRoot,
  sourcePath: defaultSourcePath,
  // An opt-in each caller states beside its probes, where a reader can see
  // whether the path is one a block names alone; nothing here can tell.
  existingPaths = [],
}: Readonly<{
  packageRoot: string;
  sourcePath: string;
  existingPaths?: readonly string[];
}>): ((code: string, sourcePath?: string) => Promise<readonly number[]>) => {
  const eslint = new ESLint({
    cwd: packageRoot,
    overrideConfig: {
      languageOptions: {
        parserOptions: {
          project: null,
          projectService: false,
        },
      },
    },
    ruleFilter: ({ ruleId }) => ruleId === ruleUnderTest,
  });

  return async (code, sourcePath = defaultSourcePath) => {
    const filePath = path.resolve(packageRoot, sourcePath);

    const listed = existingPaths.some(
      (existing) => path.resolve(packageRoot, existing) === filePath,
    );

    // Not `pathExists` of `ts-repo-utils`, which every package that uses this
    // probe would have to declare, so that `check:test` checks it is built.
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the probe's own path
    const exists = fs.existsSync(filePath);

    if (exists && !listed) {
      throw new Error(
        `The probe path ${filePath} exists; name one where nothing does, or list it in existingPaths when a block's files name it alone.`,
      );
    }

    if (listed && !exists) {
      throw new Error(
        `The probe path ${filePath} is in existingPaths and does not exist.`,
      );
    }

    const results = await eslint.lintText(code, { filePath });

    const messages = results.flatMap((r) => r.messages);

    const withoutRule = messages.filter((m) => m.ruleId === null);

    if (Arr.isNonEmpty(withoutRule)) {
      throw new Error(
        `The probe at ${filePath} was not linted:\n${withoutRule
          // A parse error has a position; an ignored path has none.
          .map((m) =>
            m.fatal === true
              ? `  ${m.line}:${m.column} ${m.message}`
              : `  ${m.message}`,
          )
          .join('\n')}`,
      );
    }

    return messages
      .filter((m) => m.ruleId === ruleUnderTest)
      .map((m) => m.line);
  };
};

const ruleUnderTest = 'no-restricted-imports';
