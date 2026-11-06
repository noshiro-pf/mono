import { RuleTester } from '@typescript-eslint/rule-tester';
import { asNode } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

ruleTester.run(
  'asNode',
  probeRule((_, argument) => (asNode(argument) === argument).toString()),
  {
    valid: [],
    invalid: [
      {
        name: 'the same node',
        code: 'probe(x);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
    ],
  },
);
