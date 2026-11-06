import { RuleTester } from '@typescript-eslint/rule-tester';
import { mayHaveEffect } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

ruleTester.run(
  'mayHaveEffect',
  probeRule((context, argument) =>
    mayHaveEffect(argument, context.sourceCode).toString(),
  ),
  {
    valid: [],
    invalid: [
      // What `ASTUtils.hasSideEffect` counts
      ['a', 'false'],
      ['a.b', 'false'],
      ['f()', 'true'],
      ['a = 1', 'true'],
      // A tagged template calls its tag
      ['html`<p/>`', 'true'],
      ['{ a: html`<p/>` }', 'true'],
      // eslint-disable-next-line no-template-curly-in-string -- the code linted
      ['`plain ${a}`', 'false'],
      // Nothing in a function body runs when the function is evaluated
      ['() => html`<p/>`', 'false'],
      ['{ render: () => html`<p/>` }', 'false'],
      ['function () { return [...it]; }', 'false'],
      // Spreading into an array or arguments runs the iterator
      ['[...it]', 'true'],
      ['[a, ...it]', 'true'],
      ['{ k: [...it] }', 'true'],
      // An object spread copies own properties and runs no iterator
      ['{ ...o }', 'false'],
    ].map(([argument, result]) => ({
      name: `${argument} → ${result}`,
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);
