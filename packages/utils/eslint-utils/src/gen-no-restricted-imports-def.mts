import { restrictedImportsOption } from './rules/typescript-eslint-rules.mjs';
import { type TypeScriptEslintRulesOption } from './types/rules/typescript-eslint-rules.mjs';
import { type RestrictedImportsOption } from './types/types.mjs';

/**
 * Restrict prohibited imports defined in package '@noshiro/global-' in
 * devDependencies.
 */
export const genEsLintRestrictedImportsDefFromDevDependencies = async (
  devDependencies: Record<string, string> | undefined,
): Promise<readonly [RestrictedImportsOption]> => {
  const globalUtils = Object.keys(devDependencies ?? {}).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  const eslintNoRestrictedImportsDefModules = await Promise.all(
    globalUtils.map(
      (packageName) =>
        // eslint-disable-next-line import/dynamic-import-chunkname
        import(`${packageName}/eslint-no-restricted-imports-def`),
    ),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const eslintNoRestrictedImportsDefs: RestrictedImportsOption['paths'] =
    eslintNoRestrictedImportsDefModules.map(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      (a) => a.eslintNoRestrictedImportsDef,
    );

  return [
    {
      paths: [
        ...restrictedImportsOption.paths,
        ...eslintNoRestrictedImportsDefs,
      ],
    },
  ] satisfies TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-imports'];
};
