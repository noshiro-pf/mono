import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  buildCalleeResolver,
  buildNamedImportFix,
  getImportDeclarations,
  getImportedLocalName,
  getNamedImports,
} from '../src/index.mjs';
import { probeRule, textOf } from './probe-rule.mjs';

const ruleTester = new RuleTester();

ruleTester.run(
  'getImportDeclarations and getNamedImports',
  probeRule((context) =>
    getNamedImports(getImportDeclarations(context.sourceCode.ast, 'm')).join(
      ', ',
    ),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'reads every declaration from the module, not only the first',
        code: dedent`
          import type { A } from 'm';
          import { b as c, d } from 'm';
          import { e } from 'other';
          import * as m from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'A, b, d' } }],
      },
      {
        name: 'a string export name',
        code: dedent`
          import { 'f' as g } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'f' } }],
      },
    ],
  },
);

ruleTester.run(
  'getImportedLocalName',
  probeRule(
    (context) =>
      getImportedLocalName(
        getImportDeclarations(context.sourceCode.ast, 'm'),
        'f',
      ) ?? '(none)',
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'an alias in a later declaration',
        code: dedent`
          import { a } from 'm';
          import { f as g } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'g' } }],
      },
      {
        name: 'imported from another module',
        code: dedent`
          import { f } from 'other';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: '(none)' } }],
      },
    ],
  },
);

ruleTester.run(
  'buildCalleeResolver',
  probeRule((context, argument) => {
    if (argument.type !== AST_NODE_TYPES.CallExpression) {
      return 'not a call';
    }

    const resolved = buildCalleeResolver(
      getImportDeclarations(context.sourceCode.ast, 'm'),
    )(argument.callee);

    return resolved === undefined
      ? '(none)'
      : `${resolved.canonicalName} ${textOf(context, resolved.propertyNode)} ${resolved.isNamespace}`;
  }),
  {
    valid: [],
    invalid: [
      ['f(x)', 'f f false'],
      ['g(x)', 'f g false'],
      ['(g as (u: unknown) => boolean)(x)', 'f g false'],
      ['g!(x)', 'f g false'],
      ['m.f(x)', 'f f true'],
      ['n.f(x)', 'f f true'],
      ['(m as typeof m).f(x)', 'f f true'],
      ['m!.f(x)', 'f f true'],
      ['m["f"](x)', '(none)'],
      ['other(x)', '(none)'],
      ['o.f(x)', '(none)'],
    ].map(([call, result]) => ({
      code: dedent`
        import { f, f as g } from 'm';
        import * as m from 'm';
        import * as n from 'm';
        import * as o from 'other';
        probe(${call});
      `,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'buildNamedImportFix',
  probeRule(
    (_, argument) =>
      argument.type === AST_NODE_TYPES.ArrayExpression ? 'names' : 'none',
    // Once, as a rule does: RuleTester applies fixes until none is left.
    (context, fixer) =>
      getNamedImports(
        getImportDeclarations(context.sourceCode.ast, 'm'),
      ).includes('a')
        ? []
        : buildNamedImportFix(fixer, context.sourceCode.ast, 'm', [
            'a',
            'type B',
          ]),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'one declaration with every specifier, at the top',
        code: dedent`
          import { c } from 'other';
          probe([]);
        `,
        output: dedent`
          import { a, type B } from 'm';
          import { c } from 'other';
          probe([]);
        `,
        errors: [{ messageId: 'result', data: { result: 'names' } }],
      },
    ],
  },
);

ruleTester.run(
  'buildNamedImportFix with no specifiers',
  probeRule(
    () => 'none',
    (context, fixer) =>
      buildNamedImportFix(fixer, context.sourceCode.ast, 'm', []),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'no fix',
        code: 'probe(0);',
        output: null,
        errors: [{ messageId: 'result', data: { result: 'none' } }],
      },
    ],
  },
);
