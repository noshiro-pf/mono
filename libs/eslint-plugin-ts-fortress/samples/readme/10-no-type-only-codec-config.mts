// eslint.config.mts
import {
  eslintPluginTsFortress,
  type EslintTsFortressRules,
} from 'eslint-plugin-ts-fortress';
import * as path from 'node:path';

export default [
  eslintPluginTsFortress.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'ts-fortress/no-type-only-codec': [
        'error',
        {
          entryPoints: [path.resolve(import.meta.dirname, 'src/index.mts')],
        },
      ],
    } satisfies Partial<EslintTsFortressRules>,
  },
];
