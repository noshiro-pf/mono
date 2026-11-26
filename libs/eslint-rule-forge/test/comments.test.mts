import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { hasCommentOutside } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

// The argument of `probe` is a call; the ranges kept are its arguments'.
ruleTester.run(
  'hasCommentOutside',
  probeRule((context, argument) =>
    hasCommentOutside(
      context.sourceCode,
      argument,
      argument.type === AST_NODE_TYPES.CallExpression
        ? argument.arguments.map((a) => a.range)
        : [],
    )
      ? 'outside'
      : 'none',
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'a comment within a kept range',
        code: 'probe(f(g(/* c */ x)));',
        errors: [{ messageId: 'result', data: { result: 'none' } }],
      },
      {
        name: 'a comment between kept ranges',
        code: 'probe(f(x, /* c */ y));',
        errors: [{ messageId: 'result', data: { result: 'outside' } }],
      },
      {
        name: 'a comment after the last kept range',
        code: 'probe(f(x /* c */));',
        errors: [{ messageId: 'result', data: { result: 'outside' } }],
      },
      {
        name: 'one comment kept and one not',
        code: 'probe(f(g(/* kept */ x), /* lost */ y));',
        errors: [{ messageId: 'result', data: { result: 'outside' } }],
      },
      {
        name: 'no range kept',
        code: 'probe(f(/* c */));',
        errors: [{ messageId: 'result', data: { result: 'outside' } }],
      },
      {
        name: 'a comment outside the node is not looked at',
        code: 'probe(/* a */ f(x)); // b',
        errors: [{ messageId: 'result', data: { result: 'none' } }],
      },
    ],
  },
);
