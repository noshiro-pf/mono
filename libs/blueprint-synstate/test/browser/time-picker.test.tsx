import { TimePicker } from 'blueprint-synstate';
import { all, controlled, mountInto, one, press, type } from './helpers.mjs';

describe(TimePicker, () => {
  test('draws Blueprint’s markup, the minute in two digits and the hour not', () => {
    const { value$, onChange } = controlled('09:05');

    const { container, unmount } = mountInto(() => (
      <TimePicker showArrowButtons value={value$} onChange={onChange} />
    ));

    const hour = one<HTMLInputElement>(container, 'input.bp6-timepicker-hour');

    const minute = one<HTMLInputElement>(
      container,
      'input.bp6-timepicker-minute',
    );

    assert.strictEqual(hour.value, '9');

    assert.strictEqual(minute.value, '05');

    assert.match(hour.id, /^hour24-input-\d+$/u);

    assert.strictEqual(hour.getAttribute('role'), 'spinbutton');

    assert.strictEqual(hour.getAttribute('aria-label'), 'hours (24hr clock)');

    const arrows = all(container, '.bp6-timepicker-arrow-button');

    assert.deepStrictEqual(
      arrows.map((arrow) => arrow.getAttribute('aria-label')),
      [
        'Increase hours (24hr clock)',
        'Increase minutes',
        'Decrease hours (24hr clock)',
        'Decrease minutes',
      ],
    );

    assert.strictEqual(arrows[0]?.getAttribute('aria-controls'), hour.id);

    assert.strictEqual(
      one(container, '.bp6-timepicker-divider-text').textContent,
      ':',
    );

    unmount();
  });

  test('the arrows step a unit round without carrying', () => {
    const { value$, onChange, changes } = controlled('23:59');

    const { container, unmount } = mountInto(() => (
      <TimePicker showArrowButtons value={value$} onChange={onChange} />
    ));

    const [increaseHours, increaseMinutes, decreaseHours] = all(
      container,
      '.bp6-timepicker-arrow-button',
    );

    increaseMinutes?.click();

    assert.deepStrictEqual(changes, ['23:00']);

    increaseHours?.click();

    assert.strictEqual(changes.at(-1), '00:00');

    decreaseHours?.click();

    assert.strictEqual(changes.at(-1), '23:00');

    unmount();
  });

  test('ArrowUp and ArrowDown step the field', () => {
    const { value$, onChange, changes } = controlled('10:30');

    const { container, unmount } = mountInto(() => (
      <TimePicker value={value$} onChange={onChange} />
    ));

    const minute = one<HTMLInputElement>(
      container,
      'input.bp6-timepicker-minute',
    );

    assert.isFalse(press(minute, 'ArrowUp'));

    assert.deepStrictEqual(changes, ['10:31']);

    press(minute, 'ArrowDown');

    assert.strictEqual(changes.at(-1), '10:30');

    // Without the arrows, the fields are no spinbuttons.
    assert.isNull(minute.getAttribute('role'));

    // The rows are there, empty, as in Blueprint's markup.
    assert.strictEqual(all(container, '.bp6-timepicker-arrow-row').length, 2);

    assert.strictEqual(
      all(container, '.bp6-timepicker-arrow-button').length,
      0,
    );

    unmount();
  });

  test('keys that an input method is composing with step nothing and keep the focus', () => {
    const { value$, onChange, changes } = controlled('10:30');

    const { container, unmount } = mountInto(() => (
      <TimePicker value={value$} onChange={onChange} />
    ));

    const minute = one<HTMLInputElement>(
      container,
      'input.bp6-timepicker-minute',
    );

    minute.focus();

    assert.isTrue(press(minute, 'ArrowUp', { isComposing: true }));

    // Safari's Enter that confirms a composition, after it has ended.
    assert.isTrue(press(minute, 'Enter', { keyCode: 229 }));

    assert.deepStrictEqual(changes, []);

    assert.strictEqual(document.activeElement, minute);

    unmount();
  });

  test('an arrow key with the key code of an input method steps, as Android’s virtual keyboard may send', () => {
    const { value$, onChange, changes } = controlled('10:30');

    const { container, unmount } = mountInto(() => (
      <TimePicker value={value$} onChange={onChange} />
    ));

    const minute = one<HTMLInputElement>(
      container,
      'input.bp6-timepicker-minute',
    );

    assert.isFalse(press(minute, 'ArrowUp', { keyCode: 229 }));

    assert.deepStrictEqual(changes, ['10:31']);

    unmount();
  });

  test('a typed number is read on blur, and anything else put back', () => {
    const { value$, onChange, changes } = controlled('10:30');

    const { container, unmount } = mountInto(() => (
      <TimePicker value={value$} onChange={onChange} />
    ));

    const hour = one<HTMLInputElement>(container, 'input.bp6-timepicker-hour');

    hour.focus();

    type(hour, '7');

    assert.deepStrictEqual(changes, []);

    hour.blur();

    assert.deepStrictEqual(changes, ['07:30']);

    assert.strictEqual(hour.value, '7');

    hour.focus();

    type(hour, '31');

    assert.isTrue(hour.classList.contains('bp6-intent-danger'));

    hour.blur();

    assert.deepStrictEqual(changes, ['07:30']);

    assert.strictEqual(hour.value, '7');

    assert.isFalse(hour.classList.contains('bp6-intent-danger'));

    unmount();
  });

  test('Enter reads the field', () => {
    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <TimePicker value={value$} onChange={onChange} />
    ));

    const minute = one<HTMLInputElement>(
      container,
      'input.bp6-timepicker-minute',
    );

    assert.strictEqual(minute.value, '00');

    minute.focus();

    type(minute, '45');

    press(minute, 'Enter');

    assert.deepStrictEqual(changes, ['00:45']);

    assert.strictEqual(minute.value, '45');

    unmount();
  });
});
