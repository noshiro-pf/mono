import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $ } from 'ts-repo-utils';

/** A TypeScript minor's published package, as it stands on disk. */
export type Bundle = Readonly<{
  name: string;
  version: string;
  /**
   * `output/lib` — the package exactly as it ships: `package.json`,
   * `README.md`, and both `libs/` and `libs-branded/`.
   */
  bundleDir: string;
  /** `<owner>/<repo>`, from the manifest's `repository.url`. */
  repoPath: string;
}>;

/**
 * The one bundle package of a TypeScript version, or nothing if it has none.
 *
 * A release used to carry one tarball per built-in library (~107 per flavor,
 * ~214 per version), then one per flavor. Nobody installed them separately —
 * `libReplacement` loads the whole closure of whatever `lib` is set to — so
 * the split bought the consumer nothing while costing a package name, a first
 * publish, and a trusted-publisher setup each. One package per TypeScript
 * minor carries both flavors, and the consumer picks between them with the
 * `paths` entry they had to write anyway.
 */
export const collectBundle = async (
  versionRoot: string,
): Promise<Bundle | undefined> => {
  const bundleDir = path.join(versionRoot, 'output', 'lib');

  const manifest = parsePackageJson(
    await fs
      .readFile(path.join(bundleDir, 'package.json'), 'utf8')
      .catch(() => ''),
  );

  if (
    manifest === undefined ||
    manifest.private === true ||
    manifest.name === undefined ||
    manifest.version === undefined
  ) {
    return undefined;
  }

  return {
    name: manifest.name,
    version: manifest.version,
    bundleDir,
    repoPath: repoPathOf(manifest.repository?.url ?? ''),
  };
};

/**
 * Packs a bundle where it stands. Ok = the `.tgz` path, Err = an error message.
 *
 * Nothing is staged or rearranged: `output/lib` is the package as it ships.
 * That is a requirement rather than a tidiness preference — a consuming
 * repository points `paths` at `node_modules/<pkg>/libs/*`, and when this
 * repository is a workspace of that one, the path resolves through a symlink
 * to this very directory. A layout assembled at pack time would exist only
 * inside the tarball.
 *
 * The nesting under `libs/` is what TypeScript asks for.
 * `getLibraryNameFromLibFileName` turns `lib.es2015.symbol.wellknown.d.ts`
 * into `@typescript/lib-es2015/symbol-wellknown` — the first component after
 * the group is a path segment, the rest are joined with `-` — so one wildcard
 * covers group libs and sub-libs alike. Flattening
 * `es2015/symbol-wellknown` to `es2015-symbol-wellknown` looks equivalent and
 * is not: TypeScript never asks for that name, so every sub-lib would quietly
 * keep the stock declarations. Measured with `--traceResolution`: nested
 * resolves 88 of 88 lookups, flattened only 15.
 */
export const packBundle = async (
  bundle: Bundle,
  destDir: string,
): Promise<Result<string, string>> => {
  const packed = await $(
    `npm pack ${bundle.bundleDir} --pack-destination ${destDir}`,
    { silent: true },
  );

  if (Result.isErr(packed)) {
    return Result.err(`${bundle.name}: npm pack failed`);
  }

  // `npm pack` of an unscoped package emits `<name>-<version>.tgz`.
  return Result.ok(path.join(destDir, `${bundle.name}-${bundle.version}.tgz`));
};

/** The subset of `package.json` fields this module reads. */
const packageJsonType = t.record({
  name: t.optional(t.string()),
  version: t.optional(t.string()),
  private: t.optional(t.boolean()),
  repository: t.optional(t.record({ url: t.optional(t.string()) })),
});

/** `https://github.com/<owner>/<repo>.git` -> `<owner>/<repo>`. */
const repoPathOf = (repositoryUrl: string): string =>
  /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/u.exec(repositoryUrl)?.[1] ?? '';

const parsePackageJson = (
  text: string,
): t.TypeOf<typeof packageJsonType> | undefined => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) return undefined;

  const result = packageJsonType.validate(parsed.value);

  return Result.isOk(result) ? result.value : undefined;
};
