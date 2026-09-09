import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { allRules, runRules } from '../src/index.mjs';

/**
 * The engine over a temporary project: the rules see the same program a
 * `tsc --noEmit` of that project would, so a fixture here is ordinary code
 * rather than a mock.
 */

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-checker-'));

const write = (name: string, code: string): string => {
  const file = path.join(dir, name);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, code);

  return file;
};

const tsconfigPath = write(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      strict: true,
      module: 'nodenext',
      moduleResolution: 'nodenext',
      target: 'esnext',
      noEmit: true,
      types: [],
      lib: ['esnext'],
    },
    include: ['*.mts'],
  }),
);

const files = {
  propagated: write(
    'propagated.mts',
    'const external = (): string | null => null;\n\nexport const value = external();\n',
  ),
  normalized: write(
    'normalized.mts',
    'const external = (): string | null => null;\n\nexport const value = external() ?? undefined;\n',
  ),
  annotated: write(
    'annotated.mts',
    'const external = (): string | null => null;\n\nexport const value: string | null = external();\n',
  ),
} as const;

const result = runRules(tsconfigPath, allRules);

const diagnosticsFor = (file: string): readonly string[] =>
  (Result.isOk(result) ? result.value : [])
    .filter((diagnostic) => diagnostic.fileName === file)
    .map((diagnostic) => `${diagnostic.line}:${diagnostic.ruleId}`)
    .toSorted();

describe(runRules, () => {
  test('opens the project', () => {
    assert.isTrue(Result.isOk(result));
  });

  test('reports a declaration that takes a null from its initializer', () => {
    assert.deepStrictEqual(diagnosticsFor(files.propagated), [
      '3:null/no-null-propagation',
    ]);
  });

  test('says nothing when the boundary normalized the null away', () => {
    assert.deepStrictEqual(diagnosticsFor(files.normalized), []);
  });

  test('leaves an annotated declaration to the syntactic rule', () => {
    // A written `null` is `null/no-null-in-type`'s business, and reporting it
    // here as well would name one fault twice.
    assert.deepStrictEqual(diagnosticsFor(files.annotated), []);
  });
});
