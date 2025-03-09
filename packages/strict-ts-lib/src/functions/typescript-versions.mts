import { type SemVer } from './types.mjs';

/**
 * A list of TypeScript version for which to generate strict-ts-lib definitions.
 * The first element of the list is the latest version.
 */
export const typescriptVersions = ['5.7.2'] as const satisfies SemVer[];
