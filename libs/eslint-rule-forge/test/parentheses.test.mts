import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  getArgumentText,
  getRangeWithParens,
  parenthesesDepth,
} from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

ruleTester.run(
  'parenthesesDepth',
  probeRule((context, argument) =>
    parenthesesDepth(context.sourceCode, argument).toString(),
  ),
  {
    valid: [],
    invalid: [
      ['a', '0'],
      ['(a)', '1'],
      ['((a))', '2'],
      ['(a) + b', '0'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'getRangeWithParens',
  probeRule((context, argument) =>
    context.sourceCode.text.slice(
      ...getRangeWithParens(context.sourceCode, argument),
    ),
  ),
  {
    valid: [],
    invalid: [
      ['a', 'a'],
      ['((Array.isArray))', '((Array.isArray))'],
      ['( (a) )', '( (a) )'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'getArgumentText',
  probeRule((context, argument) =>
    getArgumentText(context.sourceCode, argument),
  ),
  {
    valid: [],
    invalid: [
      ['a', 'a'],
      ['(a)', 'a'],
      ['(a, b)', '(a, b)'],
      ['((a, b))', '(a, b)'],
      ['a ? b : c', 'a ? b : c'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);
