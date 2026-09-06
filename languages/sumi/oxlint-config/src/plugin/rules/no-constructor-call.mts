import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { createRule } from './create-rule.mjs';

/**
 * The built-ins that have both a `new` form and a call form whose call form
 * is an implicit conversion (or a different operation). `Symbol()` and
 * `BigInt()` are deliberately absent: they have no `new` form (D-41).
 */
const bannedCallees: ReadonlyMap<string, string> = new Map([
  ['Boolean', 'an explicit comparison such as `x !== undefined`'],
  ['Number', '`SafeNumber.parse` / `SafeNumber.parseInteger` (ts-std-forge)'],
  ['String', '`SafeString.fromPrimitive` (ts-std-forge) or a template literal'],
  ['Object', 'the value itself'],
  ['Array', 'an array literal, or `Arr.newArray` / `Arr.seq` (ts-data-forge)'],
  ['Date', '`new Date()`'],
  ['RegExp', '`Regex.create` (ts-std-forge)'],
  ['Error', '`new Error(...)`'],
  ['EvalError', '`new EvalError(...)`'],
  ['RangeError', '`new RangeError(...)`'],
  ['ReferenceError', '`new ReferenceError(...)`'],
  ['SyntaxError', '`new SyntaxError(...)`'],
  ['TypeError', '`new TypeError(...)`'],
  ['URIError', '`new URIError(...)`'],
  ['AggregateError', '`new AggregateError(...)`'],
  ['Function', 'a function expression'],
]);

/**
 * `banned-syntax/no-constructor-call` — calling a built-in constructor as a
 * plain function (`Number(x)`, `String(x)`, ...) is banned (D-15 / D-41): it
 * is an implicit conversion whose intent is not in the name and whose failure
 * is a sentinel. A locally declared binding of the same name is not the
 * global and is left alone.
 */
export const noConstructorCall = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow calling built-in constructors as functions (Sumi D-15 / D-41).',
    },
    messages: {
      noConstructorCall:
        '`{{name}}(...)` is not allowed in Sumi (D-15): it is an implicit conversion. Use {{alternative}} instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      const callee = node.callee;

      if (callee.type !== AST_NODE_TYPES.Identifier) return;

      const alternative = bannedCallees.get(callee.name);

      if (alternative === undefined) return;

      // A user declaration of the same name shadows the global: not our case.
      for (
        let mut_scope: TSESLint.Scope.Scope | null =
          context.sourceCode.getScope(callee);
        mut_scope !== null;
        mut_scope = mut_scope.upper
      ) {
        const variable = mut_scope.set.get(callee.name);

        if (variable !== undefined && variable.defs.length > 0) return;
      }

      context.report({
        node: callee,
        messageId: 'noConstructorCall',
        data: { name: callee.name, alternative },
      });
    },
  }),
});
