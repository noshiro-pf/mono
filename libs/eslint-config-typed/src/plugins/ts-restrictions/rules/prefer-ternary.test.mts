import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferTernary } from './prefer-ternary.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

describe('prefer-ternary', () => {
  tester.run('prefer-ternary', preferTernary, {
    valid: [
      {
        name: 'a branch with more than one statement',
        code: dedent`
          function f(a) {
            if (a) {
              foo();
              return 1;
            }
            return 2;
          }
        `,
      },
      {
        name: 'two boolean literals are a condition, not a choice',
        code: dedent`
          function f(a) {
            if (a) return true;
            else return false;
          }
        `,
      },
      {
        name: 'a chain of boolean literals only',
        code: dedent`
          function f(a, b) {
            if (a) return true;
            if (b) return false;
            return true;
          }
        `,
      },
      {
        name: 'a ternary in a branch that is not the last',
        code: dedent`
          function f(a, b) {
            if (a) return b ? 1 : 2;
            return 3;
          }
        `,
      },
      {
        name: 'a ternary as the test',
        code: dedent`
          function f(a, b) {
            if (a ? b : 0) return 1;
            return 2;
          }
        `,
      },
      {
        name: 'an assignment without else falls through, so it is not a choice',
        code: dedent`
          let x;
          if (a) x = 1;
          x = 2;
        `,
      },
      {
        name: 'assignments to different targets',
        code: dedent`
          let x, y;
          if (a) x = 1;
          else y = 2;
        `,
      },
      {
        name: 'assignments with different operators',
        code: dedent`
          let x;
          if (a) x = 1;
          else x += 2;
        `,
      },
      {
        name: 'a statement between the branch and the fallback',
        code: dedent`
          function f(a) {
            if (a) return 1;
            foo();
            return 2;
          }
        `,
      },
      {
        name: 'an else-if whose parent branch cannot be folded',
        code: dedent`
          function f(a, b) {
            if (a) {
              foo();
              return 1;
            } else if (b) {
              bar();
              return 2;
            } else return 3;
          }
        `,
      },
      {
        name: 'only-single-line: a test spanning lines',
        options: ['only-single-line'],
        code: dedent`
          function f(a, b) {
            if (
              a &&
              b
            ) return 1;
            return 2;
          }
        `,
      },
      {
        name: 'only-single-line: a fallback spanning lines',
        options: ['only-single-line'],
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            return g(
              b,
            );
          }
        `,
      },
      {
        name: 'only-single-line: a branch of the fallback ternary spanning lines',
        options: ['only-single-line'],
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            return b
              ? g(
                  2,
                )
              : 3;
          }
        `,
      },
      {
        name: 'a comment in a chain only this rule would fold',
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            // why the rest
            return b ? 2 : 3;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'if-else returning',
        code: dedent`
          function f(a) {
            if (a) return 1;
            else return 2;
          }
        `,
        output: dedent`
          function f(a) {
            return a ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 2 }],
      },
      {
        name: 'if-else returning, in blocks',
        code: dedent`
          function f(a) {
            if (a) {
              return 1;
            } else {
              return 2;
            }
          }
        `,
        output: dedent`
          function f(a) {
            return a ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'if returning, then a return',
        code: dedent`
          function f(a) {
            if (a) return 1;
            return 2;
          }
        `,
        output: dedent`
          function f(a) {
            return a ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'a bare return reads as undefined',
        code: dedent`
          function f(a, b) {
            if (a) return;
            return b;
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? undefined : b;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'if-else assigning',
        code: dedent`
          let x;
          if (a) x = 1;
          else x = 2;
        `,
        output: dedent`
          let x;
          x = a ? 1 : 2;
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'if-else assigning a member with a compound operator',
        code: dedent`
          if (a) {
            o.x += 1;
          } else {
            o['x'] += 2;
          }
        `,
        output: dedent`
          o.x += a ? 1 : 2;
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'returning an assignment folds both layers',
        code: dedent`
          function f(a) {
            if (a) return x = 1;
            return x = 2;
          }
        `,
        output: dedent`
          function f(a) {
            return x = a ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'operands of low precedence are parenthesized',
        code: dedent`
          async function f(a) {
            if (a) return await g();
            return await h();
          }
        `,
        output: dedent`
          async function f(a) {
            return a ? (await g()) : (await h());
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: two ifs and a return',
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            if (b) return 2;
            return 3;
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? 1 : b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 2 }],
      },
      {
        name: 'chain: an if before a return of a ternary',
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            return b ? 2 : 3;
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? 1 : b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: two ifs before a return of a ternary',
        code: dedent`
          function f(a, b, c) {
            if (a) return 1;
            if (b) return 2;
            return c ? 3 : 4;
          }
        `,
        output: dedent`
          function f(a, b, c) {
            return a ? 1 : b ? 2 : c ? 3 : 4;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: else-if returning',
        code: dedent`
          function f(a, b) {
            if (a) {
              return 1;
            } else if (b) {
              return 2;
            } else {
              return 3;
            }
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? 1 : b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: else-if without else, then a return',
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            else if (b) return 2;
            return 3;
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? 1 : b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: else-if assigning',
        code: dedent`
          let x;
          if (a) x = 1;
          else if (b) x = 2;
          else x = 3;
        `,
        output: dedent`
          let x;
          x = a ? 1 : b ? 2 : 3;
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: booleans mixed with other values',
        code: dedent`
          function f(a, b) {
            if (a) return true;
            if (b) return false;
            return c;
          }
        `,
        output: dedent`
          function f(a, b) {
            return a ? true : b ? false : c;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'chain: starts after the statements that cannot join it',
        code: dedent`
          function f(a, b) {
            foo();
            if (p) {
              bar();
              return 0;
            }
            if (a) return 1;
            if (b) return 2;
            return 3;
          }
        `,
        output: dedent`
          function f(a, b) {
            foo();
            if (p) {
              bar();
              return 0;
            }
            return a ? 1 : b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 7 }],
      },
      {
        name: 'a returning if before an if-else assigning is left alone',
        code: dedent`
          function f(a, b) {
            if (a) return 1;
            if (b) x = 1;
            else x = 2;
          }
        `,
        output: dedent`
          function f(a, b) {
            if (a) return 1;
            x = b ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 3 }],
      },
      {
        name: 'a comment in a chain leaves the chain alone, and folds what follows it',
        code: dedent`
          function f(a, b) {
            // the common case
            if (a) return 1;
            // the rare one
            if (b) return 2;
            return 3;
          }
        `,
        output: dedent`
          function f(a, b) {
            // the common case
            if (a) return 1;
            // the rare one
            return b ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 5 }],
      },
      {
        name: 'a comment where unicorn would report is reported without a fix',
        code: dedent`
          function f(a) {
            if (a) {
              // why one
              return 1;
            }
            return 2;
          }
        `,
        output: null,
        errors: [{ messageId: 'preferTernary', line: 2 }],
      },
      {
        name: 'a trailing comment on the fallback is reported without a fix',
        code: dedent`
          function f(a) {
            if (a) return 1;
            return 2; // why two
          }
        `,
        output: null,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'only-single-line: the chain starts below a test spanning lines',
        options: ['only-single-line'],
        code: dedent`
          function f(a, b, c) {
            if (
              a &&
              b
            ) return 1;
            if (c) return 2;
            return 3;
          }
        `,
        output: dedent`
          function f(a, b, c) {
            if (
              a &&
              b
            ) return 1;
            return c ? 2 : 3;
          }
        `,
        errors: [{ messageId: 'preferTernary', line: 6 }],
      },
      {
        name: 'only-single-line: a fallback ternary wrapped over lines, each part on one',
        options: ['only-single-line'],
        code: dedent`
          function f(a, b, c) {
            if (a) return 1;
            return b
              ? 2
              : c
                ? 3
                : 4;
          }
        `,
        output: dedent`
          function f(a, b, c) {
            return a ? 1 : b
              ? 2
              : c
                ? 3
                : 4;
          }
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'a leading semicolon where the replacement would join the line before',
        code: dedent`
          foo()
          if (a) (x).y = 1;
          else (x).y = 2;
        `,
        output: dedent`
          foo()
          ;(x).y = a ? 1 : 2;
        `,
        errors: [{ messageId: 'preferTernary' }],
      },
      {
        name: 'let then if: suggested, not fixed',
        code: dedent`
          let x = 1;
          if (a) x = 2;
        `,
        output: null,
        errors: [
          {
            messageId: 'preferTernary',
            suggestions: [
              {
                messageId: 'preferTernarySuggestion',
                output: dedent`
                  const x = a ? 2 : 1;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'let then if: stays let when written elsewhere',
        code: dedent`
          let x = 1;
          if (a) x = 2;
          x = 3;
        `,
        output: null,
        errors: [
          {
            messageId: 'preferTernary',
            suggestions: [
              {
                messageId: 'preferTernarySuggestion',
                output: dedent`
                  let x = a ? 2 : 1;
                  x = 3;
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
