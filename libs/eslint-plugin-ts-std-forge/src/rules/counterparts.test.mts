import { tsDataForgeRules } from 'eslint-plugin-ts-data-forge';
import { ruleFactoriesOf } from 'eslint-rule-forge';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { hasKey } from 'ts-std-forge';
import { tsStdForgeRules } from './rules.mjs';

/**
 * The rows of the README's table of counterparts: each rule of this plugin and
 * the eslint-plugin-ts-data-forge rule that does the same with ts-data-forge's
 * API, or `undefined` for one with none (written `—`).
 */
const readCounterparts = (): readonly (readonly [
  string,
  string | undefined,
])[] => {
  const readme = fs.readFileSync(
    path.resolve(import.meta.dirname, '../../README.md'),
    'utf8',
  );

  const section = readme.slice(
    readme.indexOf('## Relation to `eslint-plugin-ts-data-forge`'),
    readme.indexOf('## Installation'),
  );

  return section
    .split('\n')
    .filter((line) => line.startsWith('| `'))
    .map((line) => {
      const [own = '', counterpart = ''] = line
        .split('|')
        .slice(1)
        .map((cell) => cell.trim());

      const name = own.replaceAll('`', '');

      return [
        name,
        counterpart === 'same name'
          ? name
          : counterpart === '—'
            ? undefined
            : counterpart.replaceAll('`', ''),
      ] as const;
    });
};

const counterparts = readCounterparts();

test('the README names a counterpart, or none, for every rule', () => {
  assert.sameMembers(
    counterparts.map(([own]) => own),
    Object.keys(tsStdForgeRules),
  );
});

// Compared by name, not identity: the two plugins may load two copies of
// eslint-rule-forge.
const factoryNames = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  rule: Parameters<typeof ruleFactoriesOf>[0],
): readonly string[] => ruleFactoriesOf(rule).map((factory) => factory.name);

const pairs = counterparts.flatMap(([own, counterpart]) =>
  counterpart === undefined ? [] : [[own, counterpart] as const],
);

test.each(pairs)(
  '%s is built by a factory its counterpart %s is built by too',
  (own, counterpart) => {
    const ownRule = hasKey(tsStdForgeRules, own)
      ? tsStdForgeRules[own]
      : undefined;

    const counterpartRule = hasKey(tsDataForgeRules, counterpart)
      ? tsDataForgeRules[counterpart]
      : undefined;

    assert.isDefined(ownRule);

    assert.isDefined(counterpartRule);

    const ownFactories = factoryNames(ownRule);

    assert.isNotEmpty(ownFactories);

    assert.includeMembers(
      Array.from(factoryNames(counterpartRule)),
      Array.from(ownFactories),
    );
  },
);
