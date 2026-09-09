import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  runRules,
  type CheckerDiagnostic,
  type Rule,
} from '../src/engine/index.mjs';

/** A case the rule must accept. */
export type ValidCase = Readonly<{
  name: string;
  code: string;
}>;

/** A case the rule must report, and what it must report. */
export type InvalidCase = Readonly<{
  name: string;
  code: string;

  /**
   * One entry per expected diagnostic, in source order. `line` is 1-based and
   * relative to `code`.
   */
  errors: readonly Readonly<{ messageId: string; line: number }>[];
}>;

export type RuleCases = Readonly<{
  valid: readonly ValidCase[];
  invalid: readonly InvalidCase[];
}>;

/**
 * Runs one rule over a set of valid / invalid cases, in the shape the ESLint
 * `RuleTester` uses — which is what the plugin rules under `libs/eslint-*`
 * are tested with, so a rule reads the same wherever it lives.
 *
 * Every case becomes a file in one temporary project, and the whole project
 * is checked once: opening a program is the expensive part (~66 ms), and a
 * project per case would pay it per case. The cases are therefore compiled
 * together, so each one must stand alone as a module — give a binding a name
 * no other case uses if it would otherwise collide, or keep it local.
 *
 * Call it inside a `describe`; it declares one `test` per case.
 */
export const testRule = (rule: Rule, cases: RuleCases): void => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), `sumi-rule-${rule.ruleId.replaceAll('/', '-')}-`),
  );

  const fileOf = (kind: string, index: number): string =>
    path.join(dir, `${kind}-${index}.mts`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        module: 'nodenext',
        moduleResolution: 'nodenext',
        target: 'esnext',
        noEmit: true,
        types: [],
        lib: ['esnext'],
      },
      include: ['*.mts'],
    }),
  );

  for (const [index, testCase] of cases.valid.entries()) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(fileOf('valid', index), `${testCase.code.trim()}\n`);
  }

  for (const [index, testCase] of cases.invalid.entries()) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(fileOf('invalid', index), `${testCase.code.trim()}\n`);
  }

  const result = runRules(path.join(dir, 'tsconfig.json'), [rule]);

  const reported = (file: string): readonly CheckerDiagnostic[] =>
    (Result.isOk(result) ? result.value : []).filter(
      (diagnostic) => diagnostic.fileName === file,
    );

  test('the project opened', () => {
    // A project that failed to open reports nothing, which would make every
    // valid case pass and every invalid one fail confusingly.
    assert.isTrue(Result.isOk(result));
  });

  describe('valid', () => {
    test.each(
      cases.valid.map((testCase, index) => ({
        name: testCase.name,
        file: fileOf('valid', index),
      })),
    )('$name', ({ file }) => {
      assert.deepStrictEqual(
        reported(file).map((d) => `${d.line}:${d.messageId}`),
        [],
      );
    });
  });

  describe('invalid', () => {
    test.each(
      cases.invalid.map((testCase, index) => ({
        name: testCase.name,
        file: fileOf('invalid', index),
        expected: testCase.errors.map((e) => `${e.line}:${e.messageId}`),
      })),
    )('$name', ({ file, expected }) => {
      assert.deepStrictEqual(
        reported(file).map((d) => `${d.line}:${d.messageId}`),
        expected,
      );
    });
  });
};
