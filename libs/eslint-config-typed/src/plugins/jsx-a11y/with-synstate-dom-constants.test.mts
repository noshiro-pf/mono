import parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { RuleTester, type Rule } from 'eslint';
// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import { withSynstateDomConstants } from './with-synstate-dom-constants.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

const { rules } = withSynstateDomConstants(eslintPluginJsxA11y);

const ruleOf = (
  name: string,
  from: typeof rules = rules,
): NonNullable<(typeof rules)[string]> => {
  const rule = from[name];

  if (rule === undefined) {
    throw new Error(`the plugin has no ${name}`);
  }

  return rule;
};

const importConstant = "import { constant } from 'synstate-dom';";

describe('aria-role', () => {
  tester.run('aria-role', ruleOf('aria-role'), {
    valid: [
      {
        name: 'a role bound to constant is read as its argument',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('button')} />;
        `,
      },
      {
        name: 'an observable role is not read',
        code: dedent`
          ${importConstant}
          const a = <div role={role$} />;
        `,
      },
      {
        name: 'a declaration of type specifiers alone imports no constant',
        code: dedent`
          import { type Bindable, type constant } from 'synstate-dom';
          const a = <div role={constant('bogus')} />;
        `,
      },
      {
        name: 'an inline type specifier imports no constant',
        code: dedent`
          import { type constant } from 'synstate-dom';
          const a = <div role={constant('bogus')} />;
        `,
      },
      {
        name: 'an import of types alone imports no constant',
        code: dedent`
          import type { constant } from 'synstate-dom';
          const a = <div role={constant('bogus')} />;
        `,
      },
      {
        name: "another module's constant is not unwrapped, and its call reads as no literal",
        code: dedent`
          import { constant } from 'elsewhere';
          const a = <div role={constant('bogus')} />;
        `,
      },
    ],
    invalid: [
      {
        name: 'a wrong role bound to constant is reported',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: 'an aliased import',
        code: dedent`
          import { constant as c } from 'synstate-dom';
          const a = <div role={c('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: 'a namespace import',
        code: dedent`
          import * as dom from 'synstate-dom';
          const a = <div role={dom.constant('bogus')} />;
        `,
        errors: 1,
      },
    ],
  });
});

describe('inside an expression that getPropValue evaluates', () => {
  tester.run(
    'no-aria-hidden-on-focusable',
    ruleOf('no-aria-hidden-on-focusable'),
    {
      valid: [
        {
          name: 'a false branch is not read as hidden',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={x ? constant(false) : constant(false)} />;
          `,
        },
        {
          name: 'the test of a conditional, read as false',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={constant(false) ? constant(true) : constant(false)} />;
          `,
        },
      ],
      invalid: [
        {
          name: 'both branches of a conditional',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={x ? constant(true) : constant(false)} />;
          `,
          errors: 1,
        },
        {
          name: 'one branch of a conditional, the other kept',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={x ? constant(true) : false} />;
          `,
          errors: 1,
        },
        {
          name: 'after `&&`, through a type wrapper',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={(x && constant(true)) as boolean} />;
          `,
          errors: 1,
        },
        {
          name: '`||` with the call on the left',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={constant(false) || true} />;
          `,
          errors: 1,
        },
        {
          name: '`??` with the call on the right',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={null ?? constant(true)} />;
          `,
          errors: 1,
        },
        {
          name: 'a side of a binary operator',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={constant(1) === 1} />;
          `,
          errors: 1,
        },
        {
          name: 'under `!`',
          code: dedent`
            ${importConstant}
            const a = <button aria-hidden={!constant(false)} />;
          `,
          errors: 1,
        },
      ],
    },
  );
});

// `<T>x` cannot be written in a file with JSX, where it parses as an element.
describe('through type wrappers', () => {
  tester.run('aria-role', ruleOf('aria-role'), {
    valid: [
      {
        name: 'a wrapped right role is read as its argument',
        code: dedent`
          ${importConstant}
          const a = <div role={(constant as typeof constant)('button')!} />;
        `,
      },
    ],
    invalid: [
      {
        name: '`as` and `satisfies` on the call and on the argument',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('bogus' as const) satisfies unknown} />;
        `,
        errors: 1,
      },
      {
        name: '`!` on the call and on the argument',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('bogus'!)!} />;
        `,
        errors: 1,
      },
      {
        name: 'a wrapped callee',
        code: dedent`
          ${importConstant}
          const a = <div role={(constant as typeof constant)('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: 'a wrapped namespace',
        code: dedent`
          import * as dom from 'synstate-dom';
          const a = <div role={(dom as typeof dom).constant('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: 'an optional call',
        code: dedent`
          ${importConstant}
          const a = <div role={constant?.('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: '`!` after an optional call',
        code: dedent`
          ${importConstant}
          const a = <div role={constant?.('bogus')!} />;
        `,
        errors: 1,
      },
      {
        name: 'an optional member callee',
        code: dedent`
          import * as dom from 'synstate-dom';
          const a = <div role={(dom?.constant)('bogus')} />;
        `,
        errors: 1,
      },
      {
        name: 'a parenthesized call',
        code: dedent`
          ${importConstant}
          const a = <div role={(constant('bogus'))} />;
        `,
        errors: 1,
      },
    ],
  });
});

describe('no-static-element-interactions', () => {
  tester.run(
    'no-static-element-interactions',
    ruleOf('no-static-element-interactions'),
    {
      valid: [
        {
          name: 'a div given a role through constant',
          code: dedent`
            ${importConstant}
            const a = (
              <div role={constant('button')} tabIndex={constant(0)} onClick={f} onKeyDown={f} />
            );
          `,
        },
        {
          name: 'a role through constant in an object literal spread',
          code: dedent`
            ${importConstant}
            const a = (
              <div {...{ role: constant('button') }} tabIndex={constant(0)} onClick={f} onKeyDown={f} />
            );
          `,
        },
      ],
      invalid: [
        {
          name: 'a div with a click handler and no role',
          code: dedent`
            ${importConstant}
            const a = <div onClick={f} onKeyDown={f} />;
          `,
          errors: 1,
        },
        {
          name: 'a shadowed constant is not unwrapped',
          code: dedent`
            ${importConstant}
            const f = (constant: (s: string) => unknown) => (
              <div role={constant('button')} onClick={g} onKeyDown={g} />
            );
          `,
          errors: 1,
        },
        {
          name: 'a call with two arguments is not unwrapped',
          code: dedent`
            ${importConstant}
            const a = <div role={constant('button', x)} onClick={g} onKeyDown={g} />;
          `,
          errors: 1,
        },
      ],
    },
  );
});

describe('aria-proptypes', () => {
  tester.run('aria-proptypes', ruleOf('aria-proptypes'), {
    valid: [
      {
        name: 'a boolean bound to constant',
        code: dedent`
          ${importConstant}
          const a = <div aria-hidden={constant(true)} />;
        `,
      },
      {
        name: 'a file that imports nothing from synstate-dom reads as before',
        code: dedent`
          const a = <div aria-hidden={true} />;
        `,
      },
    ],
    invalid: [
      {
        name: 'a string where a boolean is wanted',
        code: dedent`
          ${importConstant}
          const a = <div aria-hidden={constant('yes')} />;
        `,
        errors: 1,
      },
    ],
  });
});

describe('reading the attributes of the element around an attribute', () => {
  tester.run(
    'no-interactive-element-to-noninteractive-role',
    ruleOf('no-interactive-element-to-noninteractive-role'),
    {
      valid: [
        {
          name: 'an interactive role on a button',
          code: dedent`
            ${importConstant}
            const a = <button role={constant('menuitem')} />;
          `,
        },
      ],
      invalid: [
        {
          name: 'a non-interactive role on a button, read from the element',
          code: dedent`
            ${importConstant}
            const a = <button role={constant('listitem')} />;
          `,
          errors: 1,
        },
      ],
    },
  );

  tester.run(
    'role-has-required-aria-props',
    ruleOf('role-has-required-aria-props'),
    {
      valid: [
        {
          name: "a checkbox input's own checkedness serves the switch role",
          code: dedent`
            ${importConstant}
            const a = <input type={constant('checkbox')} role={constant('switch')} />;
          `,
        },
      ],
      invalid: [
        {
          name: 'a switch role on a div with no aria-checked',
          code: dedent`
            ${importConstant}
            const a = <div role={constant('switch')} />;
          `,
          errors: 1,
        },
      ],
    },
  );
});

describe('reading the children of an element', () => {
  tester.run('anchor-has-content', ruleOf('anchor-has-content'), {
    valid: [
      {
        name: 'a link with text',
        code: dedent`
          ${importConstant}
          const a = <a href={constant('/x')}><span>icon</span></a>;
        `,
      },
    ],
    invalid: [
      {
        name: 'a link whose one child is hidden through constant',
        code: dedent`
          ${importConstant}
          const a = <a href={constant('/x')}><span aria-hidden={constant(true)}>icon</span></a>;
        `,
        errors: 1,
      },
      {
        name: 'a nested child, under a fragment',
        code: dedent`
          ${importConstant}
          const a = (
            <>
              <a href={constant('/x')}><span aria-hidden={constant(true)}>icon</span></a>
            </>
          );
        `,
        errors: 1,
      },
    ],
  });
});

describe('a rule that fixes and suggests', () => {
  const fixing = withSynstateDomConstants({
    rules: {
      'to-literal': {
        meta: { type: 'suggestion', fixable: 'code', hasSuggestions: true },
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's context type, which has mutable members
        create: (context: Rule.RuleContext) => ({
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's node type, which has mutable members
          JSXAttribute: (node: Rule.Node) => {
            context.report({
              node,
              message: 'replaced',
              fix: (fixer) => fixer.replaceText(node, 'x'),
              suggest: [
                {
                  desc: 'replace',
                  fix: (fixer) => fixer.replaceText(node, 'x'),
                },
              ],
            });
          },
        }),
      },
    },
  });

  const positional = withSynstateDomConstants({
    rules: {
      'to-literal': {
        meta: { type: 'suggestion', fixable: 'code' },
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's context type, which has mutable members
        create: (context: Rule.RuleContext) => ({
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's node type, which has mutable members
          JSXAttribute: (node: Rule.Node) => {
            context.report(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the positional form, which ESLint's types no longer name
              ...([
                node,
                'positional',
                {},

                (fixer: Rule.RuleFixer) => fixer.replaceText(node, 'x'),
              ] as unknown as readonly [Rule.ReportDescriptor]),
            );
          },
        }),
      },
    },
  });

  tester.run('positional', ruleOf('to-literal', positional.rules), {
    valid: [],
    invalid: [
      {
        name: 'a positional report keeps its message and loses its fix',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('button')} />;
        `,
        output: null,
        errors: [{ message: 'positional' }],
      },
    ],
  });

  tester.run('to-literal', ruleOf('to-literal', fixing.rules), {
    valid: [],
    invalid: [
      {
        name: 'reports without either where it reads a copy',
        code: dedent`
          ${importConstant}
          const a = <div role={constant('button')} />;
        `,
        output: null,
        errors: [{ message: 'replaced', suggestions: [] }],
      },
      {
        name: 'keeps both in a file that imports no constant',
        code: 'const a = <div role="button" />;',
        output: 'const a = <div x />;',
        errors: [
          {
            message: 'replaced',
            suggestions: [{ desc: 'replace', output: 'const a = <div x />;' }],
          },
        ],
      },
    ],
  });
});

describe('a rule that visits spread attributes alone', () => {
  const spreads = withSynstateDomConstants({
    rules: {
      'spread-literal': {
        meta: { type: 'problem' },
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's context type, which has mutable members
        create: (context: Rule.RuleContext) => ({
          JSXSpreadAttribute: (
            // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- typescript-eslint's node type, which has mutable members
            node: TSESTree.JSXSpreadAttribute,
          ) => {
            if (
              node.argument.type === AST_NODE_TYPES.ObjectExpression &&
              node.argument.properties.every(
                (property) =>
                  property.type === AST_NODE_TYPES.Property &&
                  property.value.type === AST_NODE_TYPES.Literal,
              )
            ) {
              context.report({ node, message: 'literal' });
            }
          },
        }),
      },
    },
  });

  tester.run('spread-literal', ruleOf('spread-literal', spreads.rules), {
    valid: [],
    invalid: [
      {
        name: 'reads the copy with no other listener before it',
        code: dedent`
          ${importConstant}
          const a = <div {...{ role: constant('button') }} />;
        `,
        errors: 1,
      },
    ],
  });
});

describe('the plugin', () => {
  test("is named for the wrapper, with jsx-a11y's version", () => {
    const { meta } = withSynstateDomConstants(eslintPluginJsxA11y);

    assert.strictEqual(
      meta?.name,
      "eslint-plugin-jsx-a11y (reading synstate-dom's constant)",
    );

    assert.isString(meta?.version);
  });

  test("a file of another language, whose root is no Program, gets the rule's visitors", () => {
    const context = {
      options: [],
      settings: {},
      sourceCode: { ast: { type: 'Document', children: [] } },
    } as const;

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the members aria-role and the wrapper read
    const visitors = ruleOf('aria-role').create(context as never);

    assert.isFunction(visitors['JSXAttribute']);
  });

  test('a value that is not a plugin has no rules', () => {
    assert.deepStrictEqual(withSynstateDomConstants(undefined), { rules: {} });

    assert.deepStrictEqual(withSynstateDomConstants({ rules: { x: {} } }), {
      rules: {},
    });
  });
});
