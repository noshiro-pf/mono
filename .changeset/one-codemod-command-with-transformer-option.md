---
'ts-codemod-cli': major
---

**BREAKING**: the five per-transformer executables — `append-as-const`,
`convert-interface-to-type`, `convert-to-readonly`, `replace-any-with-unknown`
and `replace-record-with-unknown-record` — are replaced by a single
`ts-codemod` command that takes the transformers as options:

```sh
# before
npx append-as-const 'src/**/*.mts'
npx convert-to-readonly 'src/**/*.mts'

# after
npx ts-codemod -t append-as-const -t convert-to-readonly 'src/**/*.mts'
```

`--transformer` (`-t`) is given once per transformer and every other option is
unchanged. The point of the change is the pass count: each executable ran
`runTransformerCLI` with a one-element array, so applying two transformers to
the same files read, parsed and wrote every file twice. One command applies all
of the selected transformers to a file in a single parse, in the order given.

Passing no `--transformer` is an error, and a transformer named twice is applied
once.
