import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runNodeScript } from '../src/index.mjs';

/** A script that does what `source` says, removed after the test. */
const makeScript = (source: string): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-run-node-script-'));

  onTestFinished(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const scriptPath = path.join(dir, 'script.mjs');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(scriptPath, `${source}\n`);

  return scriptPath;
};

describe(runNodeScript, () => {
  test('a script that exits 0 has status 0 and no failure', async () => {
    const run = await runNodeScript(
      [makeScript("process.stdout.write('out'); process.stderr.write('err');")],
      'the script',
    );

    assert.deepStrictEqual(run, {
      stdout: 'out',
      stderr: 'err',
      status: 0,
      failure: undefined,
    });
  });

  test('a non-zero exit is a status, which the caller reads', async () => {
    const run = await runNodeScript(
      [makeScript('process.exit(3);')],
      'the script',
    );

    assert.strictEqual(run.status, 3);

    assert.isUndefined(run.failure);
  });

  test('a script killed by a signal is a failure', async () => {
    const run = await runNodeScript(
      [makeScript("process.kill(process.pid, 'SIGKILL');")],
      'the script',
    );

    assert.strictEqual(run.status, null);

    assert.strictEqual(run.failure, 'the script was killed by SIGKILL');
  });

  test('a script that does not exist exits 1, as Node.js reports it', async () => {
    const run = await runNodeScript(
      [path.join(os.tmpdir(), 'sumi-run-node-script-missing', 'script.mjs')],
      'the script',
    );

    assert.strictEqual(run.status, 1);

    assert.include(run.stderr, 'Cannot find module');

    assert.isUndefined(run.failure);
  });

  test('output over the buffer limit is a failure', async () => {
    const run = await runNodeScript(
      [makeScript("process.stdout.write('x'.repeat(65 * 1024 * 1024));")],
      'the script',
    );

    assert.include(run.failure, 'the script did not run to completion');

    assert.include(run.failure, 'maxBuffer');
  });

  test('runs in the directory given', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-run-node-cwd-'));

    onTestFinished(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    const run = await runNodeScript(
      [makeScript('process.stdout.write(process.cwd());')],
      'the script',
      { cwd: dir },
    );

    // Both resolved, since the temporary directory may be reached through a link.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const [printed, made] = [run.stdout, dir].map((p) => fs.realpathSync(p));

    assert.strictEqual(printed, made);
  });
});
