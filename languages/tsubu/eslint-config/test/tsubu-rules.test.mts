import { Linter } from 'eslint';
import { type FlatConfig } from 'eslint-config-typed';
import * as path from 'node:path';
import { eslintConfigForTsubu, tsubuRules } from '../src/index.mjs';

type RuleEntry = NonNullable<NonNullable<FlatConfig['rules']>[string]>;

const packageRoot = path.resolve(import.meta.dirname, '..');

const configs = eslintConfigForTsubu({
  tsconfigRootDir: packageRoot,
  tsconfigFileName: './tsconfig.json',
  packageDirs: [packageRoot],
});

/**
 * Resolves the entry a rule ends up with after flat-config merging
 * (last-wins). The Tsubu override block is appended last and unscoped, so for
 * every overridden rule the effective entry must be exactly the Tsubu one —
 * this catches a regression where the override block stops being last, or a
 * base-config change re-overrides a Tsubu rule.
 */
const effectiveRuleEntry = (ruleId: string): RuleEntry | undefined =>
  configs.reduce<RuleEntry | undefined>(
    (acc, config) => config.rules?.[ruleId] ?? acc,
    undefined,
  );

/**
 * FlatConfig rule entries are readonly tuples; Linter.verify wants mutable
 * ones. Rebuilding the tuple avoids a type assertion.
 */
const toLinterRuleEntry = (entry: RuleEntry | undefined): Linter.RuleEntry => {
  if (entry === undefined) {
    return 'off';
  }

  if (typeof entry === 'string' || typeof entry === 'number') {
    return entry;
  }

  const [severity, ...options] = entry;

  return [severity, ...options];
};

describe('composition', () => {
  test('every Tsubu override is the effective entry', () => {
    assert.isTrue(Object.keys(tsubuRules).length > 0);

    for (const [ruleId, entry] of Object.entries(tsubuRules)) {
      assert.deepStrictEqual(effectiveRuleEntry(ruleId), entry);
    }
  });

  test('base config rules are included (spot check)', () => {
    // A rule the preset does not touch must arrive from eslint-config-typed.
    assert.deepStrictEqual(effectiveRuleEntry('no-var'), 'error');
  });

  test('eslint-plugin-ts-data-forge rules are included (spot check)', () => {
    assert.notStrictEqual(
      effectiveRuleEntry('ts-data-forge/prefer-arr-is-array'),
      undefined,
    );
  });
});

/**
 * Behavioral checks for the overridden ESLint core rules, run with the entry
 * taken from the composed config (not a copy), so the tests exercise the
 * options the preset actually ships. Plugin rules (functional/*, unicorn/*)
 * need their plugin loaded with type information and are validated by the
 * conformance corpus runner instead.
 */
const lintWithEffectiveEntry = (
  ruleId: string,
  code: string,
): readonly string[] => {
  const linter = new Linter();

  const entry = effectiveRuleEntry(ruleId);

  assert.notStrictEqual(entry, undefined);

  const messages = linter.verify(code, {
    languageOptions: { sourceType: 'module' },
    rules: { [ruleId]: toLinterRuleEntry(entry) },
  });

  return messages.map((m) => m.ruleId ?? m.message);
};

describe('eqeqeq (== null is no longer exempt)', () => {
  test('reports x == null', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('eqeqeq', 'const f = (x) => x == null;'),
      ['eqeqeq'],
    );
  });

  test('accepts x === undefined', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('eqeqeq', 'const f = (x) => x === undefined;'),
      [],
    );
  });
});

describe('no-implicit-coercion (boolean: true)', () => {
  test('reports !!x', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('no-implicit-coercion', 'const f = (x) => !!x;'),
      ['no-implicit-coercion'],
    );
  });
});

describe('no-plusplus (for afterthoughts are no longer exempt)', () => {
  test('reports i++ in a for afterthought', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry(
        'no-plusplus',
        'for (let i = 0; i < 3; i++) { console.log(i); }',
      ),
      ['no-plusplus'],
    );
  });
});

describe('no-bitwise', () => {
  test('reports a & b', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('no-bitwise', 'const f = (a, b) => a & b;'),
      ['no-bitwise'],
    );
  });
});

describe('id-denylist (fn is reserved, D-17)', () => {
  test('reports a variable declaration named fn', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('id-denylist', 'const fn = 1; console.log(fn);'),
      ['id-denylist'],
    );
  });

  test('accepts reading an external property named fn', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('id-denylist', 'const x = globalThis.fn;'),
      [],
    );
  });

  test('accepts the D-17 rename escape hatch in destructuring', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry(
        'id-denylist',
        'const { fn: renamed } = globalThis; console.log(renamed);',
      ),
      [],
    );
  });

  test('accepts the rename escape hatch in imports', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry(
        'id-denylist',
        "import { fn as renamed } from 'm'; console.log(renamed);",
      ),
      [],
    );
  });

  test('reports defining an own object property named fn (known deviation from D-17: stricter than the spec)', () => {
    assert.deepStrictEqual(
      lintWithEffectiveEntry('id-denylist', 'const o = { fn: 1 };'),
      ['id-denylist'],
    );
  });
});
