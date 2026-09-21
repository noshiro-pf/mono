import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord, isString, Result } from 'ts-data-forge';
import { $ } from '../functions/index.mjs';

const packageRoot = path.resolve(import.meta.dirname, '../..');

const repoRoot = path.resolve(packageRoot, '../..');

const tsx = path.resolve(packageRoot, './node_modules/.bin/tsx');

const tsxTsconfig = path.resolve(repoRoot, './tools/configs/tsconfig.tsx.json');

/** The parsed `package.json` this package publishes. */
const readManifest = async (): Promise<unknown> =>
  JSON.parse(
    await fs.readFile(path.resolve(packageRoot, './package.json'), 'utf8'),
  );

/** The version the published package carries. */
const manifestVersion = (manifest: unknown): string => {
  if (
    !isRecord(manifest) ||
    !hasKey(manifest, 'version') ||
    !isString(manifest.version)
  ) {
    throw new Error('package.json declares no string "version"');
  }

  return manifest.version;
};

/** The names of the commands the published package installs. */
const manifestBinNames = (manifest: unknown): readonly string[] => {
  if (
    !isRecord(manifest) ||
    !hasKey(manifest, 'bin') ||
    !isRecord(manifest.bin)
  ) {
    throw new Error('package.json declares no "bin" record');
  }

  return Object.keys(manifest.bin).toSorted();
};

/** Runs one CLI entry point with `--version` and returns what it printed. */
const reportedVersion = async (binName: string): Promise<string> => {
  const entryPoint = path.resolve(packageRoot, `./src/cmd/${binName}.mts`);

  const result = await $(
    `"${tsx}" --tsconfig "${tsxTsconfig}" "${entryPoint}" --version`,
    { silent: true, cwd: packageRoot },
  );

  assert.isTrue(Result.isOk(result));

  return Result.isOk(result) ? result.value.stdout.trim() : '';
};

describe('CLI --version', () => {
  test('every published CLI reports this package version', async () => {
    const manifest = await readManifest();

    const version = manifestVersion(manifest);

    const binNames = manifestBinNames(manifest);

    const reported = await Promise.all(
      binNames.map(
        async (name) => [name, await reportedVersion(name)] as const,
      ),
    );

    assert.deepStrictEqual(
      Object.fromEntries(reported),
      Object.fromEntries(binNames.map((name) => [name, version])),
    );
  }, 120_000);
});
