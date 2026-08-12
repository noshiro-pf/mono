---
'ts-codemod-lib': major
---

Move the command line interface to the new `ts-codemod-cli` package. This
package now ships the transformers only.

The five executables — `append-as-const`, `convert-interface-to-type`,
`convert-to-readonly`, `replace-any-with-unknown` and
`replace-record-with-unknown-record` — were unusable as published: they import
`cmd-ts`, `dedent` and `ts-repo-utils`, which were declared as _optional_ peer
dependencies, so npm never installed them and running any of the commands
failed with `ERR_MODULE_NOT_FOUND`. Splitting them out lets those become
ordinary dependencies of the package that needs them, without putting them in
the install of anyone who only imports the transformers.

To keep using the commands, install `ts-codemod-cli` instead:

```sh
npm install -D ts-codemod-cli
```
