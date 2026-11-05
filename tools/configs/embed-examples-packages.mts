import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, isString, Json, Result } from 'ts-data-forge';
import { pathExists } from 'ts-repo-utils';

/** One sample embedded into one document, both as absolute paths. */
export type Embedding = Readonly<{
  documentPath: string;
  samplePath: string;
}>;

/**
 * Refuses a sample embedded from a workspace package that the package holding
 * the document does not declare, and a sample in no workspace package at all.
 *
 * `check-changed` runs a package's generators when the package changes or when
 * a package it declares (in any dependency field) does, and not otherwise. A
 * document embedding an undeclared package's sample would go stale whenever
 * only that sample changed, with nothing local to say so; CI's clean-tree check
 * would be the first to notice, naming no generator.
 */
export const assertSamplePackagesDeclared = async (
  embeddings: readonly Embedding[],
): Promise<Result<undefined, string>> => {
  const mut_owners = new Map<string, Promise<OwningPackage | undefined>>();

  const ownerOf = (file: string): Promise<OwningPackage | undefined> => {
    const directory = path.dirname(file);

    const cached = mut_owners.get(directory);

    if (cached !== undefined) {
      return cached;
    }

    const lookup = findOwningPackage(directory);

    mut_owners.set(directory, lookup);

    return lookup;
  };

  const results = await Promise.all(
    embeddings.map(async ({ documentPath, samplePath }) => {
      const [document, sample] = await Promise.all([
        ownerOf(documentPath),
        ownerOf(samplePath),
      ]);

      if (sample === undefined) {
        return {
          outside: `${samplePath}, embedded into ${documentPath}`,
        } as const;
      }

      return document === undefined ||
        sample.directory === document.directory ||
        document.declared.has(sample.name)
        ? {}
        : ({
            undeclared: `${document.name} embeds ${samplePath} from ${sample.name}`,
          } as const);
    }),
  );

  const outside = Arr.uniq(results.flatMap(({ outside: o }) => o ?? []));

  const undeclared = Arr.uniq(results.flatMap(({ undeclared: u }) => u ?? []));

  return Arr.isNonEmpty(outside) || Arr.isNonEmpty(undeclared)
    ? Result.err(
        [
          ...(Arr.isNonEmpty(outside)
            ? Arr.toUnshifted(
                '❌ These samples are in no workspace package, so check-changed never regenerates the documents when they change; move each into the embedding package or one it declares:',
              )(outside.map((line) => `  - ${line}`))
            : []),
          ...(Arr.isNonEmpty(undeclared)
            ? [
                '❌ These samples come from a package the embedding package does not declare as a `workspace:` dependency, so check-changed never regenerates the documents when they change:',
                ...undeclared.map((line) => `  - ${line}`),
                'Declare each in the embedding package\'s devDependencies as "workspace:*", and, since nothing imports it, name it in that package\'s `ignoreDependencies` in knip.jsonc with the reason.',
              ]
            : []),
        ].join('\n'),
      )
    : Result.ok(undefined);
};

type OwningPackage = Readonly<{
  directory: string;
  name: string;
  /**
   * What its manifest names with a `workspace:` range in `dependencies`,
   * `devDependencies` or `peerDependencies`, as `check-changed` reads them.
   */
  declared: ReadonlySet<string>;
}>;

/**
 * The nearest `package.json` at or above a directory, stopping at the
 * repository root (the directory holding `pnpm-workspace.yaml`), whose manifest
 * is not a workspace package's.
 */
const findOwningPackage = async (
  directory: string,
): Promise<OwningPackage | undefined> => {
  if (await pathExists(path.resolve(directory, 'pnpm-workspace.yaml'))) {
    return undefined;
  }

  const manifestPath = path.resolve(directory, 'package.json');

  if (await pathExists(manifestPath)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const parsed = Json.parse(await fs.readFile(manifestPath, 'utf8'));

    const manifest =
      Result.isOk(parsed) && isRecord(parsed.value)
        ? parsed.value
        : ({} as const);

    const name = manifest['name'];

    return {
      directory,
      name: isString(name) ? name : directory,
      declared: new Set<string>(
        DEPENDENCY_FIELDS.flatMap((field) => {
          const ranges = manifest[field];

          return isRecord(ranges)
            ? Object.entries(ranges)
                .filter(
                  ([, range]) =>
                    isString(range) && range.startsWith('workspace:'),
                )
                .map(([dependency]) => dependency)
            : [];
        }),
      ),
    };
  }

  const parent = path.dirname(directory);

  return parent === directory ? undefined : findOwningPackage(parent);
};

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const;
