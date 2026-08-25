import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v7.0',
  repo: 'https://github.com/noshiro-pf/mono.git',
  license: 'Apache-2.0',
  typescriptVersion: '7.0.2',
  // Wider than the "one minor per package" rule the other versions follow.
  // TypeScript 6.0.3 compiles this lib set with `skipLibCheck: false` and no
  // errors, and resolves it through the same `@typescript/lib-*` name lookup
  // TypeScript 7 uses, so one package serves both — which is what lets a
  // consumer (and this repository) link once instead of configuring a `paths`
  // route for one compiler and a name route for the other.
  typescriptVersionRange: '>=6.0.0 <8.0.0',
  // TypeScript 7.0 (the native port) develops and ships its lib files from
  // `microsoft/typescript-go`; `microsoft/TypeScript` has no `v7.0.2` tag.
  libSource: {
    repo: 'microsoft/typescript-go',
    ref: 'typescript/v7.0.2',
    dir: 'internal/bundled/libs',
  },
} as const satisfies VersionConfig;
