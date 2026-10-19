import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { tsStdForgeRules } from './rules.mjs';

const tester = new RuleTester();

// Playwright runs the function given to `page.evaluate` in the page, where
// nothing the test file imports exists: a fix calling ts-std-forge there
// fails at runtime.
describe('the rules in functions that run in the browser', () => {
  tester.run(
    'prefer-is-non-null-object',
    tsStdForgeRules['prefer-is-non-null-object'],
    {
      valid: [
        {
          name: 'a function passed to page.evaluate',
          code: dedent`
            await page.evaluate((u) => typeof u === 'object' && u !== null, 1);
          `,
        },
      ],
      invalid: [
        {
          name: 'the import goes with the first fix outside',
          code: dedent`
            await page.evaluate(() => typeof u === 'object' && u !== null);
            const ok = typeof v === 'object' && v !== null;
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-std-forge';
            await page.evaluate(() => typeof u === 'object' && u !== null);
            const ok = isNonNullObject(v);
          `,
          errors: [{ messageId: 'useIsNonNullObject', line: 2 }],
        },
      ],
    },
  );
});
