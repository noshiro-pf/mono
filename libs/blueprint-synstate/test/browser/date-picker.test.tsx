import { DatePicker } from 'blueprint-synstate';
import {
  all,
  controlled,
  dayButton,
  fixNow,
  mountInto,
  one,
  pick,
  press,
  settle,
} from './helpers.mjs';

const RANGE = { minDate: '2020-01-01', maxDate: '2030-12-31' } as const;

describe(DatePicker, () => {
  test('draws Blueprint’s markup for the month of the value', () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09T08:30');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        {...RANGE}
        locale={'ja'}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    const month = one<HTMLSelectElement>(
      container,
      '.bp6-datepicker-month-select select[name="months"]',
    );

    const year = one<HTMLSelectElement>(
      container,
      '.bp6-datepicker-year-select select[name="years"]',
    );

    assert.strictEqual(month.value, '9');

    assert.strictEqual(month.options[9]?.textContent, '10月');

    assert.strictEqual(year.value, '2026');

    assert.deepStrictEqual(
      [year.options[0]?.value, Array.from(year.options).at(-1)?.value],
      ['2020', '2030'],
    );

    assert.strictEqual(
      one(container, '.rdp-caption_label').textContent,
      '2026年10月',
    );

    assert.deepStrictEqual(
      all(container, 'th.rdp-head_cell').map((th) => th.textContent),
      ['日', '月', '火', '水', '木', '金', '土'],
    );

    assert.strictEqual(all(container, 'tr.rdp-row').length, 5);

    assert.strictEqual(all(container, 'button.rdp-day_outside').length, 4);

    const selected = one<HTMLButtonElement>(container, '.rdp-day_selected');

    assert.strictEqual(selected.textContent, '9');

    assert.strictEqual(selected.getAttribute('aria-selected'), 'true');

    assert.strictEqual(selected.tabIndex, 0);

    assert.strictEqual(
      all(container, 'button.rdp-day').filter((b) => b.tabIndex === 0).length,
      1,
    );

    assert.strictEqual(one(container, '.rdp-day_today').textContent, '23');

    assert.strictEqual(
      one<HTMLInputElement>(container, 'input.bp6-timepicker-hour').value,
      '8',
    );

    assert.strictEqual(
      one<HTMLInputElement>(container, 'input.bp6-timepicker-minute').value,
      '30',
    );

    unmount();
  });

  test('picking a day keeps the time, and picking it again clears it', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2026-10-09T08:30');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        {...RANGE}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    dayButton(container, 15).click();

    await settle();

    assert.deepStrictEqual(changes, ['2026-10-15T08:30']);

    assert.strictEqual(one(container, '.rdp-day_selected').textContent, '15');

    dayButton(container, 15).click();

    assert.deepStrictEqual(changes, ['2026-10-15T08:30', '']);

    assert.strictEqual(all(container, '.rdp-day_selected').length, 0);

    unmount();
  });

  test('picking a day of the month before shows that month', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09');

    const { container, unmount } = mountInto(() => (
      <DatePicker {...RANGE} value={value$} onChange={onChange} />
    ));

    const [outside] = all<HTMLButtonElement>(
      container,
      'button.rdp-day_outside',
    );

    assert.strictEqual(outside?.textContent, '27');

    outside?.click();

    await settle();

    assert.strictEqual(value$.getSnapshot().value, '2026-09-27');

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '8',
    );

    assert.strictEqual(one(container, '.rdp-day_selected').textContent, '27');

    unmount();
  });

  test('changing the month moves the value to the same day, the last if shorter', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2026-01-31T09:00');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        {...RANGE}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    one<HTMLButtonElement>(container, 'button[name="next-month"]').click();

    await settle();

    assert.deepStrictEqual(changes, ['2026-02-28T09:00']);

    one<HTMLButtonElement>(container, 'button[name="next-month"]').click();

    await settle();

    // The day the value was last picked on, the 31st, is kept for March.
    assert.strictEqual(changes.at(-1), '2026-03-28T09:00');

    pick(one<HTMLSelectElement>(container, 'select[name="years"]'), '2028');

    await settle();

    assert.strictEqual(changes.at(-1), '2028-03-28T09:00');

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="years"]').value,
      '2028',
    );

    pick(one<HTMLSelectElement>(container, 'select[name="months"]'), '6');

    await settle();

    assert.strictEqual(changes.at(-1), '2028-07-28T09:00');

    unmount();
  });

  test('without a value, changing the month only shows it', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DatePicker {...RANGE} value={value$} onChange={onChange} />
    ));

    // Today's month, with today the day in the tab order.
    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '9',
    );

    assert.strictEqual(dayButton(container, 23).tabIndex, 0);

    one<HTMLButtonElement>(container, 'button[name="previous-month"]').click();

    await settle();

    assert.deepStrictEqual(changes, []);

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '8',
    );

    // No selected day or today in September: the first day takes the tab.
    assert.strictEqual(dayButton(container, 1).tabIndex, 0);

    unmount();
  });

  test('follows a value changed from outside', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09');

    const { container, unmount } = mountInto(() => (
      <DatePicker {...RANGE} value={value$} onChange={onChange} />
    ));

    onChange('2029-04-01');

    await settle();

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="years"]').value,
      '2029',
    );

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '3',
    );

    assert.strictEqual(one(container, '.rdp-day_selected').textContent, '1');

    unmount();
  });

  test('offers only the days and months in range', () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        maxDate={'2026-12-20'}
        minDate={'2026-10-05'}
        value={value$}
        onChange={onChange}
      />
    ));

    assert.isTrue(
      one<HTMLButtonElement>(container, 'button[name="previous-month"]')
        .disabled,
    );

    assert.isFalse(
      one<HTMLButtonElement>(container, 'button[name="next-month"]').disabled,
    );

    assert.isTrue(dayButton(container, 4).disabled);

    assert.isTrue(
      dayButton(container, 4).classList.contains('rdp-day_disabled'),
    );

    assert.isFalse(dayButton(container, 5).disabled);

    assert.deepStrictEqual(
      Array.from(
        one<HTMLSelectElement>(container, 'select[name="months"]').options,
        (option) => option.value,
      ),
      ['9', '10', '11'],
    );

    unmount();
  });

  test('the actions bar sets today and clears', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2027-02-03T10:00');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        {...RANGE}
        clearButtonText={'クリア'}
        showActionsBar
        timePrecision={'minute'}
        todayButtonText={'今日'}
        value={value$}
        onChange={onChange}
      />
    ));

    const [today, clear] = all<HTMLButtonElement>(
      container,
      '.bp6-datepicker-footer button',
    );

    assert.strictEqual(today?.textContent, '今日');

    assert.strictEqual(clear?.textContent, 'クリア');

    today?.click();

    await settle();

    assert.deepStrictEqual(changes, ['2026-10-23T14:05']);

    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '9',
    );

    clear?.click();

    assert.deepStrictEqual(changes, ['2026-10-23T14:05', '']);

    unmount();
  });

  test('a time set without a date is today’s', () => {
    fixNow();

    const { value$, onChange, changes } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DatePicker
        {...RANGE}
        timePickerProps={{ showArrowButtons: true }}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    one<HTMLElement>(
      container,
      '.bp6-timepicker-arrow-row:first-child .bp6-timepicker-hour',
    ).click();

    assert.deepStrictEqual(changes, ['2026-10-23T01:00']);

    unmount();
  });

  test('the arrow keys move the focus, leaving the month as they go', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2026-10-30');

    const { container, unmount } = mountInto(() => (
      <DatePicker {...RANGE} value={value$} onChange={onChange} />
    ));

    dayButton(container, 30).focus();

    assert.isFalse(press(dayButton(container, 30), 'ArrowRight'));

    await settle();

    assert.strictEqual(document.activeElement, dayButton(container, 31));

    assert.strictEqual(dayButton(container, 31).tabIndex, 0);

    assert.strictEqual(dayButton(container, 30).tabIndex, -1);

    assert.deepStrictEqual(changes, []);

    press(dayButton(container, 31), 'ArrowRight');

    await settle();

    // November is shown, and the value moves with the month, as Blueprint
    // moves it.
    assert.strictEqual(
      one<HTMLSelectElement>(container, 'select[name="months"]').value,
      '10',
    );

    assert.strictEqual(document.activeElement, dayButton(container, 1));

    assert.deepStrictEqual(changes, ['2026-11-30']);

    press(dayButton(container, 1), 'End');

    await settle();

    assert.strictEqual(document.activeElement, dayButton(container, 7));

    unmount();
  });
});
