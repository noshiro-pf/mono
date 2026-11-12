import { Arr, isRecord, isString, Obj } from 'ts-data-forge';

/**
 * Which packages `check:forgotten-exports` reads, in a module of its own with
 * no import of the TypeScript compiler, so that `check-changed`'s plan picks
 * them by the rule the check itself applies.
 */

/**
 * The `types` files the check reads of a package, as written in its `exports`
 * ({@link typesEntryPoints}), when it reads the package at all: one published
 * under `libs/`, or private and in `privateRead`, whose `exports` name a
 * `types` file. Empty for a package it does not read. `dir` is
 * repository-relative and `/`-separated.
 */
export const forgottenExportsEntryPoints = (
  pkg: Readonly<{ name: string; dir: string; manifest: unknown }>,
  privateRead: ReadonlySet<string> = FORGOTTEN_EXPORTS_PRIVATE_READ,
): readonly string[] => {
  const manifest = isRecord(pkg.manifest) ? pkg.manifest : ({} as const);

  const read =
    manifest['private'] === true
      ? privateRead.has(pkg.name)
      : pkg.dir.startsWith('libs/');

  return read ? typesEntryPoints(manifest['exports']) : [];
};

/** Whether the check reads a package ({@link forgottenExportsEntryPoints}). */
export const readsForgottenExports = (
  pkg: Readonly<{ name: string; dir: string; manifest: unknown }>,
  privateRead: ReadonlySet<string> = FORGOTTEN_EXPORTS_PRIVATE_READ,
): boolean => Arr.isNonEmpty(forgottenExportsEntryPoints(pkg, privateRead));

/**
 * Every `types` file an `exports` value names, in order, without duplicates: a
 * string ending in `.d.mts`, `.d.cts` or `.d.ts`, and the value of every
 * `types` condition, but under an `internal` subpath (`./internal`,
 * `./dom/internal`). A path with a `*` is a pattern, not a file, and is left
 * out.
 */
export const typesEntryPoints = (exportsField: unknown): readonly string[] =>
  Arr.uniq(
    typesPathsIn(
      isRecord(exportsField)
        ? Obj.filter(exportsField, (_value, key) => !isInternalSubpath(key))
        : exportsField,
      false,
    ),
  ).filter((file) => !file.includes('*'));

/** The private packages read, as if published: they replace published ones. */
export const FORGOTTEN_EXPORTS_PRIVATE_READ: ReadonlySet<string> =
  new Set<string>(['synstate-dom-next', 'synstate-next']);

const DECLARATION_FILE = /\.d\.[cm]?ts$/u;

/** Whether an `exports` key is a subpath with an `internal` segment. */
const isInternalSubpath = (key: string): boolean =>
  key.startsWith('./') && key.split('/').includes('internal');

const typesPathsIn = (value: unknown, isTypes: boolean): readonly string[] => {
  if (isString(value)) {
    return isTypes || DECLARATION_FILE.test(value) ? [value] : [];
  }

  if (Arr.isArray(value)) {
    return value.flatMap((item: unknown) => typesPathsIn(item, isTypes));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      typesPathsIn(item, key === 'types'),
    );
  }

  return [];
};
