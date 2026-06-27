import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { glob, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { extractTypeExports } from './extract-type-exports.mjs';

const srcDir = path.resolve(projectRootPath, './src');

const readmePath = path.resolve(projectRootPath, './README.md');

const markers = {
  start: '<!-- AUTO-GENERATED TYPES START -->',
  end: '<!-- AUTO-GENERATED TYPES END -->',
} as const;

type TypeEntry = Readonly<{ typeName: string; line: number }>;

type FileEntry = Readonly<{
  relativePath: string;
  types: readonly TypeEntry[];
}>;

const collectExports = async (filePath: string): Promise<FileEntry> => {
  const relativePath = path.relative(projectRootPath, filePath);

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(filePath, 'utf8');

    const { types, namespaces } = extractTypeExports(content);

    // Skip `TSTypeForgeInternals_`-prefixed exports (e.g.
    // `TSTypeForgeInternals_SmallIntIndexMax`) that may live alongside
    // public types in a regular module file — they're internal opt-in
    // helpers, not part of the user-facing surface.
    const isInternal = (name: string): boolean =>
      name.startsWith('TSTypeForgeInternals_');

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
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);

    return { relativePath, types: [] };
  }
};

export const genTypeDefinitions = async (): Promise<void> => {
  const filesResult = await glob(`${srcDir}/**/*.mts`);

  if (Result.isErr(filesResult)) {
    console.error(filesResult.value);

    return;
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
    .flatMap(({ relativePath, types }) => [
      `- ${relativePath}`,
      ...types.map(
        ({ line, typeName }) => `  - [${typeName}](./${relativePath}#L${line})`,
      ),
    ])
    .join('\n');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await fs.readFile(readmePath, 'utf8');

  const newContent = content.replaceAll(
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(String.raw`${markers.start}[.\s\S]*${markers.end}`, 'gu'),
    `${markers.start}\n${result}\n\n${markers.end}`,
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(readmePath, newContent, 'utf8');
};
