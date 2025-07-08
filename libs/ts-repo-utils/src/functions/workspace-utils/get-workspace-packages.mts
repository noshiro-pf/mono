#!/usr/bin/env tsx

import {
  hasKey,
  isNotUndefined,
  isRecord,
  isString,
  Json,
  Result,
} from 'ts-data-forge';
import '../../node-global.mjs';
import { type Package } from './types.mjs';

/**
 * Retrieves all workspace packages from a monorepo based on the workspace patterns
 * defined in the root package.json file.
 * @param rootPackageJsonDir - The directory containing the root package.json file
 * @returns A promise that resolves to an array of Package objects containing package metadata
 */
export const getWorkspacePackages = async (
  rootPackageJsonDir: string,
): Promise<readonly Package[]> => {
  // Read root package.json
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rootPackageJson: JsonValue = JSON.parse(
    await fs.readFile(path.join(rootPackageJsonDir, 'package.json'), 'utf8'),
  );

  const workspacePatterns: readonly string[] = getStrArrayFromJsonValue(
    rootPackageJson,
    'workspaces',
  );

  const packagePromises = workspacePatterns.map(async (pattern) => {
    const matches = await glob(pattern, {
      cwd: rootPackageJsonDir,
      ignore: ['**/node_modules/**'],
      onlyDirectories: true,
      absolute: true,
    });

    const packageJsonList: readonly (
      | readonly [string, JsonValue]
      | undefined
    )[] = await Promise.all(
      matches.map(async (match) => {
        const maybePackagePath = path.join(match, 'package.json');

        const result = await Result.fromPromise(
          fs.readFile(maybePackagePath, 'utf8'),
        );

        if (Result.isErr(result)) return undefined;

        const parsed = Json.parse(result.value);

        if (Result.isErr(parsed)) return undefined;

        return [maybePackagePath, parsed.value] as const;
      }),
    );

    const packageInfos: readonly Package[] = await Promise.all(
      packageJsonList
        .filter(isNotUndefined)
        .map(([packagePath, packageJson]) => ({
          name: getStrFromJsonValue(packageJson, 'name'),
          path: path.dirname(packagePath),
          packageJson,
          dependencies: {
            ...getKeyValueRecordFromJsonValue(packageJson, 'dependencies'),
            ...getKeyValueRecordFromJsonValue(packageJson, 'devDependencies'),
            ...getKeyValueRecordFromJsonValue(packageJson, 'peerDependencies'),
          },
        })),
    );

    return packageInfos;
  });

  const allPackageArrays = await Promise.all(packagePromises);
  const finalPackages = allPackageArrays.flat();

  return finalPackages;
};

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
  Array.isArray(value[key]) &&
  value[key].every(isString)
    ? value[key]
    : [];

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
  const entries = Object.entries(obj).filter(
    (entry): entry is [string, string] => isString(entry[1]),
  );
  return Object.fromEntries(entries);
};
