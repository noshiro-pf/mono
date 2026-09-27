import { type ContextState } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { planAutoFix } from './auto-fix.mjs';

const states = (
  entries: readonly (readonly [string, ContextState])[],
): ReadonlyMap<string, ContextState> => new Map(entries);

describe('planAutoFix', () => {
  test('runs the command a failed matrix entry names, with the build CI gave it', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'failed'],
        ['code-check (ws:check:types)', 'passed'],
        ['code-check-result / result', 'failed'],
        ['style-check (fix:fmt:full)', 'passed'],
      ]),
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value, {
      commands: ['fix:codemod:full'],
      build: true,
    });
  });

  test('builds for a style-check entry only where CI does', () => {
    const formatOnly = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['style-check (strict-lib:fix:fmt)', 'failed'],
        ['style-check-result / result', 'failed'],
      ]),
    );

    assert.isTrue(Result.isOk(formatOnly));

    assert.isFalse(formatOnly.value.build);

    const generated = planAutoFix(
      states([
        ['style-check (ws:gen)', 'failed'],
        ['style-check (gen:deps-graph)', 'failed'],
      ]),
    );

    assert.isTrue(Result.isOk(generated));

    assert.isTrue(generated.value.build);
  });

  test('runs generators first and formatters last', () => {
    const plan = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['code-check (ws:fix:lint)', 'failed'],
        ['style-check (ws:gen)', 'failed'],
        ['style-check (strict-lib:fix:fmt)', 'failed'],
        ['code-check (fix:codemod:full)', 'failed'],
        ['style-check (gen:license-files)', 'failed'],
      ]),
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, [
      'gen:license-files',
      'ws:gen',
      'fix:codemod:full',
      'ws:fix:lint',
      'fix:fmt:full',
      'strict-lib:fix:fmt',
    ]);
  });

  test('declines when any failure is not a fixer, naming it', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'failed'],
        ['code-check (ws:check:types)', 'failed'],
        ['code-check-result / result', 'failed'],
      ]),
    );

    assert.isTrue(Result.isErr(plan));

    expect(plan.value).toContain('code-check (ws:check:types)');

    expect(plan.value).not.toContain('fix:codemod:full');
  });

  test.each([
    ['a check command', 'code-check (ws:check:test:cov)'],
    ['`ws:doc`, whose output is untracked', 'style-check (ws:doc)'],
    ['a job of another workflow', 'Validate commit count'],
    ['a matrix entry of another workflow', 'test-node-versions (fix:x)'],
  ] as const)('declines %s', (_, name) => {
    const plan = planAutoFix(states([[name, 'failed']]));

    assert.isTrue(Result.isErr(plan));

    expect(plan.value).toContain(name);
  });

  test('declines when nothing but an aggregate failed', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'passed'],
        ['code-check-result / result', 'failed'],
      ]),
    );

    assert.isTrue(Result.isErr(plan));
  });

  test('reads only what failed; pending and skipped entries are not a plan', () => {
    const plan = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['code-check (ws:check:types)', 'pending'],
        ['code-check (ws:check:e2e)', 'skipped'],
      ]),
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, ['fix:fmt:full']);
  });
});
