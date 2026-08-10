import { restrictedImportsOption } from './rules/typescript-eslint-rules.mjs';
import { type TypeScriptEslintRulesOption } from './types/rules/typescript-eslint-rules.mjs';
import { type RestrictedImportsOption } from './types/types.mjs';

type RestrictedImportsDefModule = Readonly<{
  eslintNoRestrictedImportsDef: RestrictedImportsOption['paths'][number];
}>;

type ModuleImporter = (
  specifier: string,
) => Promise<RestrictedImportsDefModule>;

const defaultImportModule: ModuleImporter = async (specifier) =>
  // eslint-disable-next-line import/dynamic-import-chunkname, @typescript-eslint/no-unsafe-return
  import(specifier);

/**
 * Restrict prohibited imports defined in package '@noshiro/global-' in
 * devDependencies.
 *
 * @param devDependencies The consuming package's devDependencies.
 * @param importModule Resolves the `@noshiro/global-*` subpaths. The default
 *   resolves them relative to this package, which only works when every
 *   workspace package is hoisted into a single flat node_modules. Callers that
 *   declare the `@noshiro/global-*` packages themselves should pass their own
 *   `(specifier) => import(specifier)` so that the packages resolve from there.
 */
export const genEsLintRestrictedImportsDefFromDevDependencies = async (
  devDependencies: Record<string, string> | undefined,
  importModule: ModuleImporter = defaultImportModule,
): Promise<readonly [RestrictedImportsOption]> => {
  const globalUtils = Object.keys(devDependencies ?? {}).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  const eslintNoRestrictedImportsDefModules = await Promise.all(
    globalUtils.map((packageName) =>
      importModule(`${packageName}/eslint-no-restricted-imports-def`),
    ),
  );

  const eslintNoRestrictedImportsDefs: RestrictedImportsOption['paths'] =
    eslintNoRestrictedImportsDefModules.map(
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
