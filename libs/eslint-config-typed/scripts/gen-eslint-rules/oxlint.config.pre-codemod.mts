// The lint pass before the codemod. See `generateRulesType` in `main.mts` for
// why it is a pass of its own.
import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript'],
  // oxlint turns `correctness` on by default; only the rules listed here run.
  categories: { correctness: 'off' },
  rules: {
    'typescript/consistent-indexed-object-style': ['error', 'record'],
  },
});
