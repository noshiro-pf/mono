import { type EslintTsFortressRules } from 'eslint-plugin-ts-fortress';
import * as path from 'node:path';

export const rules = {
  // embed-sample-code-ignore-above
  'ts-fortress/no-type-only-codec': [
    'error',
    { entryPoints: [path.resolve(import.meta.dirname, 'src/public-api.mts')] },
  ],
  // embed-sample-code-ignore-below
} as const satisfies Partial<EslintTsFortressRules>;
