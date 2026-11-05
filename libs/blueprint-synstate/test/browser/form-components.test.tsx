// Blueprint's style sheets lay out what is measured here: the right element of
// an input group is a positioned box only under them.
import '@blueprintjs/core/lib/css/blueprint.css';
import {
  AnchorButton,
  Button,
  FormGroup,
  InputGroup,
  Switch,
  TextArea,
} from 'blueprint-synstate';
import { createState, map } from 'synstate';
import { constant } from 'synstate-dom';
import { mountInto, nextFrame, one, press, settle } from './helpers.mjs';

describe(Button, () => {
  test('is disabled, with a spinner, while it is loading', () => {
    const [loading$, setLoading] = createState(true);

    const mut_clicks: string[] = [];

    const { container, unmount } = mountInto(() => (
      <Button
        loading={loading$}
        text={constant('Save')}
        onClick={() => {
          mut_clicks.push('click');
        }}
      />
    ));

    const button = one<HTMLButtonElement>(container, 'button');

    assert.isTrue(button.disabled);

    assert.isTrue(button.classList.contains('bp6-loading'));

    assert.isNotNull(button.querySelector('.bp6-button-spinner'));

    button.click();

    assert.deepStrictEqual(mut_clicks, []);

    setLoading(false);

    assert.isFalse(button.disabled);

    assert.isFalse(button.classList.contains('bp6-loading'));

    assert.isNull(button.querySelector('.bp6-button-spinner'));

    button.click();

    assert.deepStrictEqual(mut_clicks, ['click']);

    unmount();
  });

  test('is not drawn pressed while it is loading', () => {
    const [loading$, setLoading] = createState(true);

    const { container, unmount } = mountInto(() => (
      <Button active={constant(true)} loading={loading$} />
    ));

    const button = one(container, 'button');

    assert.isFalse(button.classList.contains('bp6-active'));

    setLoading(false);

    assert.isTrue(button.classList.contains('bp6-active'));

    unmount();
  });

  test('stays disabled once loading ends, when it is disabled', () => {
    const [loading$, setLoading] = createState(true);

    const { container, unmount } = mountInto(() => (
      <Button disabled={constant(true)} loading={loading$} />
    ));

    setLoading(false);

    assert.isTrue(one<HTMLButtonElement>(container, 'button').disabled);

    unmount();
  });
});

describe(AnchorButton, () => {
  test('leads nowhere, out of the tab order, while it is disabled', () => {
    const [disabled$, setDisabled] = createState(true);

    const { container, unmount } = mountInto(() => (
      <AnchorButton
        disabled={disabled$}
        href={constant('/answer/')}
        text={constant('Open')}
      />
    ));

    const anchor = one<HTMLAnchorElement>(container, 'a');

    assert.isFalse(anchor.hasAttribute('href'));

    assert.strictEqual(anchor.tabIndex, -1);

    assert.strictEqual(anchor.getAttribute('aria-disabled'), 'true');

    setDisabled(false);

    assert.strictEqual(anchor.getAttribute('href'), '/answer/');

    assert.strictEqual(anchor.tabIndex, 0);

    assert.strictEqual(anchor.getAttribute('aria-disabled'), 'false');

    unmount();
  });

  test('calls `onClick` only while it is enabled', () => {
    const [disabled$, setDisabled] = createState(true);

    const mut_clicks: string[] = [];

    const { container, unmount } = mountInto(() => (
      <AnchorButton
        disabled={disabled$}
        href={constant('#target')}
        onClick={() => {
          mut_clicks.push('click');
        }}
      />
    ));

    const anchor = one<HTMLAnchorElement>(container, 'a');

    anchor.click();

    assert.deepStrictEqual(mut_clicks, []);

    setDisabled(false);

    anchor.click();

    assert.deepStrictEqual(mut_clicks, ['click']);

    unmount();
  });

  test.each([' ', 'Enter'])('is pressed by %j on its release', (key) => {
    const mut_clicks: string[] = [];

    const { container, unmount } = mountInto(() => (
      <AnchorButton
        href={constant('#target')}
        onClick={(event) => {
          event.preventDefault();

          mut_clicks.push('click');
        }}
      />
    ));

    const anchor = one<HTMLAnchorElement>(container, 'a');

    const down = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(down);

    // Held back: Space would scroll the page, Enter click at once.
    assert.isTrue(down.defaultPrevented);

    assert.deepStrictEqual(mut_clicks, []);

    // Drawn pressed while the key is held.
    assert.isTrue(anchor.classList.contains('bp6-active'));

    anchor.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));

    assert.deepStrictEqual(mut_clicks, ['click']);

    assert.isFalse(anchor.classList.contains('bp6-active'));

    unmount();
  });

  test("leaves an input method's Enter alone", () => {
    const mut_clicks: string[] = [];

    const { container, unmount } = mountInto(() => (
      <AnchorButton
        href={constant('#target')}
        onClick={(event) => {
          event.preventDefault();

          mut_clicks.push('click');
        }}
      />
    ));

    const anchor = one<HTMLAnchorElement>(container, 'a');

    // The Enter that confirms a conversion, and Safari's after
    // `compositionend`.
    for (const init of [{ isComposing: true }, { keyCode: 229 }]) {
      assert.isTrue(press(anchor, 'Enter', init));

      anchor.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
      );
    }

    assert.isFalse(anchor.classList.contains('bp6-active'));

    assert.deepStrictEqual(mut_clicks, []);

    unmount();
  });

  test('leads nowhere while it is loading', () => {
    const [loading$, setLoading] = createState(true);

    const { container, unmount } = mountInto(() => (
      <AnchorButton href={constant('/answer/')} loading={loading$} />
    ));

    const anchor = one<HTMLAnchorElement>(container, 'a');

    assert.isFalse(anchor.hasAttribute('href'));

    setLoading(false);

    assert.strictEqual(anchor.getAttribute('href'), '/answer/');

    unmount();
  });
});

describe(FormGroup, () => {
  test('shows the helper text while there is one, in the intent it has then', () => {
    const [error$, setError] = createState<string | undefined>(undefined);

    const { container, unmount } = mountInto(() => (
      <FormGroup
        helperText={error$}
        intent={error$.pipe(
          map((error) =>
            error === undefined || error === '' ? 'none' : 'danger',
          ),
        )}
        label={constant('Name')}
      >
        <InputGroup value={constant('')} />
      </FormGroup>
    ));

    const group = one(container, '.bp6-form-group');

    assert.isNull(group.querySelector('.bp6-form-helper-text'));

    assert.isFalse(group.classList.contains('bp6-intent-danger'));

    setError('Enter a name.');

    assert.strictEqual(
      group.querySelector('.bp6-form-helper-text')?.textContent,
      'Enter a name.',
    );

    assert.isTrue(group.classList.contains('bp6-intent-danger'));

    setError('');

    assert.isNull(group.querySelector('.bp6-form-helper-text'));

    unmount();
  });
});

describe('FormGroup label', () => {
  test('is drawn only while it is not empty', () => {
    const [label$, setLabel] = createState('');

    const { container, unmount } = mountInto(() => (
      <FormGroup label={label$}>
        <InputGroup value={constant('')} />
      </FormGroup>
    ));

    assert.isNull(container.querySelector('label'));

    setLabel('Name');

    assert.strictEqual(one(container, 'label.bp6-label').textContent, 'Name ');

    unmount();
  });
});

describe(Switch, () => {
  test('passes `change` on, and follows `checked`', () => {
    const [checked$, setChecked] = createState(false);

    const { container, unmount } = mountInto(() => (
      <Switch
        aria-label={constant('Required')}
        checked={checked$}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
        }}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    assert.strictEqual(input.getAttribute('aria-label'), 'Required');

    input.click();

    assert.isTrue(checked$.getSnapshot().value);

    assert.isTrue(input.checked);

    setChecked(false);

    assert.isFalse(input.checked);

    unmount();
  });
});

describe(TextArea, () => {
  test('fits its text as it is typed, and as its value changes', async () => {
    const [value$, setValue] = createState('one');

    const { container, unmount } = mountInto(() => (
      <TextArea
        autoResize={true}
        value={value$}
        onInput={(e) => {
          setValue(e.currentTarget.value);
        }}
      />
    ));

    const mut_textarea = one<HTMLTextAreaElement>(container, 'textarea');

    await afterLayout();

    // Fitted once laid out: one line, less than the two rows a textarea has.
    assert.strictEqual(
      mut_textarea.style.height,
      `${mut_textarea.scrollHeight.toString()}px`,
    );

    const oneLine = mut_textarea.offsetHeight;

    mut_textarea.value = 'one\ntwo\nthree';

    mut_textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));

    assert.isAbove(mut_textarea.offsetHeight, oneLine);

    assert.strictEqual(mut_textarea.scrollHeight, mut_textarea.clientHeight);

    setValue('one');

    await settle();

    assert.strictEqual(mut_textarea.offsetHeight, oneLine);

    unmount();
  });

  test('fits a new value it is given, with no typing', async () => {
    const [value$, setValue] = createState('one');

    const { container, unmount } = mountInto(() => (
      <TextArea autoResize={true} value={value$} />
    ));

    const textarea = one<HTMLTextAreaElement>(container, 'textarea');

    await afterLayout();

    const oneLine = textarea.offsetHeight;

    setValue('one\ntwo\nthree');

    await settle();

    assert.isAbove(textarea.offsetHeight, oneLine);

    assert.strictEqual(textarea.scrollHeight, textarea.clientHeight);

    unmount();
  });

  test('passes `input` on without resizing when it is not asked to', () => {
    const mut_inputs: string[] = [];

    const { container, unmount } = mountInto(() => (
      <TextArea
        value={constant('')}
        onInput={(e) => {
          mut_inputs.push(e.currentTarget.value);
        }}
      />
    ));

    const mut_textarea = one<HTMLTextAreaElement>(container, 'textarea');

    mut_textarea.value = 'a';

    mut_textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));

    assert.deepStrictEqual(mut_inputs, ['a']);

    assert.strictEqual(mut_textarea.style.height, '');

    unmount();
  });
});

describe(InputGroup, () => {
  test('passes `blur` on whether or not the value changed', () => {
    const mut_blurs: string[] = [];

    const { container, unmount } = mountInto(() => (
      <InputGroup
        autoComplete={'current-password'}
        autoFocus={true}
        value={constant('')}
        onBlur={() => {
          mut_blurs.push('blur');
        }}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    assert.strictEqual(input.getAttribute('autocomplete'), 'current-password');

    assert.isTrue(input.hasAttribute('autofocus'));

    input.focus();

    input.blur();

    assert.deepStrictEqual(mut_blurs, ['blur']);

    unmount();
  });

  test('follows an intent and a type that change', () => {
    const [shown$, setShown] = createState(false);

    const { container, unmount } = mountInto(() => (
      <InputGroup
        intent={shown$.pipe(map((shown) => (shown ? 'danger' : 'primary')))}
        type={shown$.pipe(map((shown) => (shown ? 'text' : 'password')))}
        value={constant('secret')}
      />
    ));

    const group = one(container, '.bp6-input-group');

    const input = one<HTMLInputElement>(container, 'input');

    assert.isTrue(group.classList.contains('bp6-intent-primary'));

    assert.strictEqual(input.type, 'password');

    setShown(true);

    assert.isTrue(group.classList.contains('bp6-intent-danger'));

    assert.isFalse(group.classList.contains('bp6-intent-primary'));

    assert.strictEqual(input.type, 'text');

    unmount();
  });

  test('pads the input by the width its right element has', async () => {
    const [label$, setLabel] = createState('x');

    const { container, unmount } = mountInto(() => (
      <InputGroup
        rightElement={<Button text={label$} variant={constant('minimal')} />}
        value={constant('')}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    const action = one(container, '.bp6-input-action');

    await afterLayout();

    assert.strictEqual(input.style.paddingRight, `${action.clientWidth}px`);

    setLabel('a much longer label');

    await afterLayout();

    assert.strictEqual(input.style.paddingRight, `${action.clientWidth}px`);

    unmount();
  });
});

/**
 * Waits past the next layout, after which a `ResizeObserver` has been told:
 * a frame's callbacks run before its layout, so the one after it.
 */
const afterLayout = async (): Promise<void> => {
  await nextFrame();

  await nextFrame();
};
