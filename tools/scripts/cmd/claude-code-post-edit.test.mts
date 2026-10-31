import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';
import { isEligible, readFilePath } from './claude-code-post-edit.mjs';

const scriptPath = path.join(
  projectRootPath,
  'tools/scripts/cmd/claude-code-post-edit.mts',
);

/** Runs the hook as Claude Code does: `node`, the event on stdin. */
const runHook = (
  stdin: string,
): Readonly<{ status: number | null; stderr: string }> => {
  const result = spawnSync(process.execPath, [scriptPath], {
    input: stdin,
    encoding: 'utf8',
  });

  return { status: result.status, stderr: result.stderr };
};

const runHookOn = (
  filePath: string,
): Readonly<{ status: number | null; stderr: string }> =>
  runHook(
    JSON.stringify({
      hook_event_name: 'PostToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: filePath },
    }),
  );

// The fixtures below live in temporary directories this file makes.

const write = (file: string, content: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.writeFileSync(file, content);
};

const read = (file: string): string =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.readFileSync(file, 'utf8');

const withTemporaryDirectory = (run: (directory: string) => void): void => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'post-edit-'));

  try {
    run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

/**
 * A throwaway repository: the marker the hook looks for, a Prettier config with
 * the plugin this repository's has, this repository's `node_modules` for the
 * tools, and one package that lints with oxlint.
 */
const withRepository = (run: (root: string) => void): void => {
  withTemporaryDirectory((root) => {
    write(path.join(root, 'pnpm-workspace.yaml'), '');

    write(
      path.join(root, '.prettierrc'),
      JSON.stringify({
        plugins: ['prettier-plugin-organize-imports'],
        singleQuote: true,
      }),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
    fs.symlinkSync(
      path.join(projectRootPath, 'node_modules'),
      path.join(root, 'node_modules'),
    );

    write(
      path.join(root, 'libs/a/package.json'),
      JSON.stringify({ scripts: { 'check:lint': 'oxlint . && eslint .' } }),
    );

    // The hook passes `--quiet`, so only errors count, as in this repository's
    // own config.
    write(
      path.join(root, 'libs/a/.oxlintrc.json'),
      JSON.stringify({ rules: { 'no-debugger': 'error' } }),
    );

    run(root);
  });
};

describe('readFilePath', () => {
  test('reads tool_input.file_path', () => {
    assert.strictEqual(
      readFilePath(JSON.stringify({ tool_input: { file_path: '/a/b.mts' } })),
      '/a/b.mts',
    );
  });

  test.each([
    ['not JSON', 'not JSON'],
    ['no tool_input', JSON.stringify({})],
    ['a relative path', JSON.stringify({ tool_input: { file_path: 'b.mts' } })],
    ['a number', JSON.stringify({ tool_input: { file_path: 1 } })],
  ])('is undefined for %s', (_, stdin) => {
    assert.isUndefined(readFilePath(stdin));
  });
});

describe('isEligible', () => {
  test.each([
    ['libs/ts-data-forge/src/array.mts', true],
    ['tools/scripts/cmd/x.mts', true],
    ['README.md', true],
    ['experimental/old/a.ts', false],
    ['strict-lib/v7.0/source/a.ts', false],
    ['libs/a/node_modules/b/index.js', false],
    ['libs/a/dist/index.mjs', false],
    ['../elsewhere/a.mts', false],
    ['', false],
  ] as const)('%s → %s', (relative, expected) => {
    assert.strictEqual(isEligible(relative), expected);
  });
});

describe('the hook as Claude Code runs it', () => {
  test('formats the file and says nothing when all is well', () => {
    withRepository((root) => {
      const file = path.join(root, 'libs/a/src/a.mts');

      write(file, 'export const a=1\n');

      assert.deepStrictEqual(runHookOn(file), { status: 0, stderr: '' });

      assert.strictEqual(read(file), 'export const a = 1;\n');
    });
  });

  test('sorts the imports but keeps one not used yet', () => {
    withRepository((root) => {
      const file = path.join(root, 'libs/a/src/a.mts');

      write(
        file,
        "import { b } from './b.mjs';\nimport { a } from './a.mjs';\n\nexport const x = a;\n",
      );

      assert.deepStrictEqual(runHookOn(file), { status: 0, stderr: '' });

      assert.strictEqual(
        read(file),
        "import { a } from './a.mjs';\nimport { b } from './b.mjs';\n\nexport const x = a;\n",
      );
    });
  });

  test('reports a syntax error with exit code 2', () => {
    withRepository((root) => {
      const file = path.join(root, 'libs/a/src/a.mts');

      write(file, 'export const a = (;\n');

      const result = runHookOn(file);

      assert.strictEqual(result.status, 2);

      assert.include(
        result.stderr,
        'Prettier could not format libs/a/src/a.mts',
      );
    });
  });

  test('is silent when Prettier itself fails rather than the file', () => {
    withRepository((root) => {
      write(
        path.join(root, '.prettierrc'),
        JSON.stringify({ plugins: ['prettier-plugin-that-does-not-exist'] }),
      );

      const file = path.join(root, 'libs/a/src/a.mts');

      write(file, 'export const a = 1;\n');

      assert.deepStrictEqual(runHookOn(file), { status: 0, stderr: '' });
    });
  });

  test('reports what oxlint finds with exit code 2', () => {
    withRepository((root) => {
      const file = path.join(root, 'libs/a/src/a.mts');

      write(file, 'export const f = (): void => {\n  debugger;\n};\n');

      const result = runHookOn(file);

      assert.strictEqual(result.status, 2);

      assert.include(result.stderr, 'oxlint reports, in libs/a/src/a.mts');

      assert.include(result.stderr, 'debugger');
    });
  });

  test('leaves experimental/ alone', () => {
    withRepository((root) => {
      const file = path.join(root, 'experimental/a.mts');

      write(file, 'export const a=1\n');

      assert.deepStrictEqual(runHookOn(file), { status: 0, stderr: '' });

      assert.strictEqual(read(file), 'export const a=1\n');
    });
  });

  test('is silent for a file outside any repository', () => {
    withTemporaryDirectory((dir) => {
      const file = path.join(dir, 'a.mts');

      write(file, 'export const a=1\n');

      assert.deepStrictEqual(runHookOn(file), { status: 0, stderr: '' });

      assert.strictEqual(read(file), 'export const a=1\n');
    });
  });

  test('is silent for a file that does not exist', () => {
    assert.deepStrictEqual(
      runHookOn(
        path.join(projectRootPath, 'tools/scripts/cmd/does-not-exist.mts'),
      ),
      { status: 0, stderr: '' },
    );
  });

  test('is silent on bad input', () => {
    assert.deepStrictEqual(runHook('{'), { status: 0, stderr: '' });
  });

  test('the script needs nothing but Node itself', () => {
    // It runs on whatever Node the session has, possibly before anything is
    // installed; the `minimum` of tools/configs/node-support.json has no
    // `Temporal`.
    const source = read(scriptPath);

    const specifiers = source
      .matchAll(/^import (?!type )[^;]* from '([^']+)';$/gmu)
      .map((m) => m[1])
      .toArray();

    assert.isNotEmpty(specifiers);

    assert.deepStrictEqual(
      specifiers.filter((s) => !(s?.startsWith('node:') ?? false)),
      [],
    );

    assert.notMatch(source, /\bTemporal\./u);
  });
});
