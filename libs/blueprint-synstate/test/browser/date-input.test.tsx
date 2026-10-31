import { DateInput } from 'blueprint-synstate';
import {
  all,
  controlled,
  dayButton,
  fixNow,
  mountInto,
  one,
  press,
  settle,
  type,
} from './helpers.mjs';

const RANGE = { minDate: '2020-01-01', maxDate: '2030-12-31' } as const;

describe(DateInput, () => {
  test('shows the value formatted, and opens the calendar below on focus', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09T18:00');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        fill
        id={'due'}
        placeholder={'日時を選ぶ'}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input#due');

    assert.strictEqual(input.value, '2026/10/09 18:00');

    assert.strictEqual(input.placeholder, '日時を選ぶ');

    assert.strictEqual(input.getAttribute('aria-expanded'), 'false');

    assert.strictEqual(
      one(container, '.bp6-input-group').className,
      'bp6-input-group bp6-fill bp6-date-input bp6-popover-target',
    );

    assert.strictEqual(all(container, '.bp6-overlay').length, 0);

    input.focus();

    await settle();

    assert.strictEqual(input.getAttribute('aria-expanded'), 'true');

    assert.isTrue(
      one(container, '.bp6-input-group').classList.contains('bp6-popover-open'),
    );

    const popover = one(
      container,
      '.bp6-overlay.bp6-overlay-open.bp6-overlay-inline > .bp6-popover-transition-container > .bp6-popover.bp6-date-input-popover',
    );

    assert.isTrue(popover.classList.contains('bp6-popover-placement-bottom'));

    const dialog = one(popover, '.bp6-popover-content > div[role="dialog"]');

    assert.strictEqual(dialog.id, input.getAttribute('aria-controls'));

    assert.strictEqual(one(dialog, '.rdp-day_selected').textContent, '9');

    // Below the input, by half the arrow.
    const transition = one(container, '.bp6-popover-transition-container');

    assert.strictEqual(transition.style.position, 'fixed');

    assert.strictEqual(
      transition.style.top,
      `${input.getBoundingClientRect().bottom + 15}px`,
    );

    unmount();
  });

  test('takes typed text that reads as a date, and shows the value again on blur', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    type(input, '2026/1');

    assert.deepStrictEqual(changes, []);

    type(input, '2026/11/02 9:30');

    assert.deepStrictEqual(changes, ['2026-11-02T09:30']);

    // The typed text stays while focused.
    assert.strictEqual(input.value, '2026/11/02 9:30');

    await settle();

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '10',
    );

    input.blur();

    assert.strictEqual(input.value, '2026/11/02 09:30');

    input.focus();

    type(input, '');

    assert.strictEqual(changes.at(-1), '');

    unmount();
  });

  test.each([
    [true, 0],
    [false, 1],
  ] as const)(
    'picking a day with closeOnSelection %s leaves %i calendar open',
    async (closeOnSelection, open) => {
      fixNow();

      const { value$, onChange, changes } = controlled('2026-10-09T18:00');

      const { container, unmount } = mountInto(() => (
        <DateInput
          {...RANGE}
          closeOnSelection={closeOnSelection}
          timePrecision={'minute'}
          value={value$}
          onChange={onChange}
        />
      ));

      one<HTMLInputElement>(container, 'input').focus();

      await settle();

      dayButton(container, 12).click();

      await settle();

      assert.deepStrictEqual(changes, ['2026-10-12T18:00']);

      assert.strictEqual(all(container, '.bp6-overlay').length, open);

      unmount();
    },
  );

  test('a change of month or time keeps the calendar open', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09T18:00');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        timePickerProps={{ showArrowButtons: true }}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    one<HTMLInputElement>(container, 'input').focus();

    await settle();

    one<HTMLButtonElement>(container, 'button[name="next-month"]').click();

    await settle();

    assert.strictEqual(value$.getSnapshot().value, '2026-11-09T18:00');

    one(
      container,
      '.bp6-timepicker-arrow-row:first-child .bp6-timepicker-minute',
    ).click();

    await settle();

    assert.strictEqual(value$.getSnapshot().value, '2026-11-09T18:01');

    assert.strictEqual(all(container, '.bp6-overlay').length, 1);

    unmount();
  });

  test('Escape closes the calendar without reaching the page', async () => {
    fixNow();

    const { value$, onChange } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} value={value$} onChange={onChange} />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    assert.isFalse(press(input, 'Escape'));

    assert.strictEqual(all(container, '.bp6-overlay').length, 0);

    assert.notStrictEqual(document.activeElement, input);

    unmount();
  });

  test('a press outside closes it, and one inside does not', async () => {
    fixNow();

    const { value$, onChange } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} value={value$} onChange={onChange} />
    ));

    one<HTMLInputElement>(container, 'input').focus();

    await settle();

    one(container, '.rdp-table').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    assert.strictEqual(all(container, '.bp6-overlay').length, 1);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    assert.strictEqual(all(container, '.bp6-overlay').length, 0);

    unmount();
  });

  test('Tab goes into the calendar, and past its end back to the input, closing it', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} showActionsBar value={value$} onChange={onChange} />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    assert.isFalse(press(input, 'Tab'));

    assert.strictEqual(
      document.activeElement,
      one(container, 'select[name="months"]'),
    );

    const [start, end] = all(
      container,
      'div[role="dialog"] > div[tabindex="0"]',
    );

    assert.isDefined(end);

    assert.isDefined(start);

    // What Tab from the clear button, the last stop, would focus.
    end.dispatchEvent(
      new FocusEvent('focus', {
        relatedTarget: all(container, '.bp6-datepicker-footer button').at(-1),
      }),
    );

    assert.strictEqual(document.activeElement, input);

    assert.strictEqual(all(container, '.bp6-overlay').length, 0);

    unmount();
  });

  test('marks a value out of range as an error, but not while it is corrected', async () => {
    fixNow();

    const { value$, onChange } = controlled('2031-01-01T00:00');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        outOfRangeMessage={'範囲外'}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    const group = one(container, '.bp6-input-group');

    assert.strictEqual(input.value, '範囲外');

    assert.isTrue(group.classList.contains('bp6-intent-danger'));

    input.focus();

    await settle();

    type(input, '2031');

    assert.isFalse(group.classList.contains('bp6-intent-danger'));

    // The calendar is given no value for it.
    assert.strictEqual(all(container, '.rdp-day_selected').length, 0);

    unmount();
  });

  test('Enter takes the date typed, even out of range, as Blueprint does', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} value={value$} onChange={onChange} />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    type(input, '2031/3/4');

    assert.deepStrictEqual(changes, []);

    press(input, 'Enter');

    assert.deepStrictEqual(changes, ['2031-03-04']);

    assert.strictEqual(document.activeElement, input);

    input.blur();

    assert.strictEqual(input.value, 'Out of range');

    unmount();
  });

  test('the Enter or Escape that ends a composition of an input method takes nothing', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} value={value$} onChange={onChange} />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    type(input, '2031/3/4');

    press(input, 'Enter', { isComposing: true });

    // Safari's, after the composition has ended.
    press(input, 'Enter', { keyCode: 229 });

    // Safari's Escape that cancels a composition, which leaves the input.
    press(input, 'Escape', { keyCode: 229 });

    assert.strictEqual(document.activeElement, input);

    assert.deepStrictEqual(changes, []);

    unmount();
  });
});
