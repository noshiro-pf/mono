// eslint.config.mts
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';

export default [
  eslintPluginTsFortress.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
