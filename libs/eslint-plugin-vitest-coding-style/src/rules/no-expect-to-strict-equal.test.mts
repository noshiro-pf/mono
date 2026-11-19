import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
  valid: [
    {
      code: 'assert.deepStrictEqual(actual, expected);',
    },
    {
      code: 'expect(actual).toBe(expected);',
    },
    {
      code: 'something.expect(actual).toStrictEqual(expected);',
    },
  ],
  invalid: [
    {
      code: 'expect(actual).toStrictEqual(expected);',
      output: 'assert.deepStrictEqual(actual, expected);',
      errors: [{ messageId: 'useAssert' }],
    },
    {
      code: dedent`
        expect(resultError[0]).toStrictEqual<ValidationError>({
          foo: 'bar',
        });
      `,
      output: dedent`
        assert.deepStrictEqual(resultError[0], ({
          foo: 'bar',
        }) as ValidationError);
      `,
      errors: [{ messageId: 'useAssert' }],
    },
  ],
});

describe('no-expect-to-strict-equal with a message', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'a spread argument to expect',
        code: dedent`
          expect(...args).toStrictEqual(expected);
          expect(actual, ...messages).toStrictEqual(expected);
        `,
      },
      {
        name: 'three or more arguments to expect',
        code: "expect(actual, 'context', extra).toStrictEqual(expected);",
      },
      {
        name: 'no argument to expect',
        code: 'expect().toStrictEqual(expected);',
      },
    ],
    invalid: [
      {
        name: 'the message is forwarded as the third argument',
        code: "expect(actual, 'context').toStrictEqual(expected);",
        output: "assert.deepStrictEqual(actual, expected, 'context');",
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a static message is fixed whatever the expected value does',
        code: dedent`
          expect(actual, 'context').toStrictEqual(next());
          expect(actual, \`context\`).toStrictEqual(next());
        `,
        output: dedent`
          assert.deepStrictEqual(actual, next(), 'context');
          assert.deepStrictEqual(actual, next(), \`context\`);
        `,
        errors: [{ messageId: 'useAssert' }, { messageId: 'useAssert' }],
      },
      {
        name: 'a message with an effect is fixed when the expected value is a literal',
        code: dedent`
          expect(actual, describe()).toStrictEqual('x');
        `,
        output: dedent`
          assert.deepStrictEqual(actual, 'x', describe());
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a message and an expected value with no effect are fixed',
        code: dedent`
          expect(actual, \`case \${c?.name}\`).toStrictEqual(c?.expected);
        `,
        output: dedent`
          assert.deepStrictEqual(actual, c?.expected, \`case \${c?.name}\`);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a tagged template only in a function body runs nothing when evaluated, so it is fixed',
        code: dedent`
          expect(actual, \`case \${c.name}\`).toStrictEqual({ render: () => html\`<p/>\` });
        `,
        output: dedent`
          assert.deepStrictEqual(actual, { render: () => html\`<p/>\` }, \`case \${c.name}\`);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'spreading an iterator into the expected value may change what the message reads',
        code: dedent`
          expect(actual, \`seen \${it.count}\`).toStrictEqual([...it]);
        `,
        output: null,
        errors: [{ messageId: 'useAssertMovingMessage' }],
      },
      {
        name: 'a message expression and a type argument, with an expected value that has no effect',
        code: dedent`
          expect(actual, \`case \${c.name}\`).toStrictEqual<Foo>({
            foo: c.expected,
            bar: [1, -x, a ? b : 'c'],
          });
        `,
        output: dedent`
          assert.deepStrictEqual(actual, ({
            foo: c.expected,
            bar: [1, -x, a ? b : 'c'],
          }) as Foo, \`case \${c.name}\`);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a wrapped message keeps its wrapper; parentheses are dropped',
        code: dedent`
          expect(actual, 'context' as string).toStrictEqual(expected);
          expect(actual, 'context' satisfies string).toStrictEqual(expected);
          expect(actual, <string>context).toStrictEqual(expected);
          expect(actual, context!).toStrictEqual(expected);
          expect(actual, (context)).toStrictEqual(expected);
        `,
        output: dedent`
          assert.deepStrictEqual(actual, expected, 'context' as string);
          assert.deepStrictEqual(actual, expected, 'context' satisfies string);
          assert.deepStrictEqual(actual, expected, <string>context);
          assert.deepStrictEqual(actual, expected, context!);
          assert.deepStrictEqual(actual, expected, context);
        `,
        errors: [
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
        ],
      },
      {
        name: 'a non-static message whose order against an effect could matter: reported, not fixed',
        code: dedent`
          expect(next(), \`step \${i++}\`).toStrictEqual(table[i]);
          expect(actual, label).toStrictEqual(advance());
          expect(actual, label).toStrictEqual(await load());
          expect(actual, \`case \${state}\`).toStrictEqual({ ...step() });
          expect(actual, (log(), 'context')).toStrictEqual(expected);
          expect(actual, describe() as string).toStrictEqual(expected);
          expect(actual, label).toStrictEqual((count = 1) satisfies number);
          expect(actual, label).toStrictEqual(table[k++]);
          expect(actual, label).toStrictEqual({ [next()]: 1 });
          expect(actual, label).toStrictEqual(new Foo());
          expect(actual, label).toStrictEqual(delete table.k);
          expect(actual, label).toStrictEqual(tag\`x\`);
        `,
        output: null,
        errors: [
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
          { messageId: 'useAssertMovingMessage' },
        ],
      },
    ],
  });
});

describe('no-expect-to-strict-equal through type wrappers', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'a wrapped callee that is not expect',
        code: '(something as typeof expect)(actual).toStrictEqual(expected);',
      },
    ],
    invalid: [
      {
        name: 'a wrapped expect call or expect function',
        code: dedent`
          expect(actual)!.toStrictEqual(expected);
          (expect as typeof expect)(actual).toStrictEqual(expected);
          expect!(actual).toStrictEqual(expected);
          expect(actual).toStrictEqual!(expected);
        `,
        output: dedent`
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
        ],
      },
      {
        name: 'wrapped arguments keep their wrappers',
        code: 'expect(actual as Foo).toStrictEqual(expected satisfies Foo);',
        output:
          'assert.deepStrictEqual(actual as Foo, expected satisfies Foo);',
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });
});

describe('no-expect-to-strict-equal with parenthesized operands', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [],
    invalid: [
      {
        name: 'a sequence expression stays one argument',
        code: dedent`
          expect((setup(), actual)).toStrictEqual(expected);
          expect(actual).toStrictEqual((setup(), expected));
        `,
        output: dedent`
          assert.deepStrictEqual((setup(), actual), expected);
          assert.deepStrictEqual(actual, (setup(), expected));
        `,
        errors: [{ messageId: 'useAssert' }, { messageId: 'useAssert' }],
      },
    ],
  });
});

describe('no-expect-to-strict-equal resolves expect and assert', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'Playwright’s expect',
        code: dedent`
          import { expect } from '@playwright/test';
          expect(actual).toStrictEqual(expected);
        `,
      },
      {
        name: 'toStrictEqual on something other than a call',
        code: 'matcher.toStrictEqual(expected);',
      },
      {
        name: 'a local expect',
        code: dedent`
          const expect = makeExpect();
          expect(actual).toStrictEqual(expected);
        `,
      },
    ],
    invalid: [
      {
        name: 'an expect aliased from vitest',
        code: dedent`
          import { assert, expect as e } from 'vitest';
          e(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import { assert, expect as e } from 'vitest';
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'an assert from node:assert in scope is reported, not fixed',
        code: dedent`
          import assert from 'node:assert';
          import { expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a local assert shadowing the global is reported, not fixed',
        code: dedent`
          export const f = (assert) => {
            expect(actual).toStrictEqual(expected);
          };
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'an assert from node:assert beside the expect global',
        code: dedent`
          import assert from 'node:assert';
          expect(actual).toStrictEqual(expected);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'no assert in scope beside an imported expect: the import gains it',
        code: dedent`
          import { expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import { expect, assert } from 'vitest';
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'several fixes in one file add the import once',
        code: dedent`
          import { expect } from 'vitest';
          expect(a).toStrictEqual(b);
          expect(c).toStrictEqual(d);
        `,
        output: [
          dedent`
            import { expect, assert } from 'vitest';
            assert.deepStrictEqual(a, b);
            expect(c).toStrictEqual(d);
          `,
          dedent`
            import { expect, assert } from 'vitest';
            assert.deepStrictEqual(a, b);
            assert.deepStrictEqual(c, d);
          `,
        ],
        errors: [{ messageId: 'useAssert' }, { messageId: 'useAssert' }],
      },
      {
        name: 'Vitest’s assert under an alias is written by its local name',
        code: dedent`
          import assert from 'node:assert';
          import { assert as va, expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import assert from 'node:assert';
          import { assert as va, expect } from 'vitest';
          va.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });
});

describe('no-expect-to-strict-equal against an asymmetric matcher', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'a matcher inside the expected object',
        code: dedent`
          import { expect } from 'vitest';
          expect({ id: 1, at: new Date() }).toStrictEqual({ id: 1, at: expect.any(Date) });
        `,
      },
      {
        name: 'a matcher as the expected value',
        code: dedent`
          import { expect } from 'vitest';
          expect([1, 2]).toStrictEqual(expect.arrayContaining([1]));
        `,
      },
      {
        name: 'an aliased expect',
        code: dedent`
          import { expect as e } from 'vitest';
          e({ a: 1 }).toStrictEqual({ a: e.anything() });
        `,
      },
      {
        name: 'a matcher inside a type wrapper',
        code: dedent`
          import { expect } from 'vitest';
          expect(x).toStrictEqual(expect.anything() satisfies unknown);
        `,
      },
      {
        name: 'the global expect, with no import',
        code: 'expect(x).toStrictEqual({ a: expect.stringMatching(/a/u) });',
      },
      {
        name: 'a matcher behind a type wrapper on expect',
        code: dedent`
          import { expect } from 'vitest';
          expect(x).toStrictEqual({ a: expect!.any(Date) });
          expect(x).toStrictEqual({ a: (expect as any).custom() });
        `,
      },
      {
        name: 'expect handed to a helper that builds matchers',
        code: dedent`
          import { expect } from 'vitest';
          expect(x).toStrictEqual(withTimestamps(expect));
        `,
      },
      {
        name: 'a matcher in the decorator of a class expression',
        code: dedent`
          import { expect } from 'vitest';
          expect(x).toStrictEqual(@dec(expect.any(Date)) class {});
        `,
      },
      {
        name: 'a matcher reached through a namespace, a test context or the in-source handle',
        code: dedent`
          import { expect, test } from 'vitest';
          import * as v from 'vitest';
          expect(x).toStrictEqual({ at: v.expect.any(Date) });
          test('t', (ctx) => {
            expect(x).toStrictEqual({ at: ctx.expect.any(Date) });
          });
          expect(x).toStrictEqual({ at: import.meta.vitest.expect.any(Date) });
        `,
      },
      {
        name: 'an expect member through a type wrapper, a computed key, or handed to a helper',
        code: dedent`
          import { expect } from 'vitest';
          import * as v from 'vitest';
          expect(x).toStrictEqual({ at: v.expect!.any(Date) });
          expect(x).toStrictEqual({ at: (v.expect as typeof v.expect).any(Date) });
          expect(x).toStrictEqual({ at: v['expect'].any(Date) });
          expect(x).toStrictEqual({ at: v[\`expect\`].any(Date) });
          expect(x).toStrictEqual({ at: (v.expect satisfies unknown) });
          expect(x).toStrictEqual({ at: v['expect' as const].any(Date) });
          expect(x).toStrictEqual(withTimestamps(v.expect));
        `,
      },
      {
        name: 'a fixture field named expect is read as one, by spelling',
        code: 'expect(o.expect).toStrictEqual(c.expect.output);',
      },
      {
        name: 'a matcher on the actual side',
        code: 'expect(expect.any(Number)).toStrictEqual(1);',
      },
      {
        name: 'a matcher from the expect of a test context',
        code: dedent`
          import { test } from 'vitest';
          test('t', ({ expect }) => {
            expect(a).toStrictEqual({ at: expect.any(Date) });
          });
        `,
      },
    ],
    invalid: [
      {
        name: 'a property key spelled expect is no reference to it',
        code: 'expect(o).toStrictEqual({ expect: 1 });',
        output: 'assert.deepStrictEqual(o, { expect: 1 });',
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a call through a member named expect is no matcher',
        code: dedent`
          expect(o).toStrictEqual(ctx.expect(1));
          expect(o).toStrictEqual(ctx.expect?.(1));
          expect(o).toStrictEqual((ctx.expect)(1));
          expect(o).toStrictEqual((ctx.expect satisfies unknown)(1));
          expect(o).toStrictEqual((ctx?.expect)(1));
        `,
        output: dedent`
          assert.deepStrictEqual(o, ctx.expect(1));
          assert.deepStrictEqual(o, ctx.expect?.(1));
          assert.deepStrictEqual(o, (ctx.expect)(1));
          assert.deepStrictEqual(o, (ctx.expect satisfies unknown)(1));
          assert.deepStrictEqual(o, (ctx?.expect)(1));
        `,
        errors: [
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
        ],
      },
      {
        name: "a binding that shadows expect is not Vitest's",
        code: 'expect(o).toStrictEqual([1].map((expect) => expect.valueOf()));',
        output:
          'assert.deepStrictEqual(o, [1].map((expect) => expect.valueOf()));',
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a mention of expect in a type is no matcher',
        code: 'expect(x).toStrictEqual(y as ReturnType<typeof expect>);',
        output: 'assert.deepStrictEqual(x, y as ReturnType<typeof expect>);',
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a type named under expect is no matcher',
        code: 'expect(x).toStrictEqual(y as expect.Foo);',
        output: 'assert.deepStrictEqual(x, y as expect.Foo);',
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a call to expect through a type wrapper is no matcher',
        code: 'expect(o).toStrictEqual([() => (expect as any)(1), () => expect!(2)]);',
        output:
          'assert.deepStrictEqual(o, [() => (expect as any)(1), () => expect!(2)]);',
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a call to expect is no matcher',
        code: 'expect(o).toStrictEqual([() => expect(1)]);',
        output: 'assert.deepStrictEqual(o, [() => expect(1)]);',
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });
});
