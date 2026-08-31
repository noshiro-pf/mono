import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { tsubuRules } from './tsubu-rules.mjs';

/**
 * The Tsubu v1 ESLint preset (Phase 1 first version): eslint-config-typed +
 * eslint-plugin-ts-data-forge (the two packages the enforcement map draws
 * from) with the Tsubu overrides applied last, so they win flat-config
 * merging.
 *
 * Options are forwarded to eslintConfigForTypeScript unchanged; when `files`
 * is given, the override block is scoped to the same globs.
 */
export const eslintConfigForTsubu = (
  options: Readonly<{
    tsconfigFileName: string;
    tsconfigRootDir: string;
    packageDirs: readonly string[];
    files?: readonly string[];
    usingStrictTsLib?: boolean;
  }>,
): readonly FlatConfig[] =>
  [
    ...eslintConfigForTypeScript(options),
    eslintPluginTsDataForge.configs.recommended,
    options.files === undefined
      ? ({ rules: tsubuRules } as const)
      : ({ files: options.files, rules: tsubuRules } as const),
  ] as const;
