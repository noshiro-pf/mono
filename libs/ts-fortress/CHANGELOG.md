# [5.2.0](https://github.com/noshiro-pf/ts-fortress/compare/v5.1.0...v5.2.0) (2025-09-26)

### Features

- add constraints option to string, number, bigint ([#107](https://github.com/noshiro-pf/ts-fortress/issues/107)) ([1f2da8a](https://github.com/noshiro-pf/ts-fortress/commit/1f2da8aa373672f93b109296cfd881a960a10c03))

# [5.1.0](https://github.com/noshiro-pf/ts-fortress/compare/v5.0.1...v5.1.0) (2025-09-23)

### Features

- arrayAtLeastLength ([#106](https://github.com/noshiro-pf/ts-fortress/issues/106)) ([6262b4c](https://github.com/noshiro-pf/ts-fortress/commit/6262b4c397c8322f13bb01b5ee69c44cf3ebea68))

## [5.0.1](https://github.com/noshiro-pf/ts-fortress/compare/v5.0.0...v5.0.1) (2025-09-21)

### Bug Fixes

- bump ts-data-forge from 3.2.0 to 3.3.0 ([#93](https://github.com/noshiro-pf/ts-fortress/issues/93)) ([5529987](https://github.com/noshiro-pf/ts-fortress/commit/5529987cdbbb4bf33681771a139f7959392f87cc))

# [5.0.0](https://github.com/noshiro-pf/ts-fortress/compare/v4.4.0...v5.0.0) (2025-09-21)

### Features

- **breaking:** allow passing a simple primitive value to the brand defaultValue ([#105](https://github.com/noshiro-pf/ts-fortress/issues/105)) ([a834937](https://github.com/noshiro-pf/ts-fortress/commit/a834937b664c5df1f97cc030fc6e37163693bf67))

### BREAKING CHANGES

- **breaking:** - Removed stringLiteral, booleanLiteral, numberLiteral, bigintLiteral

* Limited brandable types from Primitive to string | number | bigint | boolean
* Allow passing a simple primitive value to the brand defaultValue
* Fixed regex of email
* Deprecated simpleBrandedString and simpleBrandedNumber

# [4.4.0](https://github.com/noshiro-pf/ts-fortress/compare/v4.3.1...v4.4.0) (2025-09-21)

### Features

- add predefined branded strings ([#104](https://github.com/noshiro-pf/ts-fortress/issues/104)) ([95c348e](https://github.com/noshiro-pf/ts-fortress/commit/95c348e7b7c1820a559ae00015d4b15d5e552eea))

## [4.3.1](https://github.com/noshiro-pf/ts-fortress/compare/v4.3.0...v4.3.1) (2025-09-21)

### Bug Fixes

- fix the implementation of brandedString ([#103](https://github.com/noshiro-pf/ts-fortress/issues/103)) ([215749f](https://github.com/noshiro-pf/ts-fortress/commit/215749fdafbb8a7fd621c978add9e794f562253a))

# [4.3.0](https://github.com/noshiro-pf/ts-fortress/compare/v4.2.1...v4.3.0) (2025-09-09)

### Features

- add required type ([#73](https://github.com/noshiro-pf/ts-fortress/issues/73)) ([33fa5c6](https://github.com/noshiro-pf/ts-fortress/commit/33fa5c6f5297cf63459c0f54163fc568d11ea6e1))

## [4.2.1](https://github.com/noshiro-pf/ts-fortress/compare/v4.2.0...v4.2.1) (2025-09-09)

### Bug Fixes

- fix default type name of union and intersection ([#72](https://github.com/noshiro-pf/ts-fortress/issues/72)) ([ea90f78](https://github.com/noshiro-pf/ts-fortress/commit/ea90f787edf17c5457b92e1cd1d31415c70d5ceb))

# [4.2.0](https://github.com/noshiro-pf/ts-fortress/compare/v4.1.2...v4.2.0) (2025-09-09)

### Features

- changed default typeName of some types ([#71](https://github.com/noshiro-pf/ts-fortress/issues/71)) ([d1c6dbb](https://github.com/noshiro-pf/ts-fortress/commit/d1c6dbb422ff880d5f446af319ec299e0d5e7b03))

## [4.1.2](https://github.com/noshiro-pf/ts-fortress/compare/v4.1.1...v4.1.2) (2025-09-08)

### Bug Fixes

- update README about comparison ([#69](https://github.com/noshiro-pf/ts-fortress/issues/69)) ([7febfbc](https://github.com/noshiro-pf/ts-fortress/commit/7febfbcd717a215acd2d795059fbf6c9e7293327))

## [4.1.1](https://github.com/noshiro-pf/ts-fortress/compare/v4.1.0...v4.1.1) (2025-09-07)

### Bug Fixes

- fix type annotation of strictRecord ([#68](https://github.com/noshiro-pf/ts-fortress/issues/68)) ([bbf57a0](https://github.com/noshiro-pf/ts-fortress/commit/bbf57a0ea6ac0d48d3e837c195a646494c2c1814))

# [4.1.0](https://github.com/noshiro-pf/ts-fortress/compare/v4.0.0...v4.1.0) (2025-09-07)

### Features

- add valueof type ([#67](https://github.com/noshiro-pf/ts-fortress/issues/67)) ([c9b44e2](https://github.com/noshiro-pf/ts-fortress/commit/c9b44e2e09f0e52f07440b071635a45da428fef3))

# [4.0.0](https://github.com/noshiro-pf/ts-fortress/compare/v3.2.0...v4.0.0) (2025-09-07)

### Features

- **breaking:** Shape can now be extracted from record type definitions ([#66](https://github.com/noshiro-pf/ts-fortress/issues/66)) ([ba7d6f3](https://github.com/noshiro-pf/ts-fortress/commit/ba7d6f34c39655af36cd34de0d37585a87f8cdc0))

### BREAKING CHANGES

- **breaking:** - `partial` type now fills missing keys with default values from the original type.

* `pick`, `omit` and `partial` now inherits `allowExcessProperties` option from the original type.

# [3.2.0](https://github.com/noshiro-pf/ts-fortress/compare/v3.1.0...v3.2.0) (2025-09-06)

### Features

- add MapType and SetType ([#65](https://github.com/noshiro-pf/ts-fortress/issues/65)) ([08c2210](https://github.com/noshiro-pf/ts-fortress/commit/08c221058abb9a627fe2b0c82f9851865c3cdad3))

# [3.1.0](https://github.com/noshiro-pf/ts-fortress/compare/v3.0.1...v3.1.0) (2025-09-06)

### Features

- add nullable type ([#63](https://github.com/noshiro-pf/ts-fortress/issues/63)) ([f2e5f93](https://github.com/noshiro-pf/ts-fortress/commit/f2e5f937fc7ae412b6cc5921901dcf3b07272ece))

## [3.0.1](https://github.com/noshiro-pf/ts-fortress/compare/v3.0.0...v3.0.1) (2025-08-30)

### Bug Fixes

- fix JSDoc of ValidationError ([#55](https://github.com/noshiro-pf/ts-fortress/issues/55)) ([89a3a01](https://github.com/noshiro-pf/ts-fortress/commit/89a3a01d6b233dee776e791ce4d31a40c483d78c))

# [3.0.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.10.0...v3.0.0) (2025-08-30)

### Features

- **breaking:** change the interface of brand function ([#54](https://github.com/noshiro-pf/ts-fortress/issues/54)) ([3420611](https://github.com/noshiro-pf/ts-fortress/commit/34206119bcb34129744df6e916089aa534888f60))

# [2.10.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.9.0...v2.10.0) (2025-08-30)

### Features

- add refine type utility ([#53](https://github.com/noshiro-pf/ts-fortress/issues/53)) ([89c1ab3](https://github.com/noshiro-pf/ts-fortress/commit/89c1ab31b4696a902260e7cd1f6b84d9ff50f689))

# [2.9.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.8.0...v2.9.0) (2025-08-30)

### Features

- add literal function and deprecate stringLiteral, numberLiteral, booleanLiteral, bigintLiteral ([#52](https://github.com/noshiro-pf/ts-fortress/issues/52)) ([71aff0f](https://github.com/noshiro-pf/ts-fortress/commit/71aff0f5ba6e629ec928841cad0332ae8387669d))

# [2.8.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.7.0...v2.8.0) (2025-08-30)

### Features

- support optional typeName argument in brand function and add ty… ([#51](https://github.com/noshiro-pf/ts-fortress/issues/51)) ([c64f6a1](https://github.com/noshiro-pf/ts-fortress/commit/c64f6a1f29737c0d2940b4461db5c81cabc22eb6))

# [2.7.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.6.2...v2.7.0) (2025-08-30)

### Features

- improve validation error messages to be more human readable ([#50](https://github.com/noshiro-pf/ts-fortress/issues/50)) ([c56c68e](https://github.com/noshiro-pf/ts-fortress/commit/c56c68e355ed8554ca15e744709cc83dad2e18d7))

## [2.6.2](https://github.com/noshiro-pf/ts-fortress/compare/v2.6.1...v2.6.2) (2025-08-30)

### Bug Fixes

- fix validation error message for stringLiteral ([#48](https://github.com/noshiro-pf/ts-fortress/issues/48)) ([e4c28b6](https://github.com/noshiro-pf/ts-fortress/commit/e4c28b6666c308b066a6a6ee23afefc3f0802dc9))

## [2.6.1](https://github.com/noshiro-pf/ts-fortress/compare/v2.6.0...v2.6.1) (2025-08-29)

### Bug Fixes

- fix build script to support new entry-point ([#41](https://github.com/noshiro-pf/ts-fortress/issues/41)) ([773e61b](https://github.com/noshiro-pf/ts-fortress/commit/773e61be4f1b071b144a98476a00f30d11549c12))

# [2.6.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.5.0...v2.6.0) (2025-08-28)

### Features

- re-export ts-data-forge utilities ([#40](https://github.com/noshiro-pf/ts-fortress/issues/40)) ([e915648](https://github.com/noshiro-pf/ts-fortress/commit/e9156482ac58523cc27bbd3bf7fb71e01abec651))

# [2.5.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.4.0...v2.5.0) (2025-08-28)

### Features

- add intRange, int8, uint8 type ([#39](https://github.com/noshiro-pf/ts-fortress/issues/39)) ([086ff03](https://github.com/noshiro-pf/ts-fortress/commit/086ff035ea4d1f7404ed7d00dd1480b34f21b4cf))

# [2.4.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.3.0...v2.4.0) (2025-08-17)

### Features

- add JsonType ([#30](https://github.com/noshiro-pf/ts-fortress/issues/30)) ([cc1ea52](https://github.com/noshiro-pf/ts-fortress/commit/cc1ea5265aa83e1513f3513611ec224164689aee))

# [2.3.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.2.2...v2.3.0) (2025-08-15)

### Features

- add recursion type ([#24](https://github.com/noshiro-pf/ts-fortress/issues/24)) ([92ddab0](https://github.com/noshiro-pf/ts-fortress/commit/92ddab0d6bf506f1f9412e53202f1f946a3cbfa8))

## [2.2.2](https://github.com/noshiro-pf/ts-fortress/compare/v2.2.1...v2.2.2) (2025-08-15)

### Bug Fixes

- return original object as ok value of validate function ([#23](https://github.com/noshiro-pf/ts-fortress/issues/23)) ([828bd7b](https://github.com/noshiro-pf/ts-fortress/commit/828bd7b82d50594a05072b0c678159d639e9f737))

## [2.2.1](https://github.com/noshiro-pf/ts-fortress/compare/v2.2.0...v2.2.1) (2025-08-14)

### Bug Fixes

- improve type annotation for record ([#18](https://github.com/noshiro-pf/ts-fortress/issues/18)) ([b2c774a](https://github.com/noshiro-pf/ts-fortress/commit/b2c774a2c5f42bf193dc1d2e8e915cd5fa4f5859))

# [2.2.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.1.0...v2.2.0) (2025-08-14)

### Features

- add strictRecord ([#17](https://github.com/noshiro-pf/ts-fortress/issues/17)) ([6f40a71](https://github.com/noshiro-pf/ts-fortress/commit/6f40a71c0bd64f510ff2b3d0a63ac7724f3e3eec))

# [2.1.0](https://github.com/noshiro-pf/ts-fortress/compare/v2.0.4...v2.1.0) (2025-08-14)

### Features

- add allowExcessProperties option to record ([#13](https://github.com/noshiro-pf/ts-fortress/issues/13)) ([026022e](https://github.com/noshiro-pf/ts-fortress/commit/026022ee144a7a5eaf059d4ed44039bab56dc657))

## [2.0.4](https://github.com/noshiro-pf/ts-fortress/compare/v2.0.3...v2.0.4) (2025-08-14)

### Bug Fixes

- fix validation result of partial ([#15](https://github.com/noshiro-pf/ts-fortress/issues/15)) ([b45e09a](https://github.com/noshiro-pf/ts-fortress/commit/b45e09acfe7009fb5649770c1f5842dd61d3af73))

## [2.0.3](https://github.com/noshiro-pf/ts-fortress/compare/v2.0.2...v2.0.3) (2025-08-14)

### Bug Fixes

- fix validation result of omit and pick ([#14](https://github.com/noshiro-pf/ts-fortress/issues/14)) ([01303f2](https://github.com/noshiro-pf/ts-fortress/commit/01303f236cbc8fe147e121d9b9e33e0e0367e513))

## [2.0.2](https://github.com/noshiro-pf/ts-fortress/compare/v2.0.1...v2.0.2) (2025-08-14)

### Bug Fixes

- fix README ([#12](https://github.com/noshiro-pf/ts-fortress/issues/12)) ([d21aa8a](https://github.com/noshiro-pf/ts-fortress/commit/d21aa8a0e8ff71d6ae9e24b7759d0a22ba150c1b))

## [2.0.1](https://github.com/noshiro-pf/ts-fortress/compare/v2.0.0...v2.0.1) (2025-08-13)

### Bug Fixes

- fix entry point ([#11](https://github.com/noshiro-pf/ts-fortress/issues/11)) ([71de0b2](https://github.com/noshiro-pf/ts-fortress/commit/71de0b20443ca3814f208e99e4c2a932866da4eb))

# [2.0.0](https://github.com/noshiro-pf/ts-fortress/compare/v1.0.0...v2.0.0) (2025-08-13)

### Features

- **breaking:** use ValidationError object ([#10](https://github.com/noshiro-pf/ts-fortress/issues/10)) ([9c20f9d](https://github.com/noshiro-pf/ts-fortress/commit/9c20f9d1e572fe068a579a8c955e807fbfb75e42))

# 1.0.0 (2025-08-13)

### Bug Fixes

- and remove dry-run flag from semantic-release ([#9](https://github.com/noshiro-pf/ts-fortress/issues/9)) ([e6eef06](https://github.com/noshiro-pf/ts-fortress/commit/e6eef06f93f75046b2c60cc01cc5c3dc541cb659))

### Features

- **breaking:** initialize repo ([#8](https://github.com/noshiro-pf/ts-fortress/issues/8)) ([9ce8493](https://github.com/noshiro-pf/ts-fortress/commit/9ce8493b420e1e017e06eeffcca0b8c015b61de0))
