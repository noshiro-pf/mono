import { oxlintConfigPath } from '@sumi-lang/oxlint-config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import { oxlintConfigOffForSumiCheck } from '../src/index.mjs';

const projectRootPath = path.resolve(import.meta.dirname, '..');

describe('the oxlint off fragment', () => {
  test('oxlint-config-off.json is the generated form (pnpm run gen:oxlint-config-off)', () => {
    const written: unknown = JSON.parse(
      fs.readFileSync(
        path.join(projectRootPath, 'oxlint-config-off.json'),
        'utf8',
      ),
    );

    assert.deepStrictEqual(written, oxlintConfigOffForSumiCheck);
  });

  test('turns off exactly the native rules the preset enables', () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const raw = fs.readFileSync(oxlintConfigPath, 'utf8');

    const text = raw
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('//'))
      .join('\n')
      .replaceAll(/,(\s*[}\]])/gu, '$1');

    const parsed: unknown = JSON.parse(text);

    const rules =
      isRecord(parsed) && hasKey(parsed, 'rules') ? parsed.rules : undefined;

    const enabledNative = Object.entries(isRecord(rules) ? rules : {})
      .filter(
        ([name, setting]) => !name.startsWith('sumi/') && setting !== 'off',
      )
      .map(([name]) => name)
      .toSorted();

    assert.deepStrictEqual(
      Object.keys(oxlintConfigOffForSumiCheck.rules),
      enabledNative,
    );
  });
});
