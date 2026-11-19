import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Cascade layers rank in the order they are first named, and a stylesheet is
 * loaded when the first component importing it is, so whichever loads first
 * would decide the order: a component's `@layer components` loaded before
 * `tokens.css` would rank below `base`, and `button { font: inherit; }` would
 * then win over every component's font. Each stylesheet names the order before
 * anything else, so none can come first without it.
 */
test('every stylesheet under src/ui names the layer order first', () => {
  const offenders = cssFilesUnder(import.meta.dirname).filter(
    (file) =>
      !firstStatementOf(
        // The paths are this directory's own files, found by walking it.
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        readFileSync(file, 'utf8'),
      ).startsWith(LAYER_ORDER),
  );

  assert.deepStrictEqual(
    offenders.map((file) => path.relative(import.meta.dirname, file)),
    [],
  );
});

const LAYER_ORDER = '@layer tokens, base, components, utilities;';

/** The source with leading comments and blank lines taken off. */
const firstStatementOf = (source: string): string => {
  const rest = source.trimStart();

  const end = rest.startsWith('/*') ? rest.indexOf('*/') : -1;

  return end === -1 ? rest : firstStatementOf(rest.slice(end + 2));
};

const cssFilesUnder = (directory: string): readonly string[] =>
  // The directory is this test's own, walked to find its stylesheets.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .toSorted();
