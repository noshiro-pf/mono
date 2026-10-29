import type { TSESTree } from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';
import { globalReferenceName } from './global-reference.mjs';

/**
 * The built-ins that have both a `new` form and a call form whose call form
 * is an implicit conversion (or a different operation). `Symbol()` and
 * `BigInt()` are deliberately absent: they have no `new` form (D-41).
 */
const bannedCallees: ReadonlyMap<string, string> = new Map<string, string>([
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
 * global and is left alone. A type wrapper around the callee
 * (`(Number satisfies NumberConstructor)(x)`) is looked through, the global
 * object's property (`globalThis.Number(x)`) is the same constructor, and a
 * tag (`` Number`1` ``) is called as a function too.
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
    defaultOptions: [],
  },
  create: (context) => {
    const check = (callee: DeepReadonly<TSESTree.Expression>): void => {
      // `(Number satisfies NumberConstructor)('1')` and
      // `globalThis.Number('1')` still call `Number`; a user declaration of
      // the same name shadows the global and is not our case.
      const name = globalReferenceName(context.sourceCode, callee);

      if (name === undefined) {
        return;
      }

      const alternative = bannedCallees.get(name);

      if (alternative === undefined) {
        return;
      }

      context.report({
        node: castDeepMutable(callee),
        messageId: 'noConstructorCall',
        data: { name, alternative },
      });
    };

    return {
      CallExpression: (node) => {
        check(node.callee);
      },
      TaggedTemplateExpression: (node) => {
        check(node.tag);
      },
    };
  },
});
