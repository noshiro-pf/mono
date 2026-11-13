import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isSameReference, staticPropertyName } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

// The argument is `[left, right]`; the result is whether they are the same
// reference.
ruleTester.run(
  'isSameReference',
  probeRule((_context, argument) => {
    if (argument.type !== AST_NODE_TYPES.ArrayExpression) {
      return 'not an array';
    }

    const [left, right] = argument.elements;

    return left === undefined ||
      left === null ||
      right === undefined ||
      right === null
      ? 'missing'
      : isSameReference(left, right)
        ? 'true'
        : 'false';
  }),
  {
    valid: [],
    invalid: (
      [
        ['probe([x, x]);', 'true'],
        ['probe([x, y]);', 'false'],
        ['probe([x.y, x.y]);', 'true'],
        ["probe([x.y, x['y']]);", 'true'],
        ['probe([x[0], x["0"]]);', 'true'],
        ['probe([x.y, x.z]);', 'false'],
        ['probe([x.y, z.y]);', 'false'],
        ['probe([x[k], x[k]]);', 'true'],
        ['probe([x[k], x.k]);', 'false'],
        ['probe([(x as T).y, x!.y]);', 'true'],
        ['probe([this.a, this.a]);', 'true'],
        ['probe([this, x]);', 'false'],
        ["probe(['a', 'a']);", 'true'],
        ["probe(['a', 'b']);", 'false'],
        ['probe([f(), f()]);', 'false'],
        ['class K { #p = 0; m() { probe([this.#p, this.#p]); } }', 'true'],
      ] as const
    ).map(([code, result]) => ({
      code,
      errors: [{ messageId: 'result', data: { result } }] as const,
    })),
  },
);

// The argument is a member access; the result is its static name, or
// `undefined`.
ruleTester.run(
  'staticPropertyName',
  probeRule((_context, argument) =>
    argument.type === AST_NODE_TYPES.MemberExpression
      ? (staticPropertyName(argument) ?? 'undefined')
      : 'not a member access',
  ),
  {
    valid: [],
    invalid: (
      [
        ['probe(x.y);', 'y'],
        ["probe(x['y']);", 'y'],
        ['probe(x[0]);', '0'],
        ['probe(x[1n]);', '1'],
        ['probe(x[k]);', 'undefined'],
        ['probe(x[`y`]);', 'y'],
        ['class K { #p = 0; m() { probe(this.#p); } }', '#p'],
      ] as const
    ).map(([code, result]) => ({
      code,
      errors: [{ messageId: 'result', data: { result } }] as const,
    })),
  },
);
