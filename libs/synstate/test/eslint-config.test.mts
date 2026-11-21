import { ESLint } from 'eslint';
import * as path from 'node:path';
import { getSnapshotBan } from '../configs/eslint/rules/get-snapshot-ban.mjs';

const packageRootPath = path.resolve(import.meta.dirname, '..');

// The ban on `getSnapshot` in src/ (configs/eslint/rules/get-snapshot-ban.mts)
// is a set of selectors, which nothing else checks; this lints probe text the
// way `check:lint` lints a source file, as test/ported/eslint-config.test.mts
// does for the imports. A report is the ban's when it carries the ban's
// message.
describe('eslint.config.mts: getSnapshot in src/', () => {
  // As in test/ported/eslint-config.test.mts: the probe text is linted under
  // the path of a real file. With `CI` set, typescript-estree assumes no file
  // changes during the run and parses that file from disk instead of the text
  // given, so that inference is turned off. Only the rule under test runs: rules
  // that read the TypeScript program can still see the file's contents.
  const eslint = new ESLint({
    cwd: packageRootPath,
    overrideConfig: {
      languageOptions: {
        parserOptions: { disallowAutomaticSingleRunInference: true },
      },
    },
    ruleFilter: ({ ruleId }) => ruleId === 'no-restricted-syntax',
  });

  const filePath = path.resolve(packageRootPath, 'src/operators/zip.mts');

  const getSnapshotLines = async (code: string): Promise<readonly number[]> => {
    const results = await eslint.lintText(code, { filePath });

    const messages = results.flatMap((r) => r.messages);

    // A probe that does not parse, or a path ESLint ignores, yields no report,
    // which an empty expectation would accept: both come as a message of no
    // rule.
    assert.deepStrictEqual(
      messages.filter((m) => m.ruleId === null),
      [],
    );

    return messages
      .filter(
        (m) =>
          m.ruleId === 'no-restricted-syntax' &&
          m.message === getSnapshotBan.message,
      )
      .map((m) => m.line);
  };

  test('refuses each read by that name once, with up to three type wrappers on the key', async () => {
    const lines = await getSnapshotLines(
      [
        'declare const o: Readonly<{ getSnapshot: () => number }>;',
        'export const a = o.getSnapshot();',
        "export const b = o['getSnapshot']();",
        'export const c = o[`getSnapshot`]();',
        'export const d = o.getSnapshot.call(o);',
        'export const e = (o as typeof o).getSnapshot();',
        "export const f = o['getSnapshot' as const]();",
        "export const g = o['getSnapshot' satisfies string]();",
        "export const h = o[<'getSnapshot'>'getSnapshot']();",
        "export const i = o['getSnapshot'!]();",
        'export const j = o?.getSnapshot();',
        "export const k = o['getSnapshot' as 'getSnapshot']();",
        "export const l = o['getSnapshot' as const as 'getSnapshot']();",
        "export const m = o[('getSnapshot' as const)! satisfies string]();",
        'export const n = ({ getSnapshot: 1 }).getSnapshot;',
        "export const p = o?.['getSnapshot']();",
        "export const q = o[('getSnapshot')]();",
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(
      lines,
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    );
  }, 60_000);

  // The limit of `getSnapshotKeys` (configs/eslint/rules/get-snapshot-ban.mts),
  // recorded so that a change to it is seen: a fourth wrapper is not looked
  // through.
  test('does not see a key under four type wrappers', async () => {
    const lines = await getSnapshotLines(
      [
        'declare const o: Readonly<{ getSnapshot: () => number }>;',
        "export const a = o[('getSnapshot' as const satisfies string as 'getSnapshot')!]();",
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);

  test('leaves a key that is not the literal, Reflect.get and destructuring', async () => {
    const lines = await getSnapshotLines(
      [
        'declare const o: Readonly<Record<string, () => number>>;',
        "declare const k: 'getSnapshot';",
        'declare const names: readonly string[];',
        'declare const xs: readonly (() => number)[];',
        'export const a = o[k]();',
        "export const b = o[k as 'getSnapshot']();",
        "export const c = xs[names.indexOf('getSnapshot')];",
        "export const d = Reflect.get(o, 'getSnapshot');",
        'export const { getSnapshot } = o;',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);
});
