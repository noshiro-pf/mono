// `focus-visible.css` after Blueprint's style sheet, as the README has an app
// import it: a focus ring for the keyboard only.
import '@blueprintjs/core/lib/css/blueprint.css';
import { Button, Checkbox } from 'blueprint-synstate';
import { constant } from 'synstate-dom';
import { userEvent } from 'vitest/browser';
// By path: its specifier, `blueprint-synstate/focus-visible.css`, would resolve
// through this package's test alias for `blueprint-synstate`, which points at
// the barrel.
// eslint-disable-next-line import-x/no-internal-modules -- the sheet itself, by path
import '../../css/focus-visible.css';
import { mountInto, one } from './helpers.mjs';

describe('focus-visible.css', () => {
  test('draws no ring on a button clicked, and one on a button tabbed to', async () => {
    const { container, unmount } = mountInto(() => (
      <Button text={constant('Save')} />
    ));

    try {
      const button = one<HTMLButtonElement>(container, 'button');

      await userEvent.click(button);

      assert.strictEqual(document.activeElement, button);

      assert.strictEqual(getComputedStyle(button).outlineStyle, 'none');

      button.blur();

      await userEvent.tab();

      assert.strictEqual(document.activeElement, button);

      assert.notStrictEqual(getComputedStyle(button).outlineStyle, 'none');
    } finally {
      unmount();
    }
  });

  test('draws no ring on the indicator of a checkbox clicked, and one tabbed to', async () => {
    const { container, unmount } = mountInto(() => (
      <>
        <Button text={constant('Before')} />
        <Checkbox
          checked={constant(false)}
          label={constant('Done')}
          onChange={() => {}}
        />
      </>
    ));

    try {
      const input = one<HTMLInputElement>(container, 'input');

      const indicator = one(container, '.bp6-control-indicator');

      // Focus moved after a press, by the press or by script, is not keyboard
      // focus.
      await userEvent.click(one(container, 'label'));

      input.focus();

      assert.strictEqual(document.activeElement, input);

      assert.strictEqual(getComputedStyle(indicator).outlineStyle, 'none');

      await userEvent.click(one(container, 'button'));

      await userEvent.tab();

      assert.strictEqual(document.activeElement, input);

      assert.notStrictEqual(getComputedStyle(indicator).outlineStyle, 'none');
    } finally {
      unmount();
    }
  });

  test('leaves the ring inside .bp6-focus-style-manager-ignore, as Blueprint does', async () => {
    const { container, unmount } = mountInto(() => (
      <div class={constant('bp6-focus-style-manager-ignore')}>
        <Button text={constant('Save')} />
        <Checkbox
          checked={constant(false)}
          label={constant('Done')}
          onChange={() => {}}
        />
      </div>
    ));

    try {
      const button = one<HTMLButtonElement>(container, 'button');

      await userEvent.click(button);

      assert.strictEqual(document.activeElement, button);

      assert.notStrictEqual(getComputedStyle(button).outlineStyle, 'none');

      await userEvent.click(one(container, 'label'));

      one<HTMLInputElement>(container, 'input').focus();

      assert.notStrictEqual(
        getComputedStyle(one(container, '.bp6-control-indicator')).outlineStyle,
        'none',
      );
    } finally {
      unmount();
    }
  });
});
