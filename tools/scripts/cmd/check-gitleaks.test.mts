// cspell:ignore MIIB Bgkqhki BAQEFAAOC AMIIB KCAQE
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  describeFindings,
  installPinnedGitleaks,
  isScanned,
  parseReport,
  scanFiles,
} from './check-gitleaks.mjs';

describe(isScanned, () => {
  test('scans every file but those under experimental/', () => {
    assert.isTrue(isScanned('apps/x/src/index.mts'));

    assert.isTrue(isScanned('docs/notes.md'));

    assert.isFalse(isScanned('experimental/old/config.ts'));
  });
});

describe(parseReport, () => {
  test('reads each finding’s rule, file from the scanned root, and line', () => {
    const report = parseReport(
      [
        {
          RuleID: 'generic-api-key',
          File: '/tmp/scan/apps/x/src/a.mts',
          StartLine: 3,
          Secret: 'REDACTED',
        },
      ],
      '/tmp/scan',
    );

    assert.deepStrictEqual(
      report,
      Result.ok([
        { rule: 'generic-api-key', file: 'apps/x/src/a.mts', line: 3 },
      ]),
    );
  });

  test('is an error for a report not in the shape gitleaks writes', () => {
    assert.isTrue(Result.isErr(parseReport({ findings: [] }, '/tmp/scan')));

    assert.isTrue(
      Result.isErr(parseReport([{ RuleID: 'x', File: 3 }], '/tmp/scan')),
    );
  });
});

describe(describeFindings, () => {
  test('names each finding by file, line and rule, and says how to resolve one', () => {
    const message = describeFindings(
      [{ rule: 'generic-api-key', file: 'apps/x/src/a.mts', line: 3 }],
      '8.30.1',
    );

    assert.include(message, 'apps/x/src/a.mts:3 generic-api-key');

    assert.include(message, 'gitleaks:allow');

    assert.include(message, 'tools/configs/gitleaks.toml');
  });
});

describe(scanFiles, () => {
  test('finds a token, and leaves the values public by design alone', async () => {
    const installed = await installPinnedGitleaks();

    assert.isTrue(Result.isOk(installed));

    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gitleaks-root-'));

    const scanRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gitleaks-scan-'));

    onTestFinished(async () => {
      await fs.rm(root, { recursive: true, force: true });

      await fs.rm(scanRoot, { recursive: true, force: true });
    });

    // Built here rather than written out, so that this file is not itself a
    // finding.
    const token =
      `ghp_${'a1B2c3D4e5F6g7H8i9J0'.repeat(2).slice(0, 36)}` as const;

    const firebaseKey =
      `AIza${'Sy0123456789abcdefghijklmnopqrstuvw'.slice(0, 35)}` as const;

    const publicKey = [
      'MIIBIjANBgkqhkiG9w0BAQEFAAOC',
      'AQ8AMIIBCgKCAQEAwq3tY7R9a',
    ].join('');

    const files = {
      'tools/leak.mts': `export const token = '${token}';\n`,
      'apps/demo/src/firebase/config.mts': `export const config = { apiKey: '${firebaseKey}' } as const;\n`,
      'apps/demo/public/manifest.json': `{ "key": "${publicKey}" }\n`,
    } as const;

    await Promise.all(
      Object.entries(files).map(async ([file, content]) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a directory of the test's own.
        await fs.mkdir(path.dirname(path.join(root, file)), {
          recursive: true,
        });

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a directory of the test's own.
        await fs.writeFile(path.join(root, file), content);
      }),
    );

    const findings = await scanFiles({
      gitleaks: installed.value.binary,
      root,
      files: Object.keys(files),
      scanRoot,
    });

    assert.isTrue(Result.isOk(findings));

    assert.deepStrictEqual(
      findings.value.map(({ file }) => file),
      ['tools/leak.mts'],
    );
  });
});
