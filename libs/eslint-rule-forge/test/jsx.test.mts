import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { jsxValuePositionOf } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

// The node asked about is the root of the file, which has no parent.
ruleTester.run(
  'jsxValuePositionOf at the root',
  probeRule((_context, argument) => {
    const root = rootOf(argument);

    return jsxValuePositionOf(root) ?? 'not in JSX';
  }),
  {
    valid: [],
    invalid: [
      {
        code: '<div>{probe(x)}</div>;',
        errors: [{ messageId: 'result', data: { result: 'not in JSX' } }],
      },
    ],
  },
);

// The node asked about is the `probe(x)` call itself.
ruleTester.run(
  'jsxValuePositionOf',
  probeRule(
    (_context, argument) => jsxValuePositionOf(argument.parent) ?? 'not in JSX',
  ),
  {
    valid: [],
    invalid: (
      [
        ['<div>{probe(x)}</div>;', 'child'],
        ['<div a={probe(x)} />;', 'attribute'],
        ['<div>{c ? probe(x) : null}</div>;', 'child'],
        ['<div a={c ? null : probe(x)} />;', 'attribute'],
        ['<div>{probe(x) ? a : b}</div>;', 'not in JSX'],
        ['<div>{a && probe(x)}</div>;', 'child'],
        ['<div>{(probe(x) || a) ?? b}</div>;', 'child'],
        ['<div>{(probe(x) as boolean) || a}</div>;', 'child'],
        ['<div>{probe(x)!}</div>;', 'child'],
        ['<div>{f(probe(x))}</div>;', 'not in JSX'],
        ['<div>{!probe(x)}</div>;', 'not in JSX'],
        ['const v = probe(x);', 'not in JSX'],
      ] as const
    ).map(([code, result]) => ({
      code,
      errors: [{ messageId: 'result', data: { result } }] as const,
    })),
  },
);

/** The `Program` at the top of `node`'s tree. */
const rootOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Node =>
  node.type === AST_NODE_TYPES.Program ? node : rootOf(node.parent);
