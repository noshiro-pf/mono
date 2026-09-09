import { type CheckerDiagnostic } from '@sumi-lang/checker';
import { type OxlintDiagnostic } from '@sumi-lang/oxlint-config';
import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { applyExpectErrors } from '../src/index.mjs';

/**
 * `no-var` is `eslint(no-var)` in the preset's mapping, so a diagnostic with
 * that code is the neutral `banned-syntax/no-var` a marker names.
 */
const lintDiagnostic = (
  filename: string,
  line: number,
  code = 'eslint(no-var)',
): OxlintDiagnostic =>
  ({
    code,
    message: 'unexpected var',
    severity: 'error',
    filename,
    line,
  }) as const;

/** The checker reports the neutral ID directly, with no mapping in between. */
const checkerDiagnostic = (
  fileName: string,
  line: number,
  ruleId = 'null/no-null-propagation',
): CheckerDiagnostic =>
  ({
    ruleId,
    messageId: 'inferredNull',
    fileName,
    line,
    column: 1,
    message: 'This declaration takes a `null` from its initializer.',
  }) as const;

const withFile = <T,>(source: string, run: (fixturePath: string) => T): T => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-expect-'));

  const fixture = path.join(dir, 'fixture.mts');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(fixture, source, 'utf8');

  try {
    return run(fixture);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

describe(applyExpectErrors, () => {
  test('suppresses the diagnostic the marker names', () => {
    withFile(
      dedent`
        // @sumi-expect-error banned-syntax/no-var
        var x = 1;
      `,
      (file) => {
        const result = applyExpectErrors([file], [lintDiagnostic(file, 2)], []);

        assert.deepStrictEqual(result.lint, []);

        assert.deepStrictEqual(result.unused, []);
      },
    );
  });

  test('reports a marker no diagnostic answered, like @ts-expect-error', () => {
    withFile(
      dedent`
        // @sumi-expect-error banned-syntax/no-var
        const x = 1;
      `,
      (file) => {
        const result = applyExpectErrors([file], [], []);

        assert.deepStrictEqual(result.lint, []);

        assert.deepStrictEqual(result.unused, [
          { filename: file, line: 1, ruleId: 'banned-syntax/no-var' },
        ]);
      },
    );
  });

  test('leaves a diagnostic on another line alone', () => {
    withFile(
      dedent`
        // @sumi-expect-error banned-syntax/no-var
        var x = 1;
        var y = 2;
      `,
      (file) => {
        const observed = [
          lintDiagnostic(file, 2),
          lintDiagnostic(file, 3),
        ] as const;

        const result = applyExpectErrors([file], observed, []);

        assert.deepStrictEqual(result.lint, [lintDiagnostic(file, 3)]);

        assert.deepStrictEqual(result.unused, []);
      },
    );
  });

  test('a marker naming a different rule does not suppress, and is unused', () => {
    withFile(
      dedent`
        // @sumi-expect-error banned-syntax/no-class
        var x = 1;
      `,
      (file) => {
        const observed = [lintDiagnostic(file, 2)] as const;

        const result = applyExpectErrors([file], observed, []);

        assert.deepStrictEqual(result.lint, observed);

        assert.deepStrictEqual(result.unused, [
          { filename: file, line: 1, ruleId: 'banned-syntax/no-class' },
        ]);
      },
    );
  });

  test('the file-scoped form matches any line and reports line 0 when unused', () => {
    withFile(
      dedent`
        // @sumi-expect-error-file banned-syntax/no-var
        const a = 1;
        var b = 2;
      `,
      (file) => {
        assert.deepStrictEqual(
          applyExpectErrors([file], [lintDiagnostic(file, 3)], []).lint,
          [],
        );

        assert.deepStrictEqual(applyExpectErrors([file], [], []).unused, [
          { filename: file, line: 0, ruleId: 'banned-syntax/no-var' },
        ]);
      },
    );
  });

  test('a file with no markers is left exactly as it was', () => {
    withFile('const x = 1;\n', (file) => {
      const observed = [lintDiagnostic(file, 1)] as const;

      const result = applyExpectErrors([file], observed, []);

      assert.deepStrictEqual(result.lint, observed);

      assert.deepStrictEqual(result.unused, []);
    });
  });

  test('suppresses a checker diagnostic the marker names', () => {
    withFile(
      dedent`
        // @sumi-expect-error null/no-null-propagation
        const y = f();
      `,
      (file) => {
        const result = applyExpectErrors(
          [file],
          [],
          [checkerDiagnostic(file, 2)],
        );

        assert.deepStrictEqual(result.checker, []);

        assert.deepStrictEqual(result.unused, []);
      },
    );
  });

  test('a marker the other engine answered is not reported as unused', () => {
    // The two engines are matched in one pass, so a checker diagnostic answers
    // its marker even though the oxlint list holds nothing on that line, and
    // the other way round.
    withFile(
      dedent`
        // @sumi-expect-error null/no-null-propagation
        const y = f();
        // @sumi-expect-error banned-syntax/no-var
        var z = 1;
      `,
      (file) => {
        const result = applyExpectErrors(
          [file],
          [lintDiagnostic(file, 4)],
          [checkerDiagnostic(file, 2)],
        );

        assert.deepStrictEqual(result.lint, []);

        assert.deepStrictEqual(result.checker, []);

        assert.deepStrictEqual(result.unused, []);
      },
    );
  });

  test('an unreadable file is skipped rather than throwing', () => {
    const missing = path.join(os.tmpdir(), 'sumi-expect-does-not-exist.mts');

    const observed = [lintDiagnostic(missing, 1)] as const;

    assert.deepStrictEqual(
      applyExpectErrors([missing], observed, []).lint,
      observed,
    );
  });
});
