import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { typeCheck } from '../src/index.mjs';

/**
 * The compiler replaced by a script, so each way a run can go wrong is
 * reproduced without crashing the real one. The tsconfig path is never read.
 */
const makeCompiler = (source: string): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-type-check-'));

  onTestFinished(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const compilerPath = path.join(dir, 'tsc.mjs');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(compilerPath, `${source}\n`);

  return compilerPath;
};

const tsconfigPath = path.join(os.tmpdir(), 'tsconfig.json');

describe(typeCheck, () => {
  test('a compiler exiting non-zero without a diagnostic is a failure', async () => {
    const result = await typeCheck(
      tsconfigPath,
      makeCompiler(dedent`
        process.stderr.write('panic: runtime error\\n');
        process.exit(2);
      `),
    );

    assert.deepStrictEqual(result.diagnostics, []);

    assert.include(result.output, 'panic: runtime error');

    assert.strictEqual(
      result.failure,
      'the native compiler exited with status 2 and reported no diagnostic',
    );
  });

  test('a compiler killed by a signal is a failure', async () => {
    const result = await typeCheck(
      tsconfigPath,
      makeCompiler("process.kill(process.pid, 'SIGKILL');"),
    );

    assert.deepStrictEqual(result.diagnostics, []);

    assert.strictEqual(
      result.failure,
      'the native compiler was killed by SIGKILL',
    );
  });

  test('a compiler that cannot be found is a failure', async () => {
    const result = await typeCheck(
      tsconfigPath,
      path.join(os.tmpdir(), 'sumi-type-check-missing', 'tsc.mjs'),
    );

    assert.deepStrictEqual(result.diagnostics, []);

    // Node.js itself starts and exits 1 with "Cannot find module".
    assert.strictEqual(
      result.failure,
      'the native compiler exited with status 1 and reported no diagnostic',
    );
  });

  test('a compiler output over the buffer limit is a failure', async () => {
    const result = await typeCheck(
      tsconfigPath,
      makeCompiler("process.stdout.write('x'.repeat(65 * 1024 * 1024));"),
    );

    assert.include(result.failure, 'maxBuffer');
  });

  test('a non-zero exit with a diagnostic is a type error, not a failure', async () => {
    const result = await typeCheck(
      tsconfigPath,
      makeCompiler(dedent`
        process.stdout.write("error TS5083: Cannot read file 'x'.\\n");
        process.exit(2);
      `),
    );

    // The compiler exits 2 for some config errors, a missing `files` entry.
    assert.deepStrictEqual(result.diagnostics, [
      {
        filename: '',
        line: 0,
        code: 'TS5083',
        message: "Cannot read file 'x'.",
      },
    ]);

    assert.isUndefined(result.failure);
  });

  test('a zero exit without output is clean', async () => {
    const result = await typeCheck(tsconfigPath, makeCompiler(''));

    assert.deepStrictEqual(result.diagnostics, []);

    assert.isUndefined(result.failure);
  });
});
