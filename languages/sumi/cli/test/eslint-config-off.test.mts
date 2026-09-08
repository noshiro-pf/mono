import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import * as path from 'node:path';
import { implementedRuleIds } from 'sumi-oxlint-config';
import {
  eslintConfigOffForSumiCheck,
  eslintRulesByRuleId,
} from '../src/index.mjs';

const projectRootPath = path.resolve(import.meta.dirname, '..');

describe('the ESLint off block', () => {
  test('the table covers exactly the IDs the oxlint preset implements', () => {
    assert.deepStrictEqual(
      Array.from(eslintRulesByRuleId.keys()).toSorted(),
      Array.from(implementedRuleIds).toSorted(),
    );
  });

  test('turns off every listed rule and nothing else', () => {
    const listed = Array.from(eslintRulesByRuleId.values()).flat().toSorted();

    assert.deepStrictEqual(
      Object.keys(eslintConfigOffForSumiCheck.rules),
      Array.from(new Set(listed)),
    );

    assert.deepStrictEqual(
      new Set(Object.values(eslintConfigOffForSumiCheck.rules)),
      new Set(['off']),
    );
  });

  test('every listed rule is one eslint-config-typed configures', () => {
    const configured = new Set(
      eslintConfigForTypeScript({
        tsconfigRootDir: projectRootPath,
        tsconfigFileName: './tsconfig.json',
        packageDirs: [projectRootPath],
      }).flatMap((block: FlatConfig) => Object.keys(block.rules ?? {})),
    );

    const unknown = Object.keys(eslintConfigOffForSumiCheck.rules).filter(
      (rule) => !configured.has(rule),
    );

    assert.deepStrictEqual(unknown, []);
  });
});
