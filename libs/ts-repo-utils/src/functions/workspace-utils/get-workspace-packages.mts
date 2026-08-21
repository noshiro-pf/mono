import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNotUndefined,
  isRecord,
  isString,
  Json,
  Obj,
  Result,
} from 'ts-data-forge';
import { type JsonValue, type ReadonlyRecord } from 'ts-type-forge';
import { glob } from '../glob.mjs';
import {
  defaultDependencyFields,
  type DependencyField,
  type Package,
} from './types.mjs';

/**
 * Retrieves all workspace packages from a monorepo based on the workspace
 * patterns defined in the root package.json file.
 *
 * @param rootPackageJsonDir - The directory containing the root package.json
 *   file
 * @param dependencyFields - Which `package.json` fields contribute to each
 *   package's `dependencies` map. Defaults to
 *   {@link defaultDependencyFields}.
 * @returns A promise that resolves to an array of Package objects containing
 *   package metadata
 */
export const getWorkspacePackages = async (
  rootPackageJsonDir: string,
  dependencyFields: readonly DependencyField[] = defaultDependencyFields,
): Promise<readonly Package[]> => {
  // Read root package.json

  const rootPackageJson: JsonValue = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.readFile(path.join(rootPackageJsonDir, 'package.json'), 'utf8'),
  );

  const workspacePatterns: readonly string[] = getStrArrayFromJsonValue(
    rootPackageJson,
    'workspaces',
  );

  const packagePromises = workspacePatterns.map(async (pattern) => {
    const globResult = await glob(pattern, {
      cwd: rootPackageJsonDir,
      ignore: ['**/node_modules/**'],
      onlyDirectories: true,
      absolute: true,
    });

    if (Result.isErr(globResult)) {
      return [];
    }

    const matches = globResult.value;

    const packageJsonList: readonly (
      readonly [string, JsonValue] | undefined
    )[] = await Promise.all(
      matches.map(async (match) => {
        const maybePackagePath = path.join(match, 'package.json');

        const result = await Result.fromPromise(
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.readFile(maybePackagePath, 'utf8'),
        );

        if (Result.isErr(result)) return undefined;

        const parsed = Json.parse(result.value);

        if (Result.isErr(parsed)) return undefined;

        return [maybePackagePath, parsed.value] as const;
      }),
    );

    const packageInfos: readonly Package[] = packageJsonList
      .filter(isNotUndefined)
      .map(([packagePath, packageJson]) => ({
        name: getStrFromJsonValue(packageJson, 'name'),
        path: path.dirname(packagePath),
        packageJson,
        dependencies: mergeDependencyFields(packageJson, dependencyFields),
      }));

    return packageInfos;
  });

  const allPackageArrays = await Promise.all(packagePromises);

  const finalPackages = allPackageArrays.flat();

  return finalPackages;
};

/** Merges the named `package.json` fields into a single dependency map. */
const mergeDependencyFields = (
  packageJson: JsonValue,
  dependencyFields: readonly DependencyField[],
): ReadonlyRecord<string, string> =>
  Object.fromEntries(
    dependencyFields.flatMap((field) =>
      Object.entries(getKeyValueRecordFromJsonValue(packageJson, field)),
    ),
  );

const getStrFromJsonValue = (value: JsonValue, key: string): string =>
  isRecord(value) && hasKey(value, key) && isString(value[key])
    ? value[key]
    : '';

const getStrArrayFromJsonValue = (
  value: JsonValue,
  key: string,
): readonly string[] =>
  isRecord(value) &&
  hasKey(value, key) &&
  Arr.isArray(value[key]) &&
  value[key].every(isString)
    ? value[key]
    : ([] as const);

const getKeyValueRecordFromJsonValue = (
  value: JsonValue,
  key: string,
): ReadonlyRecord<string, string> => {
  if (!isRecord(value) || !hasKey(value, key)) {
    return {};
  }

  const obj = value[key];

  if (!isRecord(obj)) {
    return {};
  }

  return Obj.filter(obj, isString);
};
