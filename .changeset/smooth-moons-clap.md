---
'eslint-config-typed': minor
---

Turn `@stylistic/quotes` on, for the one thing no formatter does: report a template literal that has nothing left in it to be a template.

```ts
// reported, and mechanical to fix
const key = `--good`;

// left alone: tagged, or carrying a substitution or a real line break
const sql = dedent`
    select 1
`;
const label = `--${kind}`;
const help = `usage:
  cmd --flag`;
```

The rule is configured `['error', 'single', { allowTemplateLiterals: 'never', ignoreStringLiterals: true }]`. `ignoreStringLiterals` is what keeps it out of the formatter's way: eslint-config-prettier turns `quotes` off because the rule can disagree with the formatter over which quote a string gets, and with string literals ignored it is never asked — every quoted string stays with whatever quote the project's formatter prefers, single or double. What no formatter touches is the backtick: neither Prettier nor oxfmt will ever rewrite `` `a` `` into `'a'`, however little of a template is left in it.

Only the three things `quotes` counts as using a feature of a template exempt it — a tag, a substitution, or a real line break. A backtick inside is not one of them, and needs no escape once the quotes change.

`avoidEscape` is deliberately absent. On its own it does nothing here, since the string-literal branch returns early; set together with `allowTemplateLiterals: 'avoidEscape'` it would exempt every template whose text merely _contains_ a `'` — a far wider net than the escaping it is named for, and one that catches templates the formatter would otherwise turn into ordinary double-quoted strings needing no escape at all.
