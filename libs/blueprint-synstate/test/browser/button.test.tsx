import { Button, ButtonGroup } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { mountInto, one } from './helpers.mjs';

describe(Button, () => {
  test('draws Blueprint’s markup: the icon, the text in its span, the classes', () => {
    const { container, unmount } = mountInto(() => (
      <Button
        class={'extra'}
        icon={'plus'}
        intent={'primary'}
        size={'small'}
        text={constant('Add')}
      />
    ));

    const button = one<HTMLButtonElement>(container, 'button');

    assert.strictEqual(button.type, 'button');

    assert.deepStrictEqual(
      Array.from(button.classList).toSorted(),
      ['bp6-button', 'bp6-intent-primary', 'bp6-small', 'extra'].toSorted(),
    );

    assert.deepStrictEqual(
      Array.from(button.children, (child) => child.className),
      ['bp6-icon bp6-icon-plus', 'bp6-button-text'],
    );

    assert.strictEqual(button.textContent, 'Add');

    unmount();
  });

  test('follows the variant, `active` and `disabled` as they change', () => {
    const [variant$, setVariant] = createState<
      'minimal' | 'outlined' | 'solid'
    >('solid');

    const [disabled$, setDisabled] = createState(false);

    const { container, unmount } = mountInto(() => (
      <Button
        active={disabled$}
        disabled={disabled$}
        text={constant('Go')}
        variant={variant$}
      />
    ));

    const button = one<HTMLButtonElement>(container, 'button');

    assert.isFalse(button.classList.contains('bp6-minimal'));

    setVariant('minimal');

    assert.isTrue(button.classList.contains('bp6-minimal'));

    setVariant('outlined');

    assert.isFalse(button.classList.contains('bp6-minimal'));

    assert.isTrue(button.classList.contains('bp6-outlined'));

    setDisabled(true);

    assert.isTrue(button.disabled);

    assert.isTrue(button.classList.contains('bp6-disabled'));

    assert.isTrue(button.classList.contains('bp6-active'));

    unmount();
  });

  test('calls `onClick`', () => {
    let mut_clicks = 0;

    const { container, unmount } = mountInto(() => (
      <ButtonGroup>
        <Button
          text={constant('Go')}
          onClick={() => {
            mut_clicks += 1;
          }}
        />
      </ButtonGroup>
    ));

    one(container, '.bp6-button-group > button').click();

    assert.strictEqual(mut_clicks, 1);

    unmount();
  });
});
