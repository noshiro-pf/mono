import { ESLint } from 'eslint';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { pathExists } from 'ts-repo-utils';

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
 * contents are linted, and they never are. The parser builds no TypeScript program, which
 * would refuse a path its tsconfig does not hold. A rule that needs type
 * information throws without one, so only the rule under test runs; it reads
 * syntax alone.
 *
 * A probe that does not parse, or a path the config ignores or has no
 * configuration for, yields no rule's message at all, so an "allows" test would
 * pass having checked nothing. ESLint reports either with a message that names
 * no rule, which is thrown instead.
 */
export const defineImportProbe = ({
  packageRoot,
  sourcePath: defaultSourcePath,
}: Readonly<{
  packageRoot: string;
  sourcePath: string;
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

    if (await pathExists(filePath)) {
      throw new Error(
        `The probe path ${filePath} exists; name one where nothing does.`,
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
