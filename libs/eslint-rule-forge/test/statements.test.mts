import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { siblingOf } from '../src/index.mjs';
import { probeRule, type ProbeContext } from './probe-rule.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

const ruleTester = new RuleTester();

// The argument is `x`. The node asked about is the `probe(x)` call's statement,
// or the call itself where it is not one (an arrow's body, a `for` initializer,
// an `export default` expression).
ruleTester.run(
  'siblingOf',
  probeRule((context, argument) => {
    const call = argument.parent;

    return siblingsText(
      context,
      call.parent?.type === AST_NODE_TYPES.ExpressionStatement
        ? call.parent
        : call,
    );
  }),
  {
    valid: [],
    invalid: (
      [
        ['a; probe(x); b;', 'b; / a;'],
        ['probe(x);', 'none / none'],
        ['{ a; probe(x); b; }', 'b; / a;'],
        ['switch (k) { case 0: a; probe(x); b; }', 'b; / a;'],
        ['class K { static { a; probe(x); b; } }', 'b; / a;'],
        ['namespace N { a; probe(x); b; }', 'b; / a;'],
        ['label: probe(x);', 'none / none'],
        ['const f = () => probe(x);', 'none / none'],
        ['for (probe(x); ; ) {}', 'none / none'],
        ['a; export default probe(x); b;', 'b; / a;'],
        ["export { a } from 'm'; probe(x);", "none / export { a } from 'm';"],
      ] as const
    ).map(([code, result]) => ({
      code,
      errors: [{ messageId: 'result', data: { result } }] as const,
    })),
  },
);

// The argument is `x` in `const v = probe(x)`; the node asked about is the declaration, which `export` may wrap.
ruleTester.run(
  'siblingOf through export',
  probeRule((context, argument) => {
    const declaration = argument.parent.parent?.parent;

    return declaration === undefined
      ? 'no declaration'
      : siblingsText(context, declaration);
  }),
  {
    valid: [],
    invalid: (
      [
        ['a; export const v = probe(x); b;', 'b; / a;'],
        ['a; const v = probe(x); b;', 'b; / a;'],
        ['namespace N { a; export const v = probe(x); b; }', 'b; / a;'],
      ] as const
    ).map(([code, result]) => ({
      code,
      errors: [{ messageId: 'result', data: { result } }] as const,
    })),
  },
);

/** The text of the statement after `node`, then before it, or `none`. */
const siblingsText = (context: ProbeContext, node: TSESTree.Node): string =>
  ([1, -1] as const)
    .map((offset) => {
      const sibling = siblingOf(node, offset);

      return sibling === undefined
        ? 'none'
        : context.sourceCode.text.slice(sibling.range[0], sibling.range[1]);
    })
    .join(' / ');
