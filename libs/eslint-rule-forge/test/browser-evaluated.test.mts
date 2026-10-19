import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import dedent from 'dedent';
import { skipBrowserEvaluatedFunctions } from '../src/index.mjs';

const ruleTester = new RuleTester();

/**
 * Reports every `probe()` call, collected while the file is walked and
 * reported at `Program:exit`, as the plugin rules do so that their first
 * report can carry the import fix.
 */
const probeCalls: TSESLint.RuleModule<'probe'> = {
  meta: {
    type: 'problem',
    messages: { probe: 'probe' },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const mut_calls: TSESTree.CallExpression[] = [];

    return {
      CallExpression: (node) => {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'probe'
        ) {
          mut_calls.push(node);
        }
      },
      'Program:exit': () => {
        for (const node of mut_calls) {
          context.report({ node, messageId: 'probe' });
        }
      },
    };
  },
};

describe(skipBrowserEvaluatedFunctions, () => {
  ruleTester.run('probe', skipBrowserEvaluatedFunctions(probeCalls), {
    valid: [
      {
        name: 'a function Playwright or Puppeteer runs in the page',
        code: dedent`
          await page.evaluate(() => probe());
          await page.evaluateHandle(() => probe());
          await locator.evaluate((node) => { probe(); });
          await locator.evaluateAll(function (nodes) { probe(); });
          await page.waitForFunction(() => probe());
          await page.addInitScript(() => probe());
          await page.$eval('a', (node) => probe());
          await page.$$eval('a', (nodes) => probe());
        `,
      },
      {
        name: 'a function nested in one',
        code: dedent`
          await page.evaluate((n) => [1, 2].map((x) => probe(x + n)), 1);
        `,
      },
      {
        name: 'a function behind a type wrapper or parentheses',
        code: dedent`
          await page.evaluate(((n) => probe(n)) as (n: number) => void, 1);
          await page.evaluate(((n) => probe(n)));
        `,
      },
    ],
    invalid: [
      {
        name: 'a call outside, and the arguments passed into the page, which run here',
        code: dedent`
          probe();
          await page.evaluate((n) => n, probe());
          const xs = [1].map(() => probe());
          evaluate(() => probe());
        `,
        errors: [
          { messageId: 'probe', line: 1 },
          { messageId: 'probe', line: 2 },
          { messageId: 'probe', line: 3 },
          { messageId: 'probe', line: 4 },
        ],
      },
    ],
  });
});
