/**
 * The `package.json` fields changesets bumps a dependent through: a release of
 * a package one of these names bumps the package that names it.
 * `devDependencies` is not one.
 */
export const RUNTIME_DEPENDENCY_FIELDS = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
