---
'eslint-config-typed': minor
---

Add `ts-restrictions/prefer-dedent`, on at `error`: a string that spans source lines has to be a tagged template rather than a bare multi-line template literal.

```ts
// reported
const usage = `usage:
  cmd --flag`;

// not reported
const usage2 = dedent`
    usage:
      cmd --flag
`;
const usage3 = ['usage:', '  cmd --flag'].join('\n');
```

A template literal keeps every character between its backticks, indentation included, so a multi-line one has to choose between a correct value with broken indentation (the first form above, written flush against the left margin) and intact indentation that has silently become part of the value. The second is the worse of the two: the string then depends on how deeply the expression happens to be nested, so extracting a function or wrapping the code in an `if` changes it, with nothing at the point of use to say so.

The rule reports only. There is no fix, because wrapping an already-indented template in `dedent` changes its value and only a reader can say whether that was the intent.

Not reported: any tagged template — the tag decides what the whitespace in its own template means, and `dedent`, `String.raw` and a `sql`/`gql` tag do not agree on that — and a template whose line breaks are all `\n` escapes, which occupies one source line and carries no indentation.
