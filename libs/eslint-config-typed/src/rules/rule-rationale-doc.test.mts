import { ESLint, type Linter } from 'eslint';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { eslintConfigForTypeScript } from '../configs/index.mjs';
import { eslintTsDataForgeRules } from './eslint-ts-data-forge-rules.mjs';

// `docs/rule-rationale.md` explains why a rule is on or off in the preset; a
// table row, or a setting the prose relies on, that no longer matches what the
// preset configures says the opposite of what the package does, and nothing
// else would notice.
describe('docs/rule-rationale.md', () => {
  const packageRoot = path.resolve(import.meta.dirname, '../..');

  /** The config the preset resolves to for an ordinary source file. */
  const presetConfig = async (): Promise<
    Readonly<{
      rules: ReadonlyRecord<string, unknown>;
      linterOptions: unknown;
    }>
  > => {
    const eslint = new ESLint({
      cwd: packageRoot,
      overrideConfigFile: true,
      overrideConfig: Array.from(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the preset's flat config, which ESLint validates
        eslintConfigForTypeScript({
          tsconfigFileName: 'tsconfig.json',
          tsconfigRootDir: packageRoot,
          packageDirs: [packageRoot],
        }) as readonly Linter.Config[],
      ),
    });

    const config: unknown = await eslint.calculateConfigForFile(
      path.join(packageRoot, 'src/entry-point.mts'),
    );

    assert.isTrue(isRecord(config));

    const { rules, linterOptions } = config;

    assert.isTrue(isRecord(rules));

    return { rules, linterOptions };
  };

  test('every table row names the severity the preset configures', async () => {
    const [doc, { rules }] = await Promise.all([
      fs.readFile(path.join(packageRoot, 'docs/rule-rationale.md'), 'utf8'),
      presetConfig(),
    ]);

    // Every body row of every table is read; one this pattern does not parse
    // fails instead of going unchecked.
    const rows = doc
      .split('\n')
      .filter(
        (line) =>
          line.trimStart().startsWith('|') &&
          !line.includes('---') &&
          !line.includes('ルール'),
      );

    expect(rows.length).toBeGreaterThan(0);

    const parsed = rows.map((row) => ({
      row,
      groups: rowPattern.exec(row)?.groups,
    }));

    assert.deepStrictEqual(
      parsed.filter(({ groups }) => groups === undefined).map(({ row }) => row),
      [],
    );

    for (const { groups } of parsed) {
      const rule = groups?.['rule'];

      assert.isDefined(rule);

      const severity = groups?.['severity'];

      expect(severityOf(rules[rule]), `${rule} in the preset`).toBe(severity);
    }
  });

  test('the settings the prose relies on', async () => {
    const { rules, linterOptions } = await presetConfig();

    // A for-loop variable is reported unless it is named `mut_…`.
    const noLet = rules['functional/no-let'];

    assert.isTrue(Arr.isArray(noLet));

    const option = noLet[1];

    assert.isTrue(isRecord(option));

    expect(option['allowInForLoopInit']).toBe(false);

    expect(option['ignoreIdentifierPattern']).toContain('^mut_');

    // A disable comment naming a rule that did not report is itself reported.
    assert.isTrue(isRecord(linterOptions));

    // ESLint resolves `true` to 'warn' and `false` to 'off'.
    expect(['warn', 'error']).toContain(
      severityOf(linterOptions['reportUnusedDisableDirectives']),
    );

    // `prefer-range-for-loop` is not in the preset; the prose says it has to be
    // added.
    expect(rules['ts-data-forge/prefer-range-for-loop']).toBeUndefined();
  });

  test('eslintTsDataForgeRules turns on prefer-range-for-loop', () => {
    expect(
      severityOf(eslintTsDataForgeRules['ts-data-forge/prefer-range-for-loop']),
    ).toBe('error');
  });
});

/** A table body row: `` | `<rule>` | `<severity>` | ``. */
const rowPattern = /^\| `(?<rule>[^`]+)` +\| `(?<severity>[^`]+)` +\|$/u;

/** `'off'`, `'warn'` or `'error'` for a rule entry, whatever its spelling. */
const severityOf = (entry: unknown): string | undefined => {
  const level = Arr.isArray(entry) ? entry[0] : entry;

  switch (level) {
    case 0:
    case 'off':
      return 'off';

    case 1:
    case 'warn':
      return 'warn';

    case 2:
    case 'error':
      return 'error';

    default:
      return undefined;
  }
};
