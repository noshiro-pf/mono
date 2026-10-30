import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { Linter } from 'eslint';
import {
  bindValueImports,
  buildCalleeResolver,
  buildNamedImportFix,
  getImportDeclarations,
  getImportedLocalName,
  getNamedImports,
  hasCommentWithin,
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
  'buildNamedImportFix after a directive prologue',
  probeRule(
    () => 'names',
    (context, fixer) =>
      getNamedImports(
        getImportDeclarations(context.sourceCode.ast, 'm'),
      ).includes('a')
        ? []
        : buildNamedImportFix(fixer, context.sourceCode.ast, 'm', ['a']),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'the directives stay first',
        code: dedent`
          'use client';
          'use strict';
          probe(0);
        `,
        output: dedent`
          'use client';
          'use strict';
          import { a } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'names' } }],
      },
      {
        name: 'a comment on the directive line stays on it',
        code: dedent`
          'use client'; // about this line
          probe(0);
        `,
        output: dedent`
          'use client'; // about this line
          import { a } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'names' } }],
      },
    ],
  },
);

const probeBinding = (names: readonly string[]): ReturnType<typeof probeRule> =>
  probeRule(
    (context) =>
      bindValueImports(context.sourceCode, 'm', names)?.localNames.join(', ') ??
      '(none)',
    (context, fixer) =>
      bindValueImports(context.sourceCode, 'm', names)?.edits(fixer) ?? [],
  );

ruleTester.run('bindValueImports', probeBinding(['f']), {
  valid: [],
  invalid: [
    {
      name: 'already imported as a value: its local name and no edit',
      code: dedent`
        import { f as g } from 'm';
        probe(0);
      `,
      output: null,
      errors: [{ messageId: 'result', data: { result: 'g' } }],
    },
    {
      name: 'added to an existing named import from the module',
      code: dedent`
        import { a } from 'm';
        probe(0);
      `,
      output: dedent`
        import { a, f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'the declaration with a value specifier is preferred',
      code: dedent`
        import { type T } from 'm';
        import { a } from 'm';
        probe(0);
      `,
      output: dedent`
        import { type T } from 'm';
        import { a, f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'an inline type specifier loses its type keyword',
      code: dedent`
        import { a, type f } from 'm';
        probe(0);
      `,
      output: dedent`
        import { a, f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'a comment after the type keyword stays',
      code: dedent`
        import { type /* c */ f } from 'm';
        probe(0);
      `,
      output: dedent`
        import { /* c */ f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'refused when a type-only declaration imports it',
      code: dedent`
        import type { f } from 'm';
        probe(0);
      `,
      output: null,
      errors: [{ messageId: 'result', data: { result: '(none)' } }],
    },
    {
      name: 'refused when another import binds the name',
      code: dedent`
        import { g as f } from 'm';
        probe(0);
      `,
      output: null,
      errors: [{ messageId: 'result', data: { result: '(none)' } }],
    },
    {
      name: 'refused when an import from another module binds the name',
      code: dedent`
        import { f } from 'other';
        probe(0);
      `,
      output: null,
      errors: [{ messageId: 'result', data: { result: '(none)' } }],
    },
    {
      name: 'a new declaration when the module has no named import',
      code: dedent`
        import * as m from 'm';
        probe(0);
      `,
      output: dedent`
        import { f } from 'm';
        import * as m from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'braces added to a lone default import from the module',
      code: dedent`
        import D from 'm';
        probe(0);
      `,
      output: dedent`
        import D, { f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
    {
      name: 'a new declaration after a directive',
      code: dedent`
        'use client';
        probe(0);
      `,
      output: dedent`
        'use client';
        import { f } from 'm';
        probe(0);
      `,
      errors: [{ messageId: 'result', data: { result: 'f' } }],
    },
  ],
});

ruleTester.run(
  'bindValueImports with several names',
  probeBinding(['f', 'h', 'k']),
  {
    valid: [],
    invalid: [
      {
        name: 'every name it has to add goes in one edit',
        code: dedent`
          import { a, type h, k as l } from 'm';
          probe(0);
        `,
        output: dedent`
          import { a, h, k as l, f } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'f, h, l' } }],
      },
      {
        name: 'one name refused refuses them all',
        code: dedent`
          import { a } from 'm';
          import type { k } from 'm';
          probe(0);
        `,
        output: null,
        errors: [{ messageId: 'result', data: { result: '(none)' } }],
      },
    ],
  },
);

describe('bindValueImports with the default parser', () => {
  // ESLint's default parser, which reads `.js` and `.mjs` files, leaves out
  // `importKind`: an import is a value import unless it says `type`.
  test('a missing importKind is a value import', () => {
    const linter = new Linter();

    const messages = linter.verify(
      dedent`
        import { f } from 'm';
        probe(0);
      `,
      {
        files: ['**/*.mjs'],
        plugins: {
          // `Linter` takes the plugin as mutable.
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          probe: { rules: { probe: probeBinding(['f']) } } as never,
        },
        rules: { 'probe/probe': 'error' },
      },
      'file.mjs',
    );

    assert.deepStrictEqual(
      messages.map(({ message, fix }) => [message, fix] as const),
      [['f', undefined]],
    );
  });
});

ruleTester.run(
  'hasCommentWithin',
  probeRule((context, argument) =>
    hasCommentWithin(context.sourceCode, argument, [argument.range])
      ? 'comment'
      : 'none',
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'a comment inside the range',
        code: 'probe(f(/* c */ x));',
        errors: [{ messageId: 'result', data: { result: 'comment' } }],
      },
      {
        name: 'no comment',
        code: 'probe(f(x)); // c',
        errors: [{ messageId: 'result', data: { result: 'none' } }],
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
