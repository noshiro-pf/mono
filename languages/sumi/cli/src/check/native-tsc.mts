import { createRequire } from 'node:module';
import * as path from 'node:path';

/**
 * The native TypeScript compiler (`typescript-native`, TypeScript >= 7) this
 * package depends on. Both the config dump (`--showConfig`) and the type
 * check run through it, so `sumi check` type-checks with one compiler — the
 * one the locked options are written for (`libReplacement`, `erasableSyntaxOnly`).
 */
export const nativeTscPath = path.join(
  path.dirname(
    createRequire(import.meta.url).resolve('typescript-native/package.json'),
  ),
  'bin/tsc',
);
