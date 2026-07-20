import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Directories whose non-index, non-test modules each define exactly one branded
 * number type: a `type X`, a namespace `const X`, an `asX` cast function, and
 * an `isX` guard.
 */
const brandedNumberTypeDirs = [
  path.resolve(projectRootPath, './src/number/branded-types'),
  path.resolve(projectRootPath, './src/number/enum'),
] as const;

const exportedConstRegex = /^export const ([A-Za-z][A-Za-z0-9]*)\b/gmu;

const exportedTypeRegex = /^export type ([A-Za-z][A-Za-z0-9]*)\b/gmu;

const pascalCaseRegex = /^[A-Z]/u;

const asCastRegex = /^as([A-Z][A-Za-z0-9]*)$/u;

/**
 * Verifies that every branded number type defined under `src/number` has a
 * matching `as<Type>` cast function, and that no `as<Type>` cast is left without
 * a corresponding branded type. Guards against adding a branded number type but
 * forgetting its cast (or renaming one side of the pair).
 */
const main = async (): Promise<void> => {
  const sources = await readBrandedNumberTypeSources();

  const exportedConsts = new Set(
    sources.flatMap((source) => matchGroups(source, exportedConstRegex)),
  );

  const exportedTypes = new Set(
    sources.flatMap((source) => matchGroups(source, exportedTypeRegex)),
  );

  // A branded number type exposes both a `type X` and a namespace `const X`.
  const brandedTypeNames = Array.from(exportedTypes).filter(
    (name) => pascalCaseRegex.test(name) && exportedConsts.has(name),
  );

  // The type names for which an `as<Type>` cast function is actually defined.
  const castTypeNames = new Set(
    Array.from(exportedConsts).flatMap((name) => {
      const castTypeName = asCastRegex.exec(name)?.[1];

      return castTypeName === undefined ? [] : [castTypeName];
    }),
  );

  const missingCasts = brandedTypeNames
    .filter((name) => !castTypeNames.has(name))
    .toSorted();

  const orphanCasts = Array.from(castTypeNames)
    .filter((name) => !exportedTypes.has(name))
    .toSorted();

  if (!Arr.isNonEmpty(missingCasts) && !Arr.isNonEmpty(orphanCasts)) {
    console.info(
      `✓ All ${brandedTypeNames.length} branded number types have a matching \`as<Type>\` cast function.`,
    );

    return;
  }

  console.error('✗ Branded number cast functions are out of sync:\n');

  if (Arr.isNonEmpty(missingCasts)) {
    console.error(
      `  Missing ${missingCasts.length} \`as<Type>\` cast function(s) for branded type(s):`,
    );

    console.error(`    ${missingCasts.join(', ')}\n`);
  }

  if (Arr.isNonEmpty(orphanCasts)) {
    console.error(
      `  ${orphanCasts.length} \`as<Type>\` cast(s) without a matching branded number type:`,
    );

    console.error(`    ${orphanCasts.join(', ')}\n`);
  }

  console.error(
    'Ensure each branded number type under src/number defines its `as<Type>` cast.',
  );

  process.exit(1);
};

/**
 * Reads the source of every branded-number-type module across the configured
 * directories.
 */
const readBrandedNumberTypeSources = async (): Promise<readonly string[]> => {
  const mut_sources: string[] = [];

  for (const dir of brandedNumberTypeDirs) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const entries = await fs.readdir(dir);

    const moduleFileNames = entries.filter(isBrandedTypeModule);

    for (const fileName of moduleFileNames) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(path.resolve(dir, fileName), 'utf8');

      mut_sources.push(content);
    }
  }

  return mut_sources;
};

const isBrandedTypeModule = (fileName: string): boolean =>
  fileName.endsWith('.mts') &&
  !fileName.endsWith('.test.mts') &&
  fileName !== 'index.mts';

/** Collects the first capture group of every match of a global regex. */
const matchGroups = (source: string, regex: RegExp): readonly string[] => {
  const mut_groups: string[] = [];

  for (const match of source.matchAll(regex)) {
    const group = match[1];

    if (group !== undefined) {
      mut_groups.push(group);
    }
  }

  return mut_groups;
};

await main();
