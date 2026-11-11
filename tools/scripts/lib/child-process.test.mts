import * as path from 'node:path';
import { runFile, runInherited } from './child-process.mjs';

/** `node -e script`: a child whose behavior each test writes out. */
const node = (script: string): readonly [string, readonly string[]] =>
  [process.execPath, ['-e', script]] as const;

describe(runFile, () => {
  test('resolves with the output of a process that exits 0', async () => {
    const result = await runFile(
      ...node("process.stdout.write('out'); process.stderr.write('err');"),
    );

    assert.deepStrictEqual(result, {
      status: 0,
      signal: null,
      stdout: 'out',
      stderr: 'err',
      error: undefined,
    });
  });

  test('resolves, not rejects, with a non-zero exit as the status', async () => {
    const result = await runFile(
      ...node("process.stdout.write('partial'); process.exit(3);"),
    );

    assert.strictEqual(result.status, 3);

    assert.strictEqual(result.stdout, 'partial');

    assert.isUndefined(result.error);
  });

  test('writes `input` to stdin and closes it', async () => {
    const result = await runFile(
      ...node(
        "let s = ''; process.stdin.on('data', (c) => { s += c; }); process.stdin.on('end', () => { process.stdout.write(s.toUpperCase()); });",
      ),
      { input: 'abc' },
    );

    assert.strictEqual(result.stdout, 'ABC');
  });

  test('closes stdin when there is no input, so a reader is not left waiting', async () => {
    const result = await runFile(
      ...node(
        "process.stdin.resume(); process.stdin.on('end', () => { process.stdout.write('end'); });",
      ),
      { timeout: 10_000 },
    );

    assert.strictEqual(result.stdout, 'end');
  });

  test('reports a process that could not start as an error', async () => {
    const result = await runFile(
      path.join(import.meta.dirname, 'no-such-executable'),
      [],
    );

    assert.isNull(result.status);

    assert.isDefined(result.error);
  });

  test('reports output over maxBuffer as an error', async () => {
    const result = await runFile(
      ...node("process.stdout.write('x'.repeat(1024));"),
      { maxBuffer: 16 },
    );

    assert.isDefined(result.error);
  });

  test('reports a signal from elsewhere as the signal, not an error', async () => {
    const result = await runFile(
      ...node("process.kill(process.pid, 'SIGKILL');"),
    );

    assert.isNull(result.status);

    assert.strictEqual(result.signal, 'SIGKILL');

    assert.isUndefined(result.error);
  });
});

describe(runInherited, () => {
  test('resolves with the exit status', async () => {
    const result = await runInherited(...node('process.exit(4);'), {
      stdio: 'ignore',
    });

    assert.deepStrictEqual(result, {
      status: 4,
      signal: null,
      error: undefined,
    });
  });

  test('reports a process that could not start as an error', async () => {
    const result = await runInherited(
      path.join(import.meta.dirname, 'no-such-executable'),
      [],
      { stdio: 'ignore' },
    );

    assert.isNull(result.status);

    assert.isDefined(result.error);
  });
});
