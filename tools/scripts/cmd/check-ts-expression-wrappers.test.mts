import { Arr } from 'ts-data-forge';
import {
  HELPER_MODULE,
  PUBLISHED_HELPER_MODULE,
  copiedWrapperKinds,
  isCheckedModule,
  predicatesCalledIn,
  wrapperKindsTestedIn,
  wrapperListProblems,
} from './check-ts-expression-wrappers.mjs';

describe(wrapperKindsTestedIn, () => {
  const predicates = [
    'isParenthesizedExpression',
    'isAsExpression',
    'isSatisfiesExpression',
    'isNonNullExpression',
  ] as const;

  test('names each wrapper kind a module tests for', () => {
    assert.deepStrictEqual(
      wrapperKindsTestedIn(
        'ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e)',
        predicates,
      ),
      ['isParenthesizedExpression', 'isAsExpression', 'isNonNullExpression'],
    );
  });

  test('names none in a module that calls the helper', () => {
    assert.deepStrictEqual(
      wrapperKindsTestedIn(
        'skipExpressionWrappers(e); ts.isIdentifier(e)',
        predicates,
      ),
      [],
    );
  });
});

describe(predicatesCalledIn, () => {
  test('names each `ts.is…(` call once', () => {
    assert.deepStrictEqual(
      predicatesCalledIn(
        'ts.isAsExpression(n) || ts.isIdentifier(n) || ts.isAsExpression(m) || parts.isNonNullExpression(n)',
      ),
      ['isAsExpression', 'isIdentifier'],
    );
  });
});

describe(wrapperListProblems, () => {
  const published = [
    'isParenthesizedExpression',
    'isAsExpression',
    'isSatisfiesExpression',
    'isNonNullExpression',
    'isTypeAssertionExpression',
  ] as const;

  const tools = Arr.toPushed(published, 'isExpressionWithTypeArguments');

  test('names a wrapper CLAUDE.md names that the tools helper dropped', () => {
    const dropped = tools.filter(
      (predicate) => predicate !== 'isSatisfiesExpression',
    );

    const problems = wrapperListProblems(
      dropped,
      published.filter((predicate) => predicate !== 'isSatisfiesExpression'),
    );

    assert.strictEqual(problems.length, 1);

    assert.include(
      problems[0],
      'tools/scripts/lib/ts-expression-wrappers.mts does not call ts.isSatisfiesExpression, a wrapper CLAUDE.md',
    );
  });

  test('none when eslint-rule-forge has the tools list less instantiation expressions', () => {
    assert.deepStrictEqual(wrapperListProblems(tools, published), []);
  });

  test.each([
    [
      'a kind added to the tools helper alone',
      [...tools, 'isPartiallyEmittedExpression'],
      published,
      'libs/eslint-rule-forge/src/ts-type-wrappers.mts does not call ts.isPartiallyEmittedExpression',
    ],
    [
      'a kind added to eslint-rule-forge alone',
      tools,
      Arr.toPushed(published, 'isPartiallyEmittedExpression'),
      'libs/eslint-rule-forge/src/ts-type-wrappers.mts calls ts.isPartiallyEmittedExpression, which tools/',
    ],
    [
      'a tools-only kind eslint-rule-forge calls',
      tools,
      tools,
      'calls ts.isExpressionWithTypeArguments, which TOOLS_ONLY_PREDICATES in this guard keeps out of it',
    ],
    [
      'a tools-only kind the tools helper no longer calls',
      published,
      published,
      'tools/scripts/lib/ts-expression-wrappers.mts does not call ts.isExpressionWithTypeArguments',
    ],
  ] as const)('names %s', (_, toolsCalled, publishedCalled, expected) => {
    const problems = wrapperListProblems(toolsCalled, publishedCalled);

    assert.strictEqual(problems.length, 1);

    assert.include(problems[0], expected);
  });
});

describe(copiedWrapperKinds, () => {
  const predicates = [
    'isParenthesizedExpression',
    'isAsExpression',
    'isExpressionWithTypeArguments',
  ] as const;

  test('names three kinds or more', () => {
    assert.deepStrictEqual(
      copiedWrapperKinds(
        'ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isExpressionWithTypeArguments(e)',
        predicates,
      ),
      [
        'isParenthesizedExpression',
        'isAsExpression',
        'isExpressionWithTypeArguments',
      ],
    );
  });

  test('names none below three', () => {
    assert.deepStrictEqual(
      copiedWrapperKinds(
        'ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isIdentifier(e)',
        predicates,
      ),
      [],
    );
  });
});

describe(isCheckedModule, () => {
  test.each([
    ['tools/scripts/cmd/foo.mts', true],
    ['libs/foo/scripts/bar.mts', true],
    ['apps/foo/scripts/bar.mts', true],
    ['libs/eslint-plugin-synstate/src/rules/foo.mts', true],
    [HELPER_MODULE, false],
    [PUBLISHED_HELPER_MODULE, false],
    ['libs/eslint-plugin-synstate/src/rules/foo.test.mts', false],
    ['libs/eslint-plugin-foo-next/src/foo.mts', false],
    ['libs/eslint-plugin-foo-v2/src/foo.mts', false],
    ['libs/ts-repo-utils/src/foo.mts', false],
    ['apps/foo/src/foo.mts', false],
    ['tools/configs/foo.json', false],
  ] as const)('%s: %s', (file, expected) => {
    assert.strictEqual(isCheckedModule(file), expected);
  });
});
