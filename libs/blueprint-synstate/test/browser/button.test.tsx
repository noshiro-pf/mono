import { Button, ButtonGroup, Icon } from 'blueprint-synstate';
import { createState, map } from 'synstate';
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

    const [active$, setActive] = createState(false);

    const [disabled$, setDisabled] = createState(false);

    const { container, unmount } = mountInto(() => (
      <Button
        active={active$}
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

    setActive(true);

    assert.isTrue(button.classList.contains('bp6-active'));

    setDisabled(true);

    assert.isTrue(button.disabled);

    assert.isTrue(button.classList.contains('bp6-disabled'));

    // Not drawn pressed while it cannot be pressed, as Blueprint's.
    assert.isFalse(button.classList.contains('bp6-active'));

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

  test('redraws an icon whose name changes', () => {
    const [open$, setOpen] = createState(true);

    const { container, unmount } = mountInto(() => (
      <Button
        aria-label={constant('Labels')}
        endIcon={open$.pipe(
          map((open) => (open ? 'chevron-up' : 'chevron-down')),
        )}
        icon={open$.pipe(
          map((open) => (open ? 'double-chevron-up' : 'double-chevron-down')),
        )}
      />
    ));

    const [icon, endIcon] = Array.from(
      container.querySelectorAll(':scope button > .bp6-icon'),
    );

    assert.isTrue(
      icon?.classList.contains('bp6-icon-double-chevron-up') ?? false,
    );

    assert.isTrue(endIcon?.classList.contains('bp6-icon-chevron-up') ?? false);

    setOpen(false);

    assert.isTrue(
      icon?.classList.contains('bp6-icon-double-chevron-down') ?? false,
    );

    assert.isTrue(
      endIcon?.classList.contains('bp6-icon-chevron-down') ?? false,
    );

    assert.strictEqual(
      one<SVGSVGElement>(container, '.bp6-icon-double-chevron-down > svg')
        .dataset['icon'],
      'double-chevron-down',
    );

    unmount();
  });
});

describe(Icon, () => {
  test('draws the 20px drawing at 20px, not the 16px one scaled', () => {
    const { container, unmount } = mountInto(() => (
      <Icon icon={'eye-open'} size={20} />
    ));

    const svg = one<SVGSVGElement>(container, 'svg');

    assert.strictEqual(svg.getAttribute('width'), '20');

    assert.strictEqual(svg.getAttribute('height'), '20');

    assert.strictEqual(svg.getAttribute('viewBox'), '0 0 20 20');

    // The start of `@blueprintjs/icons`' 20px eye-open, which the 16px one does
    // not share.
    assert.isTrue(
      one(svg, 'path').getAttribute('d')?.startsWith('M10.01 7.984') ?? false,
    );

    unmount();
  });
});
