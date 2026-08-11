import { type JsonValue, type ReadonlyRecord } from 'ts-type-forge';

// Get all workspace packages
export type Package = Readonly<{
  name: string;
  path: string;
  packageJson: JsonValue;
  dependencies: ReadonlyRecord<string, string>;
}>;

/** A `package.json` field that can contribute edges to the dependency graph. */
export type DependencyField =
  'dependencies' | 'devDependencies' | 'peerDependencies';

/**
 * Fields merged into {@link Package.dependencies} when none are specified.
 *
 * Including `devDependencies` means a package that only *develops* against a
 * sibling still has to wait for it. That is the safe default, but in a
 * repository where the toolchain is itself a workspace package it makes the
 * graph cyclic, since the toolchain depends on the packages it serves. Pass
 * `['dependencies', 'peerDependencies']` when the ordering should reflect only
 * what has to be built first.
 */
export const defaultDependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const satisfies readonly DependencyField[];
