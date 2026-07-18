import { type TypeScriptEslintRulesOption } from 'eslint-config-typed';

export const restrictedImports = [
  {
    paths: [
      {
        name: '.',
        message:
          "Barrel re-export via '.' is not allowed. Use explicit relative paths instead.",
      },
      {
        name: '..',
        message:
          "Barrel re-export via '..' is not allowed. Use explicit relative paths instead.",
      },
    ],
    patterns: [
      {
        regex: String.raw`^(\.\/|\.\.\/)+index\.(js|ts|d\.ts|mjs|mts|d\.mts|cjs|cts|d\.cts|jsx|tsx)$`,
        message:
          'Do not specify index.mjs directly by relative path. Import it via the parent directory name (e.g. ./X/index.mjs) or move the shared module to a sibling file (e.g. ./X.mjs).',
      },
    ],
  },
] as const satisfies TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-imports'];
