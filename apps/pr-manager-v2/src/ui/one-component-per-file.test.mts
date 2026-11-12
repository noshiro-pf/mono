import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * One component per file (the root `CLAUDE.md`, "Coding style";
 * `docs/architecture.md`, "Drawing"), the parts only one component draws
 * included: each goes in its own file beside it.
 */
test('every .tsx file under src/ui defines at most one component', () => {
  const offenders = tsxFilesUnder(import.meta.dirname).flatMap((file) => {
    const defined = componentsIn(
      // The paths are this directory's own files, found by walking it.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      readFileSync(file, 'utf8'),
    );

    return defined.length > 1
      ? [`${path.relative(import.meta.dirname, file)}: ${defined.join(', ')}`]
      : [];
  });

  assert.deepStrictEqual(offenders, []);
});

/**
 * A PascalCase function at the top level, exported or not: `const Name = (`,
 * with a type (`const Name: Component<P> = (`), generic (`= <T,>(`), wrapped
 * (`= memo(`), or named in capitals (`SVGIcon`). An all-capitals constant
 * (`const PAD = 8`) has no lower-case letter and is not one.
 */
const COMPONENT =
  // Run on this repository's own source alone, never on input from outside.
  // eslint-disable-next-line security/detect-unsafe-regex
  /^(?:export )?const ([A-Z][A-Z0-9]*[a-z]\w*)(?::[^=\n]+)? = (?:\w+\()?(?:<[^>\n]*>)?\(/gmu;

const componentsIn = (source: string): readonly string[] =>
  Array.from(source.matchAll(COMPONENT), ([, name]) => name ?? '');

test('the component pattern sees every shape a component is written in', () => {
  assert.deepStrictEqual(
    componentsIn(
      [
        'const Plain = ({ a }: Props): JSX.Element => a;',
        'export const Exported = (): JSX.Element => x;',
        'const Typed: Component<P> = (p) => p;',
        'const Generic = <T,>(p: T): T => p;',
        'const Wrapped = memo((p: P) => p);',
        'const SVGIcon = (): JSX.Element => x;',
        'const PAD = 8;',
        'const STATE_WORDS = { a: 1 };',
        'const HEXAGON = `M 0 0`;',
      ].join('\n'),
    ),
    ['Plain', 'Exported', 'Typed', 'Generic', 'Wrapped', 'SVGIcon'],
  );
});

const tsxFilesUnder = (directory: string): readonly string[] =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    return entry.isDirectory()
      ? tsxFilesUnder(full)
      : entry.name.endsWith('.tsx')
        ? [full]
        : [];
  });
