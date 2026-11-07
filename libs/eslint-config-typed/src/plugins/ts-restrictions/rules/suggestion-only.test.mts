import { RuleTester, type Rule } from 'eslint';
import { pluginRule, suggestionOnly } from './suggestion-only.mjs';

// ESLint's own tester, whose suggestion outputs take a `desc` as ESLint does.
const tester = new RuleTester();

/** Reports every `x` identifier, with a `message` and a fix to `y`. */
const renameX: Rule.RuleModule = {
  meta: { type: 'suggestion', fixable: 'code', schema: [] },
  create: (context) => ({
    Identifier: (node) => {
      if (node.name === 'x') {
        context.report({
          node,
          message: 'Rename x.',
          fix: (fixer) => fixer.replaceText(node, 'y'),
        });
      }
    },
  }),
} as const;

/** Reports every `z` identifier, with no fix. */
const reportZ: Rule.RuleModule = {
  meta: { type: 'problem', schema: [], messages: { z: 'No z.' } },
  create: (context) => ({
    Identifier: (node) => {
      if (node.name === 'z') {
        context.report({ node, messageId: 'z' });
      }
    },
  }),
} as const;

describe(suggestionOnly, () => {
  tester.run('rename-x', suggestionOnly(renameX, 'test/rename-x'), {
    valid: ['y;'],
    invalid: [
      {
        name: 'a report with a message: its fix becomes a suggestion described by it',
        code: 'x;',
        output: null,
        errors: [
          {
            message: 'Rename x.',
            suggestions: [{ desc: 'Rename x.', output: 'y;' }],
          },
        ],
      },
    ],
  });

  tester.run('report-z', suggestionOnly(reportZ, 'test/report-z'), {
    valid: [],
    invalid: [
      {
        name: 'a report with no fix is passed on as it is',
        code: 'z;',
        output: null,
        errors: [{ messageId: 'z', suggestions: [] }],
      },
    ],
  });

  test('says which rule a plugin no longer has', () => {
    const rule = suggestionOnly(undefined, 'test/gone');

    assert.throws(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- create is not reached past the throw
      () => rule.create({} as Rule.RuleContext),
      'The plugin no longer has `test/gone`.',
    );
  });
});

describe(pluginRule, () => {
  test('finds a rule of a plugin module', () => {
    assert.strictEqual(pluginRule({ rules: { a: renameX } }, 'a'), renameX);
  });

  test('is undefined for a missing rule or a non-plugin', () => {
    assert.isUndefined(pluginRule({ rules: { a: renameX } }, 'b'));

    assert.isUndefined(pluginRule({ rules: { a: { create: 1 } } }, 'a'));

    assert.isUndefined(pluginRule(undefined, 'a'));
  });
});
