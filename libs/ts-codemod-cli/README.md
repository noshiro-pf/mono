# ts-codemod-cli

Command line interface for [`ts-codemod-lib`](../ts-codemod-lib).

```sh
npm install -D ts-codemod-cli
```

| command                              | transformer                               |
| :----------------------------------- | :---------------------------------------- |
| `append-as-const`                    | appends `as const` to object literals     |
| `convert-interface-to-type`          | rewrites `interface` as a type alias      |
| `convert-to-readonly`                | makes types readonly                      |
| `replace-any-with-unknown`           | replaces `any` with `unknown`             |
| `replace-record-with-unknown-record` | replaces `Record<…>` with `UnknownRecord` |

Each takes a glob for the files to transform. `--uncommitted` restricts the
run to files git reports as untracked, modified or staged; `--diff-from <ref>`
restricts it to files that differ from a branch or commit.

```sh
npx convert-to-readonly 'src/**/*.mts'
npx convert-to-readonly --diff-from origin/main 'src/**/*.mts'
```

Run any of them with `--help` for the full option list.

The transformers themselves are exported by `ts-codemod-lib`, which this
package wraps. Install that instead if you want to call them from your own
code.
