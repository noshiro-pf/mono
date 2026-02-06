## [1.4.2](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.4.1...v1.4.2) (2026-02-06)

### Bug Fixes

- prevent append-as-const to add const assertion to import statements or directives ([#36](https://github.com/noshiro-pf/ts-codemod-lib/issues/36)) ([c0a8334](https://github.com/noshiro-pf/ts-codemod-lib/commit/c0a8334cc461d818b5a28c020fe0bf88644ee5b9))

## [1.4.1](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.4.0...v1.4.1) (2026-02-06)

### Bug Fixes

- fix append-as-const transformer ([#34](https://github.com/noshiro-pf/ts-codemod-lib/issues/34)) ([c59e6b7](https://github.com/noshiro-pf/ts-codemod-lib/commit/c59e6b78fa70cb3d286e4d65797d8607630bd170))

# [1.4.0](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.3.1...v1.4.0) (2026-02-06)

### Features

- add uncommitted flag option ([#33](https://github.com/noshiro-pf/ts-codemod-lib/issues/33)) ([a334bae](https://github.com/noshiro-pf/ts-codemod-lib/commit/a334bae93950bc37d1dbba9bdec87a1183ec30fb))

## [1.3.1](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.3.0...v1.3.1) (2026-02-02)

### Bug Fixes

- prevent append-as-const to remove necessary `as const` ([#23](https://github.com/noshiro-pf/ts-codemod-lib/issues/23)) ([6899093](https://github.com/noshiro-pf/ts-codemod-lib/commit/68990938b1a6a70f59a7630b1895277891e22383))

# [1.3.0](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.2.0...v1.3.0) (2026-02-02)

### Features

- add ignore keywords ([#22](https://github.com/noshiro-pf/ts-codemod-lib/issues/22)) ([8707ef9](https://github.com/noshiro-pf/ts-codemod-lib/commit/8707ef9e5e209c97e0514f49cf00a6148628f404))

# [1.2.0](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.1.3...v1.2.0) (2026-01-27)

### Features

- improve transformer-ignore feature ([#18](https://github.com/noshiro-pf/ts-codemod-lib/issues/18)) ([c0202d1](https://github.com/noshiro-pf/ts-codemod-lib/commit/c0202d187a3912abb178ab07c9c7cbee74141c16))

## [1.1.3](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.1.2...v1.1.3) (2026-01-25)

### Bug Fixes

- fix convertToReadonlyTypeTransformer behavior for `"aaa" & {}` ([#16](https://github.com/noshiro-pf/ts-codemod-lib/issues/16)) ([93f045e](https://github.com/noshiro-pf/ts-codemod-lib/commit/93f045ea6c520e57ff218e2bd5fa28bd32baf00c))

## [1.1.2](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.1.1...v1.1.2) (2026-01-25)

### Bug Fixes

- update default ignorePrefixes of convert-to-readonly and remove "-cli" suffix from commands name ([#14](https://github.com/noshiro-pf/ts-codemod-lib/issues/14)) ([0462ba9](https://github.com/noshiro-pf/ts-codemod-lib/commit/0462ba999f80ac6d508f6287a5232c2363f3aff5))

## [1.1.1](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.1.0...v1.1.1) (2026-01-23)

### Bug Fixes

- change node version requirements ([#13](https://github.com/noshiro-pf/ts-codemod-lib/issues/13)) ([1bb382e](https://github.com/noshiro-pf/ts-codemod-lib/commit/1bb382e24a9c6ec66a9f01ee09adafc7386184b7))

# [1.1.0](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.0.1...v1.1.0) (2026-01-23)

### Features

- add transformer and CLI commands ([#12](https://github.com/noshiro-pf/ts-codemod-lib/issues/12)) ([3f99181](https://github.com/noshiro-pf/ts-codemod-lib/commit/3f991814ef30bc7ed0197b5720edf41ec0f01fd4))

## [1.0.1](https://github.com/noshiro-pf/ts-codemod-lib/compare/v1.0.0...v1.0.1) (2026-01-11)

### Bug Fixes

- pnpm update ([#4](https://github.com/noshiro-pf/ts-codemod-lib/issues/4)) ([f87860a](https://github.com/noshiro-pf/ts-codemod-lib/commit/f87860aed479bf4ed5c5a3c23830c5817193620a))

# 1.0.0 (2026-01-07)

### Features

- add initial AST-transformers ([#1](https://github.com/noshiro-pf/ts-codemod-lib/issues/1)) ([1721790](https://github.com/noshiro-pf/ts-codemod-lib/commit/17217907c6c1e7c4e41d7c992b3f3fceba18c643))
