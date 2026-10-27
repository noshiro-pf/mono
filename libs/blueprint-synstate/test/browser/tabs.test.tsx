import { Tabs } from 'blueprint-synstate';
import { constant } from 'synstate-dom';
import { all, controlled, mountInto, one, press } from './helpers.mjs';

describe(Tabs, () => {
  const tabs = [
    {
      id: 'a',
      title: 'A',
      panel: <p>{constant('panel A')}</p>,
      'data-e2e': 'tab-a',
    },
    { id: 'b', title: 'B', panel: <p>{constant('panel B')}</p> },
    { id: 'c', title: 'C', panel: <p>{constant('panel C')}</p> },
  ] as const;

  test('draws the titles and the chosen panel alone, linked by their ids', () => {
    const { value$, onChange } = controlled('b');

    const { container, unmount } = mountInto(() => (
      <Tabs
        aria-label={constant('Sheets')}
        id={'sheets'}
        selectedTabId={value$}
        tabs={tabs}
        onChange={onChange}
      />
    ));

    const list = one(container, '.bp6-tabs > .bp6-tab-list');

    assert.strictEqual(list.getAttribute('role'), 'tablist');

    const titles = all(list, '.bp6-tab');

    assert.deepStrictEqual(
      titles.map((t) => [
        t.textContent,
        t.getAttribute('aria-selected'),
        t.tabIndex,
      ]),
      [
        ['A', 'false', -1],
        ['B', 'true', 0],
        ['C', 'false', -1],
      ],
    );

    assert.strictEqual(titles[0]?.dataset['e2e'], 'tab-a');

    const panel = one(container, '.bp6-tab-panel');

    assert.strictEqual(panel.textContent, 'panel B');

    assert.strictEqual(panel.getAttribute('role'), 'tabpanel');

    assert.strictEqual(panel.getAttribute('aria-labelledby'), titles[1]?.id);

    assert.strictEqual(titles[1]?.getAttribute('aria-controls'), panel.id);

    unmount();
  });

  test('a click chooses; the arrows move the focus, Enter chooses', () => {
    const { value$, onChange, changes } = controlled('a');

    const { container, unmount } = mountInto(() => (
      <Tabs
        id={'sheets'}
        selectedTabId={value$}
        tabs={tabs}
        onChange={onChange}
      />
    ));

    const titles = all(container, '.bp6-tab');

    titles[1]?.click();

    assert.deepStrictEqual(changes, ['b']);

    assert.strictEqual(one(container, '.bp6-tab-panel').textContent, 'panel B');

    titles[1]?.focus();

    press(titles[1] ?? container, 'ArrowRight');

    assert.strictEqual(document.activeElement, titles[2]);

    press(titles[2] ?? container, 'ArrowRight');

    assert.strictEqual(document.activeElement, titles[0]);

    assert.deepStrictEqual(changes, ['b']);

    press(titles[0] ?? container, 'Enter');

    assert.deepStrictEqual(changes, ['b', 'a']);

    assert.strictEqual(one(container, '.bp6-tab-panel').textContent, 'panel A');

    unmount();
  });
});
