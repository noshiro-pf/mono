import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import type { ChangesetBump } from '../../lib/changesets.mjs';
import { PACKAGE_ENTRY_FILES } from '../../lib/repo-files.mjs';

/**
 * The names a package's public entry exports, through its barrels: each
 * `export` declaration, each name of `export { … }`, `export * as ns`, and the
 * names of every module an `export * from './…'` reaches. A re-export of
 * another package (`export * from 'pkg'`) is the one name `* from 'pkg'`, since
 * what it holds is not this package's to read.
 *
 * `read` gives a file's text by its path from the repository root, or
 * `undefined` when there is none; a relative specifier written `.mjs` is read
 * from its `.mts` source.
 */
export const exportedNames = async (
  entry: string,
  read: (file: string) => Promise<string | undefined>,
): Promise<ReadonlySet<string>> => {
  const mut_names = new Set<string>();

  const mut_seen = new Set<string>();

  const visit = async (file: string): Promise<void> => {
    if (mut_seen.has(file)) {
      return;
    }

    mut_seen.add(file);

    const text = await read(file);

    if (text === undefined) {
      return;
    }

    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);

    for (const statement of source.statements) {
      if (ts.isExportDeclaration(statement)) {
        const specifier =
          statement.moduleSpecifier !== undefined &&
          ts.isStringLiteral(statement.moduleSpecifier)
            ? statement.moduleSpecifier.text
            : undefined;

        const clause = statement.exportClause;

        if (clause === undefined) {
          if (specifier === undefined) {
            continue;
          }

          if (specifier.startsWith('.')) {
            await visit(sourceOf(file, specifier));
          } else {
            mut_names.add(`* from '${specifier}'`);
          }
        } else if (ts.isNamespaceExport(clause)) {
          mut_names.add(clause.name.text);
        } else {
          for (const element of clause.elements) {
            mut_names.add(element.name.text);
          }
        }

        continue;
      }

      if (ts.isExportAssignment(statement)) {
        mut_names.add('default');

        continue;
      }

      for (const name of declaredExportNames(statement)) {
        mut_names.add(name);
      }
    }
  };

  await visit(entry);

  return mut_names;
};

/**
 * The warnings for the packages the diff's changesets release at `patch` and no
 * higher: a name the public entry exports at the head and not at the base is a
 * new feature, which is a `minor`; one it no longer exports is a breaking
 * change. Names only, not types: a changed signature of an export that stays is
 * not read, and nothing internal is.
 *
 * A package with no entry at the base (a first release, which is manual) is
 * left out.
 */
export const findPatchExportChanges = async ({
  bumps,
  packages,
  readAtBase,
  readAtHead,
}: Readonly<{
  bumps: readonly ChangesetBump[];
  /** The published `libs/*` packages, with their directories. */
  packages: readonly Readonly<{ name: string; dir: string }>[];
  readAtBase: (file: string) => Promise<string | undefined>;
  readAtHead: (file: string) => Promise<string | undefined>;
}>): Promise<readonly string[]> => {
  const warnings = await Promise.all(
    packages.map(async ({ name, dir }): Promise<readonly string[]> => {
      const named = bumps.filter((bump) => bump.name === name);

      if (
        !Arr.isNonEmpty(named) ||
        named.some(({ bump }) => bump !== 'patch')
      ) {
        return [];
      }

      const candidates = PACKAGE_ENTRY_FILES.map((file) => `${dir}/${file}`);

      const present = await Promise.all(
        candidates.map(async (file) => (await readAtHead(file)) !== undefined),
      );

      const entry = candidates.find((_, i) => present[i] === true);

      if (entry === undefined || (await readAtBase(entry)) === undefined) {
        return [];
      }

      const [before, after] = await Promise.all([
        exportedNames(entry, readAtBase),
        exportedNames(entry, readAtHead),
      ]);

      const added = Array.from(after)
        .filter((n) => !before.has(n))
        .toSorted();

      const removed = Array.from(before)
        .filter((n) => !after.has(n))
        .toSorted();

      const files = Arr.uniq(named.map(({ file }) => file)).join(', ');

      return [
        ...(Arr.isNonEmpty(added)
          ? [
              `${name} is released as a patch (${files}), but its public entry gains ${quoteList(added)}; a new export is a feature, so make the changeset \`minor\`.`,
            ]
          : []),
        ...(Arr.isNonEmpty(removed)
          ? [
              `${name} is released as a patch (${files}), but its public entry no longer exports ${quoteList(removed)}; a removed export is a breaking change (\`minor\` while the package is 0.x, \`major\` after, or put off to its NEXT_MAJOR.md).`,
            ]
          : []),
      ];
    }),
  );

  return warnings.flat();
};

const quoteList = (names: readonly string[]): string =>
  names.map((name) => `\`${name}\``).join(', ');

/** The source a relative module specifier names: `./a.mjs` read as `./a.mts`. */
const sourceOf = (from: string, specifier: string): string =>
  path.posix
    .join(path.posix.dirname(from), specifier)
    .replace(/\.mjs$/u, '.mts')
    .replace(/\.js$/u, '.ts');

/** Every identifier a binding name binds, through destructuring. */
const bindingNames = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a compiler node, which DeepReadonly would stop narrowing
  name: ts.BindingName,
): readonly string[] =>
  ts.isIdentifier(name)
    ? ([name.text] as const)
    : name.elements.flatMap((element) =>
        ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
      );

/** The names a statement with an `export` modifier declares. */
const declaredExportNames = (
  statement: DeepReadonly<ts.Statement>,
): readonly string[] => {
  const modifiers = ts.canHaveModifiers(statement)
    ? (ts.getModifiers(statement) ?? [])
    : ([] as const);

  if (modifiers.every(({ kind }) => kind !== ts.SyntaxKind.ExportKeyword)) {
    return [];
  }

  if (modifiers.some(({ kind }) => kind === ts.SyntaxKind.DefaultKeyword)) {
    return ['default'];
  }

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap(({ name }) =>
      bindingNames(name),
    );
  }

  return (ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isModuleDeclaration(statement)) &&
    statement.name !== undefined &&
    (ts.isIdentifier(statement.name) || ts.isStringLiteral(statement.name))
    ? [statement.name.text]
    : [];
};
