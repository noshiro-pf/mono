import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import { usesModuleMocks } from './vite-config.mjs';

/** A package root holding `files`, removed once `fn` returns. */
const withPackage = (
  files: ReadonlyRecord<string, string>,
  fn: (root: string) => void,
): void => {
  const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-config-'));

  try {
    for (const [file, content] of Object.entries(files)) {
      const filePath = path.join(packageRoot, file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(filePath, content);
    }

    fn(packageRoot);
  } finally {
    fs.rmSync(packageRoot, { recursive: true, force: true });
  }
};

describe(usesModuleMocks, () => {
  test.each<
    Readonly<{
      name: string;
      files: ReadonlyRecord<string, string>;
      expected: boolean;
    }>
  >([
    {
      name: 'no module mock',
      files: { 'src/a.test.mts': "vi.fn();\nvi.spyOn(console, 'log');\n" },
      expected: false,
    },
    {
      name: '`vi.mock` in a test file',
      files: { 'src/a.test.mts': "vi.mock(import('typescript'));\n" },
      expected: true,
    },
    {
      name: '`vi.doMock` under `test/`',
      files: { 'test/a.test.mts': "vi.doMock('./a.mjs');\n" },
      expected: true,
    },
    {
      name: 'a call split across lines in a `.tsx` sample',
      files: { 'samples/a.tsx': 'vi\n  .mock(\n    "./a.mjs",\n  );\n' },
      expected: true,
    },
    {
      name: 'a name that only starts like one',
      files: { 'src/a.test.mts': 'vi.mocked(f);\nvi.mockObject({});\n' },
      expected: false,
    },
    {
      name: 'a mock outside `src/`, `test/` and `samples/`',
      files: { 'scripts/a.mts': "vi.mock('./a.mjs');\n" },
      expected: false,
    },
    {
      name: 'a mock inside `node_modules`',
      files: { 'src/node_modules/x/a.mts': "vi.mock('./a.mjs');\n" },
      expected: false,
    },
  ])('$name', ({ files, expected }) => {
    withPackage(files, (packageRoot) => {
      expect(usesModuleMocks(packageRoot)).toBe(expected);
    });
  });
});
