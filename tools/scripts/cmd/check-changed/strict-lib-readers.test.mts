import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  readGeneratorMembers,
  workspaceLibraries,
} from './generator-entries.mjs';
import { importGraph, tsxProgram } from './import-graph.mjs';
import { readPackages } from './packages.mjs';
import { STRICT_LIB_READERS } from './plan.mjs';

// #4106: check-changed runs the `gen` of each member in `STRICT_LIB_READERS`
// after the strict-lib generators, since a diff confined to `strict-lib/` can
// move what it writes. This holds the list to the members whose generators name
// the strict lib in a string, a path under `strict-lib/` or a
// `@typescript/lib-*` module, anywhere in what their `gen` imports: a generator
// that starts reading it, or one that stops, cannot go unnoticed. A generator
// that reaches the strict `lib.dom` with no such string, through a TypeScript
// program whose default library resolves to it, is not found; the synstate-dom
// generators name both what they read.
test('STRICT_LIB_READERS lists the members whose generators name the strict lib', async () => {
  const packages = await readPackages();

  const members = await readGeneratorMembers(packages);

  if (Result.isErr(members)) {
    throw new Error(members.value);
  }

  const built = tsxProgram(
    Arr.uniq(members.value.flatMap(({ entries }) => entries)),
  );

  if (Result.isErr(built)) {
    throw new Error(built.value);
  }

  const program = built.value;

  const libraries = workspaceLibraries(packages);

  const mut_named = new Map<string, boolean>();

  const namesStrictLib = (file: string): boolean => {
    const known = mut_named.get(file);

    if (known !== undefined) {
      return known;
    }

    const source = program.getSourceFile(path.join(projectRootPath, file));

    const named = source !== undefined && hasStrictLibString(source);

    mut_named.set(file, named);

    return named;
  };

  const readers = members.value
    .filter(({ entries }) =>
      entries.some((entry) =>
        importGraph(program, entry, { libraries })
          // A library read whole is no module of a generator.
          .filter((file) => !file.endsWith('/'))
          .some(namesStrictLib),
      ),
    )
    .map(({ dir }) => dir)
    .toSorted();

  assert.deepStrictEqual(readers, STRICT_LIB_READERS.toSorted());
}, 60_000);

// `strict-lib` as a path segment (`../../strict-lib`, `strict-lib/v7.0`), not
// as part of a name (`strict-lib-gen.yml`).
const STRICT_LIB_STRING = /(?:^|\/)strict-lib(?:\/|$)|@typescript\/lib-/u;

/** Whether `source` has a string literal or template text naming the lib. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a TypeScript node, read only.
const hasStrictLibString = (source: ts.SourceFile): boolean => {
  const visit = (node: ts.Node): boolean =>
    ((ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) &&
      STRICT_LIB_STRING.test(node.text)) ||
    (ts.forEachChild(node, visit) ?? false);

  return visit(source);
};
