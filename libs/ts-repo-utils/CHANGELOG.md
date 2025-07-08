# [3.1.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v3.0.1...v3.1.0) (2025-07-08)

### Features

- add workspace-utils functions ([#39](https://github.com/noshiro-pf/ts-repo-utils/issues/39)) ([4e8d9e4](https://github.com/noshiro-pf/ts-repo-utils/commit/4e8d9e4c7096bdcf3ece5a2d815922d72225f337))

## [3.0.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v3.0.0...v3.0.1) (2025-07-01)

### Bug Fixes

- rename assertRepoIsDirty to assertRepoIsClean and update references ([#38](https://github.com/noshiro-pf/ts-repo-utils/issues/38)) ([d43db04](https://github.com/noshiro-pf/ts-repo-utils/commit/d43db040d4fbfde92147678fe669d6e34c943f53))

# [3.0.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.3.1...v3.0.0) (2025-07-01)

### Bug Fixes

- bump major version of ts-repo-utils ([#37](https://github.com/noshiro-pf/ts-repo-utils/issues/37)) ([7dfbc26](https://github.com/noshiro-pf/ts-repo-utils/commit/7dfbc26e09905a89e66c4e9af7c20b88b383bd50))

### BREAKING CHANGES

- rename assertRepoIsDirty to assertRepoIsClean

## [2.3.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.3.0...v2.3.1) (2025-07-01)

### Bug Fixes

- fix the name of assertRepoIsClean fn ([#36](https://github.com/noshiro-pf/ts-repo-utils/issues/36)) ([a6fd97f](https://github.com/noshiro-pf/ts-repo-utils/commit/a6fd97f522c1780ef3ee7a2b4e50e34fd7d9d59a))

# [2.3.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.2.2...v2.3.0) (2025-07-01)

### Features

- add silent option to all functions and use git ls-files in getUntrackedFiles ([#34](https://github.com/noshiro-pf/ts-repo-utils/issues/34)) ([0b66367](https://github.com/noshiro-pf/ts-repo-utils/commit/0b663675d877a8664b1b3b3e21aa25bdad901a63))

## [2.2.2](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.2.1...v2.2.2) (2025-06-28)

### Bug Fixes

- bump ts-data-forge from 1.1.0 to 1.2.0 ([#32](https://github.com/noshiro-pf/ts-repo-utils/issues/32)) ([9c82696](https://github.com/noshiro-pf/ts-repo-utils/commit/9c82696a59c649f3da40499505809c1086803819))

## [2.2.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.2.0...v2.2.1) (2025-06-28)

### Bug Fixes

- bump prettier from 3.5.3 to 3.6.2 ([#29](https://github.com/noshiro-pf/ts-repo-utils/issues/29)) ([eb4227d](https://github.com/noshiro-pf/ts-repo-utils/commit/eb4227d98d49b3a896c766beadbb4eb149a73d11))

# [2.2.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.1.0...v2.2.0) (2025-06-24)

### Features

- update assertExt to support multiple extensions for each directory ([#26](https://github.com/noshiro-pf/ts-repo-utils/issues/26)) ([2ecdde2](https://github.com/noshiro-pf/ts-repo-utils/commit/2ecdde25a4c87e4c987bbd0b46761198e2f03e74))

# [2.1.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v2.0.0...v2.1.0) (2025-06-23)

### Features

- update ts-data-forge to fix Result type ([#23](https://github.com/noshiro-pf/ts-repo-utils/issues/23)) ([48fb1a0](https://github.com/noshiro-pf/ts-repo-utils/commit/48fb1a05cab301cef421e5bb840f3afff1722c4c))

# [2.0.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.2.1...v2.0.0) (2025-06-22)

### Features

- use Result pattern ([#21](https://github.com/noshiro-pf/ts-repo-utils/issues/21)) ([9388086](https://github.com/noshiro-pf/ts-repo-utils/commit/938808681f2d88f976b5b73b812f15cabfeecf06))

### BREAKING CHANGES

-   - Removed ExecResult type and changed the return type of `$`

* Renamed `formatChanged` to `formatUntracked`.
* Removed default argument `"main"` for `formatDiffFrom`.
* Add diff function to get the diff of a file or directory.

## [1.2.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.2.0...v1.2.1) (2025-06-22)

### Reverts

- Revert "chore: bump @rollup/plugin-typescript from 12.1.2 to 12.1.3 ([#11](https://github.com/noshiro-pf/ts-repo-utils/issues/11))" ([#19](https://github.com/noshiro-pf/ts-repo-utils/issues/19)) ([a364e06](https://github.com/noshiro-pf/ts-repo-utils/commit/a364e06f6ecda256c4181058e277f37326af8597))

# [1.2.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.1.0...v1.2.0) (2025-06-16)

### Features

- fix globals and gen index implementations ([#7](https://github.com/noshiro-pf/ts-repo-utils/issues/7)) ([fe666cf](https://github.com/noshiro-pf/ts-repo-utils/commit/fe666cf2e063588e1f8832fdf312e6302c220947))

# [1.1.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.0.1...v1.1.0) (2025-06-16)

### Features

- exit with code 1 on error ([#6](https://github.com/noshiro-pf/ts-repo-utils/issues/6)) ([4493a1a](https://github.com/noshiro-pf/ts-repo-utils/commit/4493a1ad2d8ed25ad1e36e13cebcc2fa1a49aa8b))

## [1.0.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.0.0...v1.0.1) (2025-06-16)

### Bug Fixes

- fix release workflow and README ([#5](https://github.com/noshiro-pf/ts-repo-utils/issues/5)) ([1cb6b29](https://github.com/noshiro-pf/ts-repo-utils/commit/1cb6b2978104f7145db65bcb10df37ebaff17731))

# 1.0.0 (2025-06-16)

### Features

- add repo utilities ([#4](https://github.com/noshiro-pf/ts-repo-utils/issues/4)) ([e276ec0](https://github.com/noshiro-pf/ts-repo-utils/commit/e276ec094efc7ca5a10b925e06314c239868c03e))
