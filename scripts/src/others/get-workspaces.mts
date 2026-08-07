import 'zx/globals';
import { execAsync } from '../node-utils/index.mjs';
import { isNotUndefined, isRecord, isString } from '../ts-utils/index.mjs';

export type Workspace = Readonly<{
  name: string;
  location: string;
  workspaceDependencies: readonly string[];

  /**
   * Always empty. Yarn 1 reported workspace dependencies whose declared range
   * did not match the local package version here; pnpm links workspace
   * packages through `linkWorkspacePackages` and has no equivalent report.
   * Kept so that the shape of `Workspace` stays source compatible.
   */
  mismatchedWorkspaceDependencies: readonly string[];
}>;

type WorkspaceLocation = Readonly<{ name: string; location: string }>;

const dependencyFieldNames = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
] as const;

const readString = (record: unknown, key: string): string | undefined =>
  isRecord(record) && Object.hasOwn(record, key) && isString(record[key])
    ? record[key]
    : undefined;

const listWorkspaceLocations = async (): Promise<
  readonly WorkspaceLocation[]
> => {
  const result = await execAsync('pnpm ls --recursive --depth -1 --json');

  const parsed: unknown = JSON.parse(result.stdout);

  if (!Array.isArray(parsed)) return [];

  const [firstPath, ...restPaths] = parsed
    .map((entry) => readString(entry, 'path'))
    .filter(isNotUndefined);

  if (firstPath === undefined) return [];

  // Every workspace package lives under the workspace root, so the root is the
  // shortest of the reported paths.
  const rootDir = restPaths.reduce(
    (shortest, current) =>
      current.length < shortest.length ? current : shortest,
    firstPath,
  );

  return parsed
    .map((entry) => {
      const name = readString(entry, 'name');
      const entryPath = readString(entry, 'path');

      // The root project itself is not a workspace package.
      if (name === undefined || entryPath === undefined) return undefined;
      if (entryPath === rootDir) return undefined;

      return {
        name,
        location: path.relative(rootDir, entryPath).split(path.sep).join('/'),
      };
    })
    .filter(isNotUndefined);
};

const readWorkspaceDependencies = async (
  location: string,
  workspaceNames: ReadonlySet<string>,
): Promise<readonly string[]> => {
  const packageJson: unknown = JSON.parse(
    await fs.readFile(path.resolve(location, './package.json'), {
      encoding: 'utf8',
    }),
  );

  if (!isRecord(packageJson)) return [];

  return dependencyFieldNames
    .flatMap((fieldName) => {
      const field = packageJson[fieldName];

      return isRecord(field) ? Object.keys(field) : [];
    })
    .filter((dependencyName) => workspaceNames.has(dependencyName));
};

export const getWorkspaces = async (): Promise<readonly Workspace[]> => {
  const locations = await listWorkspaceLocations();

  const workspaceNames = new Set(locations.map((ws) => ws.name));

  return Promise.all(
    locations.map(async ({ name, location }) => ({
      name,
      location,
      workspaceDependencies: await readWorkspaceDependencies(
        location,
        workspaceNames,
      ),
      mismatchedWorkspaceDependencies: [],
    })),
  );
};
