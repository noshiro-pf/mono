import {
  type InvalidTestCase,
  RuleTester,
} from '@typescript-eslint/rule-tester';
import { ESLintUtils } from '@typescript-eslint/utils';
import dedent from 'dedent';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  createGetLayerTypes,
  needsParenthesesAsOperandOf,
  type NegationContext,
  negationOf,
  prefixedNegationOf,
} from '../src/index.mjs';
import { type ProbeContext, probeRule, textOf } from './probe-rule.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['*.ts*'] },
      tsconfigRootDir: `${import.meta.dirname}/..`,
    },
  },
});

/**
 * A context whose `isBoolean` asks whether the node's type is a boolean at
 * every wrapper layer.
 */
const contextOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  context: ProbeContext,
): NegationContext => {
  const services = ESLintUtils.getParserServices(context);

  const checker = services.program.getTypeChecker();

  const getLayerTypes = createGetLayerTypes(services);

  return {
    sourceCode: context.sourceCode,
    checker,
    getLayerTypes,
    isBoolean: (node) =>
      getLayerTypes(node).every(
        (type) => checker.typeToString(type) === 'boolean',
      ),
  };
};

const declarations = dedent`
  declare const a: boolean;
  declare const b: boolean;
  declare const n: number;
  declare const m: number;
  declare const s: string;
  declare const t: string;
  declare const u: unknown;
  declare const f: () => boolean;
`;

const cases = (
  rows: readonly FixedLengthTuple<2, string>[],
): readonly InvalidTestCase<'result', readonly []>[] =>
  rows.map(([argument, result]) => ({
    code: `${declarations}\nprobe(${argument});`,
    errors: [{ messageId: 'result', data: { result } }],
  }));

describe(negationOf, () => {
  ruleTester.run(
    'negationOf as a whole expression',
    probeRule(
      (context, argument) =>
        negationOf(argument, contextOf(context), undefined) ?? 'undefined',
    ),
    {
      valid: [],
      invalid: cases([
        // `!a` loses its `!` only when `a` is a boolean.
        ['!a', 'a'],
        ['!u', 'undefined'],
        // An equality always inverts; a relational comparison only when no
        // operand can be NaN.
        ['n === m', 'n !== m'],
        ['s != t', 's == t'],
        ['s < t', 's >= t'],
        ['n < 1', 'undefined'],
        ['1 < 2', '1 >= 2'],
        // De Morgan, each side negated the same way, or with `!` when it has
        // no short negation.
        ['n === 0 || s === ""', 'n !== 0 && s !== ""'],
        ['a && f()', '!a || !f()'],
        ['!a || n < m', 'a && !(n < m)'],
        ['!u && b', '!!u || !b'],
        // A nested `&&` under the new `&&`, and an `||` under it, which needs
        // parentheses.
        ['a || (b && f())', '!a && (!b || !f())'],
        ['a && (b || f())', '!a || !b && !f()'],
        // Anything else gets a `!`, parenthesized unless it binds tightly.
        ['f()', '!f()'],
        ['a ? b : f()', '!(a ? b : f())'],
        ['u ?? b', '!(u ?? b)'],
        // A comparison under a type wrapper is not looked into.
        ['(n === m) as boolean', '!((n === m) as boolean)'],
      ]),
    },
  );

  ruleTester.run(
    'negationOf as an operand',
    probeRule((context, argument) =>
      [
        negationOf(argument, contextOf(context), '&&'),
        negationOf(argument, contextOf(context), '||'),
      ].join(' / '),
    ),
    {
      valid: [],
      invalid: cases([
        ['a && b', '(!a || !b) / !a || !b'],
        ['a || b', '!a && !b / !a && !b'],
        ['!(a ? b : f())', '(a ? b : f()) / (a ? b : f())'],
        ['n === m', 'n !== m / n !== m'],
      ]),
    },
  );

  ruleTester.run(
    'negationOf in a truthiness context',
    probeRule(
      (context, argument) =>
        negationOf(
          argument,
          { ...contextOf(context), isBoolean: () => true },
          undefined,
        ) ?? 'undefined',
    ),
    {
      valid: [],
      invalid: cases([
        ['!u', 'u'],
        ['!u && b', 'u || !b'],
      ]),
    },
  );
});

ruleTester.run(
  'prefixedNegationOf',
  probeRule((context, argument) =>
    prefixedNegationOf(argument, context.sourceCode),
  ),
  {
    valid: [],
    invalid: cases([
      ['a', '!a'],
      ['f()', '!f()'],
      ['!a', '!!a'],
      ['n === m', '!(n === m)'],
      ['a && b', '!(a && b)'],
    ]),
  },
);

ruleTester.run(
  'needsParenthesesAsOperandOf',
  probeRule((context, argument) =>
    [
      textOf(context, argument),
      needsParenthesesAsOperandOf(argument, '&&'),
      needsParenthesesAsOperandOf(argument, '||'),
    ].join(' '),
  ),
  {
    valid: [],
    invalid: cases([
      ['a', 'a false false'],
      ['a && b', 'a && b false false'],
      ['a || b', 'a || b true false'],
      ['u ?? b', 'u ?? b true true'],
      ['a ? b : f()', 'a ? b : f() true true'],
    ]),
  },
);
