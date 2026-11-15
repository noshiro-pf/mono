// cspell:ignore unstub

import { ensureInitiatorRule, installInitiatorRule } from '../src/index.mjs';

type Rule = Readonly<{
  id: number;
  action: Readonly<{
    type: string;
    requestHeaders?: readonly Readonly<{ header: string }>[];
    responseHeaders?: readonly Readonly<{ header: string }>[];
  }>;
}>;

/**
 * `chrome.declarativeNetRequest`'s dynamic rules in memory, holding `rules` at
 * first, and the number of writes made to them.
 */
const stubDynamicRules = (
  rules: readonly Rule[],
): Readonly<{ rules: () => readonly Rule[]; writes: () => number }> => {
  const mut_state: { rules: readonly Rule[]; writes: number } = {
    rules,
    writes: 0,
  };

  vi.stubGlobal('chrome', {
    runtime: { id: 'abcdefghijklmnop' },
    declarativeNetRequest: {
      getDynamicRules: () => Promise.resolve(mut_state.rules),
      updateDynamicRules: ({
        removeRuleIds,
        addRules,
      }: Readonly<{
        removeRuleIds: readonly number[];
        addRules: readonly Rule[];
      }>) => {
        mut_state.writes += 1;

        mut_state.rules = [
          ...mut_state.rules.filter(({ id }) => !removeRuleIds.includes(id)),
          ...addRules,
        ];

        return Promise.resolve();
      },
    },
  });

  return { rules: () => mut_state.rules, writes: () => mut_state.writes };
};

/** The rule an older build left behind: one response header, no request ones. */
const olderRule: Rule = {
  id: 1,
  action: {
    type: 'modifyHeaders',
    responseHeaders: [{ header: 'x-frame-options' }],
  },
} as const;

const headersOf = (
  edits: readonly Readonly<{ header: string }>[] | undefined,
): readonly string[] => (edits ?? []).map(({ header }) => header);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(installInitiatorRule, () => {
  test('replaces an existing rule 1 whose action differs (#3987)', async () => {
    const store = stubDynamicRules([olderRule]);

    assert.isTrue(await installInitiatorRule());

    assert.strictEqual(store.writes(), 1);

    const [rule] = store.rules();

    assert.deepStrictEqual(headersOf(rule?.action.requestHeaders), [
      'sec-fetch-dest',
      'sec-fetch-mode',
      'sec-fetch-site',
    ]);

    assert.deepStrictEqual(headersOf(rule?.action.responseHeaders), [
      'x-frame-options',
      'content-security-policy',
      'content-security-policy-report-only',
    ]);
  });
});

describe(ensureInitiatorRule, () => {
  test('writes nothing when rule 1 exists', async () => {
    const store = stubDynamicRules([olderRule]);

    assert.isTrue(await ensureInitiatorRule());

    assert.strictEqual(store.writes(), 0);
  });

  test('installs the rule when there is none', async () => {
    const store = stubDynamicRules([]);

    assert.isTrue(await ensureInitiatorRule());

    assert.strictEqual(store.writes(), 1);

    assert.deepStrictEqual(
      store.rules().map(({ id }) => id),
      [1],
    );
  });
});
