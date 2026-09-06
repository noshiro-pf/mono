import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { sumiRules } from './sumi-rules.mjs';

/**
 * The Sumi lint ESLint preset (Phase 1 first version): eslint-config-typed +
 * eslint-plugin-ts-data-forge (the two packages the enforcement map draws
 * from) with the Sumi overrides applied last, so they win flat-config
 * merging.
 *
 * Options are forwarded to eslintConfigForTypeScript unchanged; when `files`
 * is given, the override block is scoped to the same globs.
 */
export const eslintConfigForSumi = (
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
      ? ({ rules: sumiRules } as const)
      : ({ files: options.files, rules: sumiRules } as const),
  ] as const;
