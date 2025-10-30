## [2.3.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v2.3.0...v2.3.1) (2025-10-30)

### Bug Fixes

- update config list and remove duplicate rules ([#103](https://github.com/noshiro-pf/eslint-config-typed/issues/103)) ([f9a440f](https://github.com/noshiro-pf/eslint-config-typed/commit/f9a440f0320ef45905f2cbaa8fd2af487d62a3ab))

# [2.3.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v2.2.1...v2.3.0) (2025-10-29)

### Features

- fork eslint-plugin-strict-dependencies as a local plugin ([#102](https://github.com/noshiro-pf/eslint-config-typed/issues/102)) ([f093067](https://github.com/noshiro-pf/eslint-config-typed/commit/f093067011bc9d34029b45dc4514e6cb8ccaf93b))

## [2.2.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v2.2.0...v2.2.1) (2025-10-29)

### Bug Fixes

- treat RegExp as readonly in @typescript-eslint/prefer-readonly-parameter-types ([#101](https://github.com/noshiro-pf/eslint-config-typed/issues/101)) ([63b1ebf](https://github.com/noshiro-pf/eslint-config-typed/commit/63b1ebf03ef6964f2b820cc10de5f56d8d82d420))

# [2.2.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v2.1.0...v2.2.0) (2025-10-28)

### Features

- export restrictedSyntax and restrictedSyntaxForReact; update ignore list ([#99](https://github.com/noshiro-pf/eslint-config-typed/issues/99)) ([1ec3225](https://github.com/noshiro-pf/eslint-config-typed/commit/1ec3225865ba4bd07d7d5eba9cc5e75063c7f7d0))

# [2.1.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v2.0.0...v2.1.0) (2025-10-27)

### Features

- update plugins and ignore list ([#97](https://github.com/noshiro-pf/eslint-config-typed/issues/97)) ([2ca61c8](https://github.com/noshiro-pf/eslint-config-typed/commit/2ca61c800379090a6cce21585e5b36d2cdcc9ea4))

# [2.0.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.8.1...v2.0.0) (2025-10-26)

### Features

- **breaking:** update rule settings and configs ([#87](https://github.com/noshiro-pf/eslint-config-typed/issues/87)) ([48ccb65](https://github.com/noshiro-pf/eslint-config-typed/commit/48ccb6503b4976d4f98d2e48960eda490a38b69c))

### BREAKING CHANGES

- **breaking:** - Renamed all `eslintFlatConfigFor<Something>` to `eslintConfigFor<Something>`

* Added `eslintConfigForBrowser` and `eslintConfigForNodeJs`
* Updated rule settings in various configs for stricter linting
* Added `defineConfig` utility
* Removed unintentionally exported `RestrictedImportsOption` type
* Removed unintentionally exported internal implementations of `eslint-plugin-total-functions` and `eslint-plugin-tree-shakable` from exports
* Updated README

## [1.8.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.8.0...v1.8.1) (2025-10-23)

### Bug Fixes

- disable sort-destructure-keys rule ([#86](https://github.com/noshiro-pf/eslint-config-typed/issues/86)) ([ac64198](https://github.com/noshiro-pf/eslint-config-typed/commit/ac64198f33699ec47a7ae174c1f4ec97f8d21a22))

# [1.8.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.7.1...v1.8.0) (2025-10-23)

### Features

- add eslint-plugin-sort-destructure-keys ([#84](https://github.com/noshiro-pf/eslint-config-typed/issues/84)) ([05cc71d](https://github.com/noshiro-pf/eslint-config-typed/commit/05cc71d8c633b76871e097ffc08aee471a6305c0))

## [1.7.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.7.0...v1.7.1) (2025-10-16)

### Bug Fixes

- update packages ([#77](https://github.com/noshiro-pf/eslint-config-typed/issues/77)) ([7c6690c](https://github.com/noshiro-pf/eslint-config-typed/commit/7c6690c101235cf5244ac26d87a79b2b2caac9dd))

# [1.7.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.6.0...v1.7.0) (2025-10-11)

### Features

- update eslint plugins ([#68](https://github.com/noshiro-pf/eslint-config-typed/issues/68)) ([646c7f0](https://github.com/noshiro-pf/eslint-config-typed/commit/646c7f0eeeb91c33d772187b3c1aff9fe91eef18))

# [1.6.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.5.0...v1.6.0) (2025-10-11)

### Features

- update rules ([#66](https://github.com/noshiro-pf/eslint-config-typed/issues/66)) ([9cc8f28](https://github.com/noshiro-pf/eslint-config-typed/commit/9cc8f289f8e570a192a8e0fde17b0ffbb61f5eb6))

# [1.5.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.4.0...v1.5.0) (2025-10-11)

### Features

- add withDefaultOption utility ([#64](https://github.com/noshiro-pf/eslint-config-typed/issues/64)) ([db82ba8](https://github.com/noshiro-pf/eslint-config-typed/commit/db82ba8ab7a250bbcde707a2e5c1e9f141a24a68))

# [1.4.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.3.0...v1.4.0) (2025-10-11)

### Features

- fix gen-rule-type scripts and fix rules ([#65](https://github.com/noshiro-pf/eslint-config-typed/issues/65)) ([5f20ce9](https://github.com/noshiro-pf/eslint-config-typed/commit/5f20ce9703e69e240bed9f03156aeac5b119f51c))

# [1.3.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.12...v1.3.0) (2025-10-11)

### Features

- export defineKnownRules utility ([#63](https://github.com/noshiro-pf/eslint-config-typed/issues/63)) ([b977b05](https://github.com/noshiro-pf/eslint-config-typed/commit/b977b05553624c22d834539bbba205a56036808f))

## [1.2.12](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.11...v1.2.12) (2025-10-04)

### Bug Fixes

- bump eslint-plugin-testing-library from 7.8.0 to 7.11.0 ([#53](https://github.com/noshiro-pf/eslint-config-typed/issues/53)) ([f6426a2](https://github.com/noshiro-pf/eslint-config-typed/commit/f6426a2e2b658bfc84ab52d0cfca6582faea765d))

## [1.2.11](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.10...v1.2.11) (2025-10-04)

### Bug Fixes

- bump eslint-plugin-react-refresh from 0.4.18 to 0.4.23 ([#55](https://github.com/noshiro-pf/eslint-config-typed/issues/55)) ([9dcebb1](https://github.com/noshiro-pf/eslint-config-typed/commit/9dcebb1857593f8a3fbf81c1f624e3671b52568e))

## [1.2.10](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.9...v1.2.10) (2025-10-04)

### Bug Fixes

- bump eslint-plugin-react from 7.37.4 to 7.37.5 ([#54](https://github.com/noshiro-pf/eslint-config-typed/issues/54)) ([e9c5661](https://github.com/noshiro-pf/eslint-config-typed/commit/e9c5661c14213c23dba29e9a9fa542063ce75a73))

## [1.2.9](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.8...v1.2.9) (2025-10-04)

### Bug Fixes

- bump eslint-plugin-prefer-arrow-functions from 3.8.1 to 3.9.1 ([#52](https://github.com/noshiro-pf/eslint-config-typed/issues/52)) ([6472c99](https://github.com/noshiro-pf/eslint-config-typed/commit/6472c99ce0cf770eb53ac5deadd0d337c4c232da))

## [1.2.8](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.7...v1.2.8) (2025-09-27)

### Bug Fixes

- bump eslint-plugin-prefer-arrow-functions from 3.6.2 to 3.8.1 ([#51](https://github.com/noshiro-pf/eslint-config-typed/issues/51)) ([ed68b18](https://github.com/noshiro-pf/eslint-config-typed/commit/ed68b18b6f699ba8c2bd511cd352c36a4ee22be7))

## [1.2.7](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.6...v1.2.7) (2025-09-27)

### Bug Fixes

- bump @typescript-eslint/type-utils from 8.43.0 to 8.44.1 ([#48](https://github.com/noshiro-pf/eslint-config-typed/issues/48)) ([048308f](https://github.com/noshiro-pf/eslint-config-typed/commit/048308fa8cc5febc4adadc2dbd28d3cd8bdac2de))

## [1.2.6](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.5...v1.2.6) (2025-09-21)

### Bug Fixes

- bump eslint-plugin-testing-library from 7.1.1 to 7.8.0 ([#45](https://github.com/noshiro-pf/eslint-config-typed/issues/45)) ([be6ff02](https://github.com/noshiro-pf/eslint-config-typed/commit/be6ff02132e703218aefa75bd583d5e7f78e2d17))

## [1.2.5](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.4...v1.2.5) (2025-09-21)

### Bug Fixes

- bump eslint-plugin-playwright from 2.2.0 to 2.2.2 ([#43](https://github.com/noshiro-pf/eslint-config-typed/issues/43)) ([b278663](https://github.com/noshiro-pf/eslint-config-typed/commit/b27866326915c7c079c4f894d771936de0556613))

## [1.2.4](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.3...v1.2.4) (2025-09-21)

### Bug Fixes

- bump eslint-plugin-eslint-plugin from 6.4.0 to 7.0.0 ([#44](https://github.com/noshiro-pf/eslint-config-typed/issues/44)) ([6cd51bc](https://github.com/noshiro-pf/eslint-config-typed/commit/6cd51bcd69d5f153452f0ad1556cdc91eefb99cf))

## [1.2.3](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.2...v1.2.3) (2025-09-20)

### Bug Fixes

- bump eslint from 9.35.0 to 9.36.0 ([#42](https://github.com/noshiro-pf/eslint-config-typed/issues/42)) ([1a508d0](https://github.com/noshiro-pf/eslint-config-typed/commit/1a508d038dbd1e5b96b1b57c6330966301a3de27))

## [1.2.2](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.1...v1.2.2) (2025-09-16)

### Bug Fixes

- bump eslint from 9.33.0 to 9.35.0 ([#35](https://github.com/noshiro-pf/eslint-config-typed/issues/35)) ([19dd857](https://github.com/noshiro-pf/eslint-config-typed/commit/19dd85792823f2f11bfd657b0958a9cc3e7e5e1e))

## [1.2.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.2.0...v1.2.1) (2025-09-16)

### Bug Fixes

- update config ([#37](https://github.com/noshiro-pf/eslint-config-typed/issues/37)) ([90e28ea](https://github.com/noshiro-pf/eslint-config-typed/commit/90e28eaabb60b0768047f03eb45931a1b38dfbf7))

# [1.2.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.1.2...v1.2.0) (2025-09-10)

### Features

- update rule setting of unicorn/no-instanceof-builtins ([#32](https://github.com/noshiro-pf/eslint-config-typed/issues/32)) ([f8df2d0](https://github.com/noshiro-pf/eslint-config-typed/commit/f8df2d092d3eb11a0a64d9e204e4e8d22fa91552))

## [1.1.2](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.1.1...v1.1.2) (2025-09-10)

### Bug Fixes

- bump eslint-plugin-cypress from 4.1.0 to 5.1.1 ([#24](https://github.com/noshiro-pf/eslint-config-typed/issues/24)) ([ee84e82](https://github.com/noshiro-pf/eslint-config-typed/commit/ee84e82214c24627f8c8880d9dd4df376e257b52))

## [1.1.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.1.0...v1.1.1) (2025-09-10)

### Bug Fixes

- bump eslint-plugin-unicorn from 56.0.1 to 61.0.1 ([#29](https://github.com/noshiro-pf/eslint-config-typed/issues/29)) ([606f9a7](https://github.com/noshiro-pf/eslint-config-typed/commit/606f9a71ed2525a9fe614db932d1a75b099f7770))

# [1.1.0](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.0.3...v1.1.0) (2025-09-10)

### Features

- fix rule settings and enable @typescript-eslint/dot-notation ([#31](https://github.com/noshiro-pf/eslint-config-typed/issues/31)) ([324481a](https://github.com/noshiro-pf/eslint-config-typed/commit/324481a55c9fa6ab4d0f7de6a919b6ec44a98eee))

## [1.0.3](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.0.2...v1.0.3) (2025-08-24)

### Bug Fixes

- bump eslint-plugin-import from 2.31.0 to 2.32.0 ([#23](https://github.com/noshiro-pf/eslint-config-typed/issues/23)) ([cd3c1eb](https://github.com/noshiro-pf/eslint-config-typed/commit/cd3c1eb9e5ab3d33f4d43b263650a5d0ae994e19))

## [1.0.2](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.0.1...v1.0.2) (2025-08-20)

### Bug Fixes

- remove eslintDeprecationRules type ([#17](https://github.com/noshiro-pf/eslint-config-typed/issues/17)) ([7530b22](https://github.com/noshiro-pf/eslint-config-typed/commit/7530b2213beba7cfa63b3e308e3cdef4833a8d7d))

## [1.0.1](https://github.com/noshiro-pf/eslint-config-typed/compare/v1.0.0...v1.0.1) (2025-08-19)

### Bug Fixes

- fix custom plugin name ([#15](https://github.com/noshiro-pf/eslint-config-typed/issues/15)) ([8210900](https://github.com/noshiro-pf/eslint-config-typed/commit/82109009c03191e96901a901fd06d3414b747f65))

# 1.0.0 (2025-08-19)

### Features

- initialize eslint-config-typed ([#2](https://github.com/noshiro-pf/eslint-config-typed/issues/2)) ([c703354](https://github.com/noshiro-pf/eslint-config-typed/commit/c703354e93a1c2579d55ec4ab30ab844f9c6485e))
