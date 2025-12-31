# ts-codemod-lib

<!--
[![npm version](https://img.shields.io/npm/v/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![npm downloads](https://img.shields.io/npm/dm/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![License](https://img.shields.io/npm/l/ts-codemod-lib.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-codemod-lib/branch/main/graph/badge.svg?token=********)](https://codecov.io/gh/noshiro-pf/ts-codemod-lib)
 -->

A TypeScript library for building codemods and AST transformations

## Documentation

- API reference: <https://noshiro-pf.github.io/ts-codemod-lib/>

## Local Setup

```sh
git clone https://github.com/noshiro-pf/ts-codemod-lib.git
git submodule update --init --recursive
pnpm i
```

## Syncing AGENTS.md Updates

1. Update `AGENTS.md` in the common repository (`common-agent-config`)
2. Update the submodule in each project

```bash
git submodule update --remote --merge
git add agents/common
git commit -m "Update AGENTS.md"
```
