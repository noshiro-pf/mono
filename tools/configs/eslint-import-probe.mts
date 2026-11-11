import { ESLint } from 'eslint';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';

/**
 * Lints probe text with a package's own `eslint.config.mts` and returns the
 * lines `no-restricted-imports` reports, for the tests that hold a package's
 * import allow-list (`test/eslint-config.test.mts`). A block after the
 * allow-list that sets the rule again turns it off with nothing failing, so
 * the config is read the way `check:lint` reads it, not restated.
 *
 * The probe text is linted under the path of a real file (`sourcePath`,
 * relative to `packageRoot`), so that the config's `files` globs pick it. Only
 * the rule under test runs, and the parser builds no TypeScript program: the
 * rule reads syntax alone, and a rule that reads the program would see the
 * file's contents on disk rather than the probe.
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
