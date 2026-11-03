import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, unknownToString } from 'ts-data-forge';
import { formatFiles, glob, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import { extractTypeExports } from './extract-type-exports.mjs';

const srcDir = path.resolve(workspaceRootPath, './src');

const readmePath = path.resolve(workspaceRootPath, './README.md');

/**
 * Absolute, because npmjs.com rewrites a relative README link against the
 * repository root and ignores `repository.directory` — `./src/…` would resolve
 * to `mono/src/…`, which does not exist.
 */
const sourceUrlBase =
  'https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge';

const markers = {
  start: '<!-- AUTO-GENERATED TYPES START -->',
  end: '<!-- AUTO-GENERATED TYPES END -->',
} as const;

type TypeEntry = Readonly<{ typeName: string; line: number }>;

type FileEntry = Readonly<{
  relativePath: string;
  types: readonly TypeEntry[];
}>;

export const genTypeDefinitions = async (): Promise<void> => {
  const filesResult = await glob(`${srcDir}/**/*.mts`);

  // A listing written from what could be read would be committed as current.
  if (Result.isErr(filesResult)) {
    throw new Error(
      `Failed to list ${srcDir}: ${unknownToString(filesResult.value)}`,
    );
  }

  const filesToList = filesResult.value.filter((p) => {
    const base = path.basename(p);

    return (
      base !== 'index.mts' &&
      base !== 'global.mts' &&
      base !== '_internals.mts' &&
      base !== '_number-brand-internals.mts' &&
      !base.endsWith('.test.mts')
    );
  });

  const fileEntries = await Promise.all(
    filesToList.toSorted().map(collectExports),
  );

  const result = fileEntries
    .flatMap(({ relativePath, types }) =>
      Arr.toUnshifted(`- ${relativePath}`)(
        types.map(
          ({ line, typeName }) =>
            `  - [${typeName}](${sourceUrlBase}/${relativePath}#L${line})`,
        ),
      ),
    )
    .join('\n');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await fs.readFile(readmePath, 'utf8');

  // eslint-disable-next-line security/detect-non-literal-regexp
  const listing = new RegExp(
    String.raw`${markers.start}[.\s\S]*${markers.end}`,
    'u',
  );

  // Without its markers the README would be written back unchanged, a stale
  // listing kept as current.
  if (!listing.test(content)) {
    throw new Error(
      `${readmePath} has no ${markers.start} … ${markers.end} block to write the type listing into.`,
    );
  }

  const newContent = content.replace(
    listing,
    () => `${markers.start}\n${result}\n\n${markers.end}`,
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(readmePath, newContent, 'utf8');

  const formatted = await formatFiles([readmePath]);

  if (Result.isErr(formatted)) {
    throw new Error(
      `Failed to format ${readmePath}: ${unknownToString(formatted.value)}`,
    );
  }
};

/**
 * Whether an export is a `TSTypeForgeInternals_`-prefixed one (e.g.
 * `TSTypeForgeInternals_SmallIntIndexMax`), which may live alongside public
 * types in a regular module file: an internal opt-in helper, not part of the
 * user-facing surface.
 */
const isInternal = (name: string): boolean =>
  name.startsWith('TSTypeForgeInternals_');

const collectExports = async (filePath: string): Promise<FileEntry> => {
  const relativePath = path.relative(workspaceRootPath, filePath);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await fs.readFile(filePath, 'utf8');

  const { types, namespaces } = extractTypeExports(content);

  const flat: readonly TypeEntry[] = [
    ...types
      .filter(({ name }) => !isInternal(name))
      .map(({ name, line }) => ({ typeName: name, line })),
    ...namespaces.flatMap((ns) =>
      ns.types
        .filter(({ name }) => !isInternal(name))
        .map(({ name, line }) => ({
          typeName: `${ns.name}.${name}`,
          line,
        })),
    ),
  ].toSorted((a, b) => a.line - b.line);

  return { relativePath, types: flat };
};
