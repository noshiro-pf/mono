---
'@sumi-lang/oxlint-config': patch
'@sumi-lang/cli': patch
---

Stop `sumi check` from obeying ESLint's disable comments, and let
`@sumi-expect-error` sit above one.

oxlint reads `eslint-disable*` comments by default and matches them by rule
name alone, so `// eslint-disable-next-line total-functions/no-unsafe-type-assertion`
silenced `typescript/no-unsafe-type-assertion` as well. A comment written
for ESLint went past the one guarantee `@sumi-expect-error` exists for: a
marker nothing answers fails. The preset now sets
`respectEslintDisableDirectives: false`.

A line both engines report then needs both comments, and ESLint's applies
only to the line right after it. A marker therefore skips over an
`eslint-disable-next-line` or `oxlint-disable-next-line` line beneath it and
applies to the code after that. Any other comment line is still the line a
marker applies to, because a diagnostic can sit on a comment (`// @ts-ignore`).
An unused marker is reported on its own line, which is no longer always the
line above the code.
