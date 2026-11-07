import { implementedRuleIds } from '@sumi-lang/oxlint-config';
import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import * as path from 'node:path';
import {
  eslintConfigOffForSumiCheck,
  eslintRulesByRuleId,
  keptOnRules,
} from '../src/index.mjs';

const projectRootPath = path.resolve(import.meta.dirname, '..');

describe('the ESLint off block', () => {
  test('the table covers exactly the IDs the oxlint preset implements', () => {
    assert.deepStrictEqual(
      Array.from(eslintRulesByRuleId.keys()).toSorted(),
      Array.from(implementedRuleIds).toSorted(),
    );
  });

  test('turns off every listed rule but those kept on, and nothing else', () => {
    const listed = Array.from(eslintRulesByRuleId.values())
      .flat()
      .filter((rule) => !keptOnRules.has(rule))
      .toSorted();

    assert.deepStrictEqual(
      Object.keys(eslintConfigOffForSumiCheck.rules),
      Array.from(new Set(listed)),
    );

    assert.deepStrictEqual(
      new Set(Object.values(eslintConfigOffForSumiCheck.rules)),
      new Set<string>(['off']),
    );
  });

  test('leaves no-restricted-imports on, which also carries the restrictions of a package (#3068)', () => {
    assert.isFalse(
      Object.hasOwn(eslintConfigOffForSumiCheck.rules, 'no-restricted-imports'),
    );

    for (const rule of keptOnRules) {
      assert.isTrue(
        eslintRulesByRuleId.values().some((rules) => rules.includes(rule)),
      );
    }
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
