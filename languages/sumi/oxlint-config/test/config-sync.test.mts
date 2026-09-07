import * as fs from 'node:fs';
import { hasKey, isRecord } from 'ts-data-forge';
import {
  oxlintCodeToRuleId,
  oxlintConfigPath,
  sumiPlugin,
} from '../src/index.mjs';

/**
 * The three places a rule is named — `oxlintrc.jsonc`, the neutral-ID mapping
 * and the sumi JS plugin — must agree, or the conformance corpus silently
 * checks less than the configuration runs (or the reverse).
 */

/** `oxlintrc.jsonc` allows `//` comments and trailing commas; JSON.parse does not. */
const readJsonc = (path: string): unknown => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = fs.readFileSync(path, 'utf8');

  return JSON.parse(
    text
      .split('\n')
      .filter((line) => !/^\s*\/\//u.test(line))
      .join('\n')
      .replaceAll(/,(\s*[\]}])/gu, '$1'),
  );
};

const config = readJsonc(oxlintConfigPath);

const enabledRuleNames: readonly string[] =
  isRecord(config) && hasKey(config, 'rules') && isRecord(config.rules)
    ? Object.keys(config.rules)
    : ([] as const);

/** `no-var` → `eslint(no-var)`, `typescript/x` → `typescript(x)`, as `oxlint -f json` prints them. */
const toDiagnosticCode = (ruleName: string): string => {
  const slash = ruleName.indexOf('/');

  return slash === -1
    ? `eslint(${ruleName})`
    : `${ruleName.slice(0, slash)}(${ruleName.slice(slash + 1)})`;
};

const pluginRuleNames = Object.keys(sumiPlugin.rules).map(
  (name) => `sumi/${name}`,
);

describe('oxlintrc.jsonc, the rule-ID mapping and the sumi plugin agree', () => {
  test('the configuration enables at least one rule', () => {
    assert.isTrue(enabledRuleNames.length > 0);
  });

  test('every enabled rule has a neutral-ID mapping, and every mapped code is enabled', () => {
    const enabledCodes = enabledRuleNames.map(toDiagnosticCode).toSorted();

    const mappedCodes = Array.from(oxlintCodeToRuleId.keys()).toSorted();

    assert.deepStrictEqual(enabledCodes, mappedCodes);
  });

  test('every enabled sumi/* rule exists in the plugin, and every plugin rule is enabled', () => {
    const enabledSumiRules = enabledRuleNames
      .filter((name) => name.startsWith('sumi/'))
      .toSorted();

    assert.deepStrictEqual(enabledSumiRules, pluginRuleNames.toSorted());
  });
});
