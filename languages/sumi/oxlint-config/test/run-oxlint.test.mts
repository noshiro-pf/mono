import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runOxlint } from '../src/index.mjs';

/** oxlint replaced by a script, so a run that goes wrong is reproduced. */
const makeOxlint = (source: string): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-run-oxlint-'));

  onTestFinished(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const binPath = path.join(dir, 'oxlint.mjs');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(binPath, `${source}\n`);

  return binPath;
};

describe(runOxlint, () => {
  test('a run that prints nothing is a failure, not a throw', async () => {
    const result = await runOxlint(
      ['a.mts'],
      makeOxlint(
        String.raw`process.stderr.write('could not load the config\n');`,
      ),
    );

    assert.deepStrictEqual(result.diagnostics, []);

    assert.include(result.failure, 'oxlint produced no JSON output');

    assert.include(result.stderr, 'could not load the config');
  });

  test('a run killed by a signal is a failure, even after complete JSON', async () => {
    const result = await runOxlint(
      ['a.mts'],
      makeOxlint(
        "process.stdout.write('{\"diagnostics\":[]}'); process.kill(process.pid, 'SIGKILL');",
      ),
    );

    assert.strictEqual(result.failure, 'oxlint was killed by SIGKILL');
  });

  test('a run that reports exits non-zero and is read, not a failure', async () => {
    const result = await runOxlint(
      ['a.mts'],
      makeOxlint(
        [
          'process.stdout.write(JSON.stringify({ diagnostics: [{',
          "  code: 'eslint(no-var)', message: 'm', severity: 'error',",
          "  filename: '/a.mts', labels: [{ span: { line: 3 } }],",
          '}] }));',
          'process.exit(1);',
        ].join('\n'),
      ),
    );

    assert.isUndefined(result.failure);

    assert.deepStrictEqual(result.diagnostics, [
      {
        code: 'eslint(no-var)',
        message: 'm',
        severity: 'error',
        filename: '/a.mts',
        line: 3,
      },
    ]);
  });
});
