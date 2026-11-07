import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCatch } from './prefer-catch.mjs';

const tester = new RuleTester({
  languageOptions: { parser, parserOptions: { sourceType: 'module' } },
});

const messageId = 'preferCatchToThen';

describe('prefer-catch (suggestion only)', () => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- an ESLint rule module, which RuleTester runs as it is
  tester.run('prefer-catch', preferCatch as never, {
    valid: ['p.then(a);', 'p.catch(b);', 'p.then(a).catch(b);'],
    invalid: [
      {
        name: 'both handlers: reported, the rewrite only suggested',
        code: 'p.then(a, b);',
        output: null,
        errors: [
          {
            messageId,
            suggestions: [{ messageId, output: 'p.catch(b).then(a);' }],
          },
        ],
      },
      {
        name: 'a null fulfillment handler',
        code: 'p.then(null, b);',
        output: null,
        errors: [
          {
            messageId,
            suggestions: [{ messageId, output: 'p.catch(b);' }],
          },
        ],
      },
    ],
  });
});
