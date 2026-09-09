import { Result } from 'ts-data-forge';
import {
  compareVersions,
  expectedFields,
  parseNodeSupportConfig,
  parseVersion,
  type NodeSupportConfig,
  type Version,
} from './check-node-support.mjs';

/**
 * The config every case below starts from, so that each one varies exactly the
 * field it is about.
 */
const validConfig = {
  policy: 'reactive',
  knownBroken: null,
  targets: { minimum: '22.22.2', lts: '24.21.0', current: '26.8.1' },
} as const;

/** `validConfig` with one or more fields replaced. */
const configWith = (
  overrides: Partial<NodeSupportConfig>,
): NodeSupportConfig => ({ ...validConfig, ...overrides });

const v = (major: number, minor: number, patch: number): Version => ({
  major,
  minor,
  patch,
});

describe('parseNodeSupportConfig', () => {
  test('accepts a valid config', () => {
    const result = parseNodeSupportConfig(validConfig);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      policy: 'reactive',
      knownBroken: null,
      targets: { minimum: '22.22.2', lts: '24.21.0', current: '26.8.1' },
    });
  });

  test('accepts a config carrying knownBroken', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      knownBroken: {
        since: '27.0.0',
        reason: 'require(esm) removed',
        issue: 7,
      },
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value.knownBroken, {
      since: '27.0.0',
      reason: 'require(esm) removed',
      issue: 7,
    });
  });

  test('defaults knownBroken.issue to null when it is not a number', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      knownBroken: { since: '27.0.0', reason: 'x', issue: 'PR-7' },
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value.knownBroken?.issue, null);
  });

  test('rejects a non-object', () => {
    assert.isTrue(Result.isErr(parseNodeSupportConfig('nope')));
  });

  test('rejects an unknown policy', () => {
    const result = parseNodeSupportConfig({ ...validConfig, policy: 'bogus' });

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      result.value,
      '❌ `policy` must be one of "none", "reactive", "major-ceiling".',
    );
  });

  test('rejects targets missing an entry', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      targets: { minimum: '22.22.2', current: '26.8.1' },
    });

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, '❌ `targets` is missing: lts.');
  });

  test('rejects a target that is not an exact major.minor.patch', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      targets: { ...validConfig.targets, lts: '24.x' },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith(
        '❌ Every `targets` entry must be an exact `major.minor.patch`:',
      ),
    );
  });

  test('rejects targets that do not ascend', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      targets: { ...validConfig.targets, lts: '20.0.0' },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith(
        '❌ `targets` must ascend: minimum < lts < current.',
      ),
    );
  });

  test('rejects a knownBroken.since that is not an exact version', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      knownBroken: { since: '27', reason: 'x', issue: null },
    });

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      result.value,
      '❌ `knownBroken.since` must be an exact `major.minor.patch`.',
    );
  });

  test('rejects a knownBroken with no reason', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      knownBroken: { since: '27.0.0', reason: '', issue: null },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith('❌ `knownBroken.reason` must say what broke.'),
    );
  });

  test('rejects policy "none" while knownBroken names a version', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      policy: 'none',
      knownBroken: { since: '27.0.0', reason: 'x', issue: null },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith(
        '❌ `policy` is "none", which promises never to bound the top of',
      ),
    );
  });

  test('accepts policy "none" while knownBroken is null', () => {
    assert.isTrue(
      Result.isOk(parseNodeSupportConfig({ ...validConfig, policy: 'none' })),
    );
  });

  // The one that pins the `Result.safeTry` refactor: `targets` is unwrapped
  // before `knownBroken`, so the first `Err` is the one that comes back and
  // the second parse never decides the message. A `safeTry` body that kept
  // going, or that reordered the two unwraps, would report the knownBroken
  // error here instead.
  test('reports the first failure when targets and knownBroken are both invalid', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      targets: { ...validConfig.targets, lts: '24.x' },
      knownBroken: { since: 'not-a-version', reason: '', issue: null },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith(
        '❌ Every `targets` entry must be an exact `major.minor.patch`:',
      ),
    );
  });

  // The policy check reads `knownBroken`, so it can only run once both
  // unwraps have succeeded — an invalid `targets` has to win over it.
  test('reports the targets failure before the policy/knownBroken conflict', () => {
    const result = parseNodeSupportConfig({
      ...validConfig,
      policy: 'none',
      targets: { ...validConfig.targets, lts: '24.x' },
      knownBroken: { since: '27.0.0', reason: 'x', issue: null },
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith(
        '❌ Every `targets` entry must be an exact `major.minor.patch`:',
      ),
    );
  });
});

describe('expectedFields', () => {
  test('leaves the top open under the reactive policy with nothing broken', () => {
    assert.deepStrictEqual(
      expectedFields(validConfig).enginesNode,
      '>=22.22.2',
    );
  });

  test('bounds the top at the broken major under the reactive policy', () => {
    const expected = expectedFields(
      configWith({
        knownBroken: { since: '27.0.0', reason: 'x', issue: null },
      }),
    );

    assert.deepStrictEqual(expected.enginesNode, '>=22.22.2 <27');
  });

  test('leaves the top open under the none policy', () => {
    assert.deepStrictEqual(
      expectedFields(configWith({ policy: 'none' })).enginesNode,
      '>=22.22.2',
    );
  });

  test('bounds the top one major above current under the major-ceiling policy', () => {
    assert.deepStrictEqual(
      expectedFields(configWith({ policy: 'major-ceiling' })).enginesNode,
      '>=22.22.2 <27',
    );
  });

  // A known breakage is a fact about a version; the ceiling is a policy. The
  // fact wins, even when it is lower than the policy's ceiling would be.
  test('prefers the known-broken major over the major-ceiling one', () => {
    const expected = expectedFields(
      configWith({
        policy: 'major-ceiling',
        knownBroken: { since: '25.1.0', reason: 'x', issue: null },
      }),
    );

    assert.deepStrictEqual(expected.enginesNode, '>=22.22.2 <25');
  });

  test('derives the contributor fields from current', () => {
    const expected = expectedFields(validConfig);

    assert.deepStrictEqual(expected.voltaNode, '26.8.1');

    assert.deepStrictEqual(expected.devEnginesRuntime, '^26.8.1');
  });
});

describe('parseVersion', () => {
  test('parses an exact version', () => {
    assert.deepStrictEqual(parseVersion('22.22.2'), {
      major: 22,
      minor: 22,
      patch: 2,
    });
  });

  test.each([
    ['22.22', 'a two-part version'],
    ['v22.22.2', 'a leading v'],
    ['22.22.x', 'a non-numeric part'],
    ['', 'an empty string'],
    // Rejected on purpose: a prerelease does not satisfy a plain semver range
    // (`>=22.22.2` does not match `27.0.0-nightly…`), so it must never reach
    // the config as a pinned target.
    ['27.0.0-nightly20260908', 'a prerelease'],
  ])('rejects %s (%s)', (input) => {
    assert.deepStrictEqual(parseVersion(input), undefined);
  });
});

describe('compareVersions', () => {
  test('orders by major first', () => {
    assert.isTrue(compareVersions(v(22, 99, 99), v(24, 0, 0)) < 0);
  });

  test('orders by minor when the major is equal', () => {
    assert.isTrue(compareVersions(v(24, 21, 0), v(24, 18, 9)) > 0);
  });

  test('orders by patch when major and minor are equal', () => {
    assert.isTrue(compareVersions(v(24, 21, 0), v(24, 21, 1)) < 0);
  });

  test('is zero for equal versions', () => {
    assert.deepStrictEqual(compareVersions(v(26, 8, 1), v(26, 8, 1)), 0);
  });
});
