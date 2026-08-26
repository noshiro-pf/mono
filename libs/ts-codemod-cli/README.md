# ts-codemod-cli

Command line interface for [`ts-codemod-lib`](../ts-codemod-lib).

```sh
npm install -D ts-codemod-cli
```

One command, `ts-codemod`, applies the transformers named by `--transformer`
(`-t`), given once per transformer:

| `--transformer`                      | what it does                              |
| :----------------------------------- | :---------------------------------------- |
| `append-as-const`                    | appends `as const` to object literals     |
| `convert-interface-to-type`          | rewrites `interface` as a type alias      |
| `convert-to-readonly`                | makes types readonly                      |
| `enable-no-unchecked-indexed-access` | appends `!` to unchecked index accesses   |
| `replace-any-with-unknown`           | replaces `any` with `unknown`             |
| `replace-record-with-unknown-record` | replaces `Record<…>` with `UnknownRecord` |

Every selected transformer runs against each file in a single parse, in the
order given, so asking for several at once costs one pass rather than one per
transformer.

The positional argument is a glob for the files to transform. `--uncommitted`
restricts the run to files git reports as untracked, modified or staged;
`--diff-from <ref>` restricts it to files that differ from a branch or commit.

```sh
npx ts-codemod -t convert-to-readonly 'src/**/*.mts'
npx ts-codemod -t append-as-const -t convert-to-readonly 'src/**/*.mts'
npx ts-codemod -t convert-to-readonly --diff-from origin/main 'src/**/*.mts'
```

Run it with `--help` for the full option list.

The transformers themselves are exported by `ts-codemod-lib`, which this
package wraps. Install that instead if you want to call them from your own
code.
