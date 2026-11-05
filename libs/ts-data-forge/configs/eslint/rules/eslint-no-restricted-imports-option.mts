import {
  restrictedImportsOptions,
  type EslintRulesOption,
} from 'eslint-config-typed';

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
        // The base pattern's own regex, so that `check:root:restricted-imports`
        // recognizes it; only the message is this package's.
        regex: restrictedImportsOptions.patterns[0].regex,
        message:
          'Do not specify index.mjs directly by relative path. Import it via the parent directory name (e.g. ./X/index.mjs) or move the shared module to a sibling file (e.g. ./X.mjs).',
      },
    ],
  },
] as const satisfies EslintRulesOption['no-restricted-imports'];
