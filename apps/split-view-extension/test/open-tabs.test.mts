import { openSplitViewTabKey, openSplitViewTabsFrom } from '../src/index.mjs';

describe('openSplitViewTabKey', () => {
  test('is one key per tab', () => {
    assert.deepStrictEqual(openSplitViewTabKey(42), 'splitViewOpenTab:42');
  });
});

describe('openSplitViewTabsFrom', () => {
  test('collects every tab from its own key', () => {
    assert.deepStrictEqual(
      openSplitViewTabsFrom({
        [openSplitViewTabKey(1)]: 'a',
        [openSplitViewTabKey(2)]: 'b',
      }),
      { '1': 'a', '2': 'b' },
    );
  });

  test('ignores the other keys in session storage, and a value that is not an id', () => {
    assert.deepStrictEqual(
      openSplitViewTabsFrom({
        splitViewTabId: 7,
        splitViewEventLog: [],
        [openSplitViewTabKey(3)]: 'c',
        [openSplitViewTabKey(4)]: 4,
      }),
      { '3': 'c' },
    );
  });

  test('is empty when nothing is recorded', () => {
    assert.deepStrictEqual(openSplitViewTabsFrom({}), {});
  });
});
