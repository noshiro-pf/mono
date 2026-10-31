---
'eslint-config-typed': minor
---

Add `ts-restrictions/no-ragged-comment-wrap`, `error` in
`eslintTsRestrictionsRules`. Prettier does not reflow comments, so a comment
paragraph edited after it was wrapped keeps the line breaks the edit left. The
rule reports a line, in a run of `//` comments or a `/** … */` block, with room
for the first word of the line after it within the print width, and its fix
refills the paragraph, keeping the indentation and the comment prefix and never
starting a line with a word that means something else there (`@tag`, `-`, `>`,
`#`, `1.`).

The print width is the `printWidth` option, else that of the nearest Prettier
configuration, looked for as Prettier does and read only when it is JSON
(`package.json`'s `prettier` key, `.prettierrc`, `.prettierrc.json`); any other
nearest configuration, and no configuration, gives 80.

The rule leaves alone what it cannot judge: list items, JSDoc tags and what
follows them, fenced or indented code, tables, headings, URLs, East Asian text
and emoji, directives, markers and labels, commented-out code, license headers,
and paragraphs with an unpaired backtick or tab indentation. It neither reports
nor joins after a line that ends a sentence or a Markdown hard line break,
after a one-word line, before a line that starts with a capital, or between two
lines that end with commas. A code span or an inline tag is one word. No fix is
offered in a file with `\r\n` line endings.
