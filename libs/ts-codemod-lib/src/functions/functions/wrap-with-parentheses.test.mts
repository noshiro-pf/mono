// `dedent` keeps these fixtures template literals: as plain strings, a `${` in
// them reads as a forgotten substitution (no-template-curly-in-string).
import dedent from 'dedent';
import { wrapWithParentheses } from './wrap-with-parentheses.mjs';

describe(wrapWithParentheses, () => {
  test.each([
    { name: 'a bare name', source: 'A', expected: '(A)' },
    { name: 'a wrapped name', source: '(A)', expected: '(A)' },
    { name: 'a doubly wrapped name', source: '((A))', expected: '((A))' },
    { name: 'a bare union', source: 'A | B', expected: '(A | B)' },
    {
      name: 'outer parentheses that close before the end',
      source: '(A) | (B)',
      expected: '((A) | (B))',
    },
    {
      name: 'surrounding whitespace',
      source: '  (A | B)\n',
      expected: '(A | B)',
    },
    {
      name: 'an opening parenthesis inside a string literal type',
      source: "(A | '(') | (B)",
      expected: "((A | '(') | (B))",
    },
    {
      name: 'a closing parenthesis inside a string literal type',
      source: "(A | ')' | B)",
      expected: "(A | ')' | B)",
    },
    {
      name: 'an escaped quote before a parenthesis in a string literal type',
      source: String.raw`(A | '\'(') | (B)`,
      expected: String.raw`((A | '\'(') | (B))`,
    },
    {
      name: 'a parenthesis inside a block comment',
      source: '(A /* ( */) | (B)',
      expected: '((A /* ( */) | (B))',
    },
    {
      name: 'a parenthesis inside a line comment',
      source: '(A // (\n) | (B)',
      expected: '((A // (\n) | (B))',
    },
    {
      name: 'a parenthesis inside a template literal type without substitutions',
      source: '(`(`) | (B)',
      expected: '((`(`) | (B))',
    },
    {
      name: 'parentheses inside the text spans of a template literal type',
      source: dedent`(\`(\${A}(\${B})\`) | (C)`,
      expected: dedent`((\`(\${A}(\${B})\`) | (C))`,
    },
    {
      name: 'a type literal with braces inside a template literal substitution',
      source: dedent`(\`\${{ a: \`(\` }['a']}\`) | (B)`,
      expected: dedent`((\`\${{ a: \`(\` }['a']}\`) | (B))`,
    },
    {
      name: 'parentheses inside a template literal substitution still count',
      source: dedent`(\`\${(A)}\`)`,
      expected: dedent`(\`\${(A)}\`)`,
    },
    {
      name: 'a quote left open by a regular expression literal',
      source: "(/'/.test(a)) || (b)",
      expected: "((/'/.test(a)) || (b))",
    },
    {
      name: 'a parenthesis in a regular expression literal',
      source: '(/[(]/.test(a)) || (b)',
      expected: '((/[(]/.test(a)) || (b))',
    },
    {
      name: 'quotes that close inside a later regular expression literal',
      source: '(/"/.test(a)) || (/"/.test(b))',
      expected: '((/"/.test(a)) || (/"/.test(b)))',
    },
    {
      name: 'escaped parentheses in regular expression literals that balance',
      source: String.raw`(/\(/.test(a)) || (/\)/.test(b))`,
      expected: String.raw`((/\(/.test(a)) || (/\)/.test(b)))`,
    },
    {
      name: 'a division inside wrapped parentheses',
      source: '(a / b)',
      expected: '((a / b))',
    },
    {
      name: 'an unterminated string literal that runs to the end',
      source: "(A | ') | (B)",
      expected: "((A | ') | (B))",
    },
    {
      name: 'an unterminated string literal that a line break ends',
      source: "(A | '(\n)",
      expected: "((A | '(\n))",
    },
    {
      name: 'an unterminated template literal after a substitution',
      source: dedent`(\`\${A}) | (B)`,
      expected: dedent`((\`\${A}) | (B))`,
    },
    {
      name: 'an unterminated block comment',
      source: '(A /* ) | (B)',
      expected: '((A /* ) | (B))',
    },
  ] as const)('$name', ({ source, expected }) => {
    expect(wrapWithParentheses(source)).toBe(expected);
  });
});
