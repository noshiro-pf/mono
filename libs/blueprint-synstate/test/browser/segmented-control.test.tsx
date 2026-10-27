import { SegmentedControl } from 'blueprint-synstate';
import { constant } from 'synstate-dom';
import { all, controlled, mountInto, one, press } from './helpers.mjs';

describe(SegmentedControl, () => {
  const options = [
    { value: 'light', label: 'Light', icon: 'flash' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'desktop' },
  ] as const;

  test('draws one radio per option, the chosen one solid and in the tab order', () => {
    const { value$, onChange } = controlled('dark');

    const { container, unmount } = mountInto(() => (
      <SegmentedControl
        aria-label={constant('Theme')}
        intent={'primary'}
        options={options}
        value={value$}
        onValueChange={onChange}
      />
    ));

    const group = one(container, '.bp6-segmented-control');

    assert.strictEqual(group.getAttribute('role'), 'radiogroup');

    assert.strictEqual(group.getAttribute('aria-label'), 'Theme');

    const buttons = all<HTMLButtonElement>(group, 'button');

    assert.deepStrictEqual(
      buttons.map((b) => [
        b.textContent,
        b.getAttribute('role'),
        b.getAttribute('aria-checked'),
        b.tabIndex,
        b.classList.contains('bp6-minimal'),
      ]),
      [
        ['Light', 'radio', 'false', -1, true],
        ['Dark', 'radio', 'true', 0, false],
        ['System', 'radio', 'false', -1, true],
      ],
    );

    unmount();
  });

  test('a click and the arrow keys choose, wrapping round', () => {
    const { value$, onChange, changes } = controlled('light');

    const { container, unmount } = mountInto(() => (
      <SegmentedControl
        options={options}
        value={value$}
        onValueChange={onChange}
      />
    ));

    const buttons = all<HTMLButtonElement>(container, 'button');

    buttons[2]?.click();

    assert.deepStrictEqual(changes, ['system']);

    buttons[2]?.focus();

    assert.isFalse(press(buttons[2] ?? container, 'ArrowRight'));

    assert.deepStrictEqual(changes, ['system', 'light']);

    assert.strictEqual(document.activeElement, buttons[0]);

    press(buttons[0] ?? container, 'ArrowUp');

    assert.deepStrictEqual(changes, ['system', 'light', 'system']);

    assert.isTrue(buttons[2]?.classList.contains('bp6-minimal') === false);

    unmount();
  });
});
