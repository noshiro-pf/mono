import { Arr, isRecord, isString } from 'ts-data-forge';
import { restrictedSyntaxWithoutNodeVersionGate } from '../rules/index.mjs';
import { eslintConfigForNodeJs } from './nodejs.mjs';

describe(eslintConfigForNodeJs, () => {
  test('without a runtime, reports every global the floor lacks', () => {
    assert.include(
      fieldOf(optionsOf(undefined, 'no-restricted-globals'), 'name'),
      'Temporal',
    );
  });

  test('for a runtime that has them, allows what it has and keeps the rest', () => {
    const globalNames = fieldOf(optionsOf(26, 'no-restricted-globals'), 'name');

    assert.notInclude(globalNames, 'Temporal');

    assert.include(globalNames, 'eval');

    const properties = fieldOf(
      optionsOf(26, 'no-restricted-properties'),
      'property',
    );

    assert.notInclude(properties, 'getOrInsertComputed');

    // In no release yet.
    assert.include(properties, 'zip');

    const selectors = fieldOf(
      optionsOf(26, 'no-restricted-syntax'),
      'selector',
    );

    assert.isFalse(
      selectors.some(
        (selector) => isString(selector) && selector.includes("kind='using'"),
      ),
    );

    for (const { selector } of restrictedSyntaxWithoutNodeVersionGate) {
      assert.include(selectors, selector);
    }
  });

  test('for a runtime older than an API, still reports it', () => {
    assert.include(
      fieldOf(optionsOf(24, 'no-restricted-properties'), 'property'),
      'toHex',
    );

    assert.include(
      fieldOf(optionsOf(24, 'no-restricted-globals'), 'name'),
      'Temporal',
    );
  });
});

/** The options a rule is set with by the preset, its severity aside. */
const optionsOf = (
  nodeMajor: number | undefined,
  rule: string,
): readonly unknown[] => {
  const rules: unknown = eslintConfigForNodeJs(
    ['tools/**'],
    nodeMajor === undefined ? undefined : { nodeMajor },
  ).rules;

  assert.isTrue(isRecord(rules));

  const setting: unknown = rules[rule];

  if (!Arr.isArray(setting)) {
    return [];
  }

  const [, ...options]: readonly unknown[] = setting;

  return options;
};

const fieldOf = (
  options: readonly unknown[],
  key: string,
): readonly unknown[] =>
  options.map((option) => (isRecord(option) ? option[key] : undefined));
