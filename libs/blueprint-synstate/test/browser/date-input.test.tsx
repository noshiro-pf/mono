import { DateInput } from 'blueprint-synstate';
import { render } from 'synstate-dom';
import { page, userEvent } from 'vitest/browser';
import {
  all,
  controlled,
  dayButton,
  fixNow,
  mountInto,
  nextFrame,
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

    // Below the input, by half the arrow, from its left edge, once Floating UI
    // has placed it.
    const transition = one(container, '.bp6-popover-transition-container');

    assert.strictEqual(transition.style.position, 'fixed');

    await nextFrame();

    const placed = transition.getBoundingClientRect();

    assert.closeTo(placed.top, input.getBoundingClientRect().bottom + 15, 1);

    assert.closeTo(
      placed.left,
      one(container, '.bp6-input-group').getBoundingClientRect().left,
      1,
    );

    unmount();
  });

  describe('where there is no room below', () => {
    test('opens above the field where there is room there', async () => {
      fixNow();

      await openAt(
        { top: window.innerHeight - 40 },
        ({ field, popover, placed }) => {
          assert.isTrue(
            popover.classList.contains('bp6-popover-placement-top'),
          );

          assert.closeTo(placed.bottom, field.top - 15, 1);
        },
      );
    });

    test('stays below where there is room on neither side', async () => {
      fixNow();

      const { innerWidth, innerHeight } = window;

      // Short enough that the calendar fits neither above nor below the field,
      // which has more room above, where it would overflow less.
      await page.viewport(innerWidth, 400);

      try {
        await openAt({ top: 230 }, ({ popover, placed }) => {
          // Taller than the room above the field, less the offset.
          assert.isAbove(placed.height, 230 - 15);

          assert.isTrue(
            popover.classList.contains('bp6-popover-placement-bottom'),
          );
        });
      } finally {
        await page.viewport(innerWidth, innerHeight);
      }
    });
  });

  test('moves left to stay in the viewport, the arrow still at the field', async () => {
    fixNow();

    // Not flush with the edge, where the popover's right edge would be the
    // field's either way.
    await openAt({ top: 0, right: 40 }, ({ field, placed, arrow }) => {
      assert.isAbove(placed.width, field.width + 40);

      assert.closeTo(placed.right, document.documentElement.clientWidth, 1);

      assert.closeTo(
        arrow.left + arrow.width / 2,
        field.left + field.width / 2,
        1,
      );
    });
  });

  test('is dark within a dark element', async () => {
    fixNow();

    await openAt({ top: 0, dark: true }, ({ popover }) => {
      assert.isTrue(popover.classList.contains('bp6-dark'));
    });
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

  test('a shortcut picks its value, and is drawn as picked when the calendar opens again', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2026-10-09T18:00');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        shortcuts={[
          { label: 'Today', value: '2026-10-23T23:59', includeTime: true },
          { label: 'Tomorrow', value: '2026-10-24T23:59', includeTime: true },
          { label: 'Too late', value: '2040-01-01T23:59', includeTime: true },
          { label: 'In a week', value: '2026-10-30T09:00' },
        ]}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    const items = (): readonly HTMLElement[] =>
      all(container, '.bp6-daterangepicker-shortcuts a.bp6-menu-item');

    assert.deepStrictEqual(
      items().map((item) => item.classList.contains('bp6-disabled')),
      [false, false, true, false],
    );

    // The time changes with it, so the calendar stays open.
    items()[1]?.click();

    await settle();

    assert.strictEqual(value$.getSnapshot().value, '2026-10-24T23:59');

    assert.strictEqual(all(container, '.bp6-overlay').length, 1);

    assert.deepStrictEqual(
      items().map((item) => item.classList.contains('bp6-active')),
      [false, true, false, false],
    );

    // One out of range is not taken.
    items()[2]?.click();

    await settle();

    // Without `includeTime`, the value's time is kept; with the month and the
    // time unchanged, it closes.
    items()[3]?.click();

    await settle();

    assert.deepStrictEqual(changes, ['2026-10-24T23:59', '2026-10-30T23:59']);

    assert.strictEqual(all(container, '.bp6-overlay').length, 0);

    input.blur();

    input.focus();

    await settle();

    assert.deepStrictEqual(
      items().map((item) => item.classList.contains('bp6-active')),
      [false, false, false, true],
    );

    unmount();
  });

  test('shortcuts given as a function are made again each time the calendar opens, and none are drawn for undefined', async () => {
    fixNow();

    const { value$, onChange } = controlled('');

    const mut_labels = ['Today'];

    const mut_none = { value: false };

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        shortcuts={() =>
          mut_none.value
            ? undefined
            : mut_labels.map((label) => ({ label, value: '2026-10-23T23:59' }))
        }
        value={value$}
        onChange={onChange}
      />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    const labels = (): readonly (string | null)[] =>
      all(container, '.bp6-daterangepicker-shortcuts a.bp6-menu-item').map(
        (item) => item.textContent,
      );

    input.focus();

    await settle();

    assert.deepStrictEqual(labels(), ['Today']);

    assert.isFalse(press(input, 'Escape'));

    await settle();

    // As a day passing while the page stays open would change them.
    mut_labels.splice(0, 1, 'Yesterday', 'Today');

    input.blur();

    input.focus();

    await settle();

    assert.deepStrictEqual(labels(), ['Yesterday', 'Today']);

    assert.isFalse(press(input, 'Escape'));

    await settle();

    // None at all that time, as on a narrow screen: no menu and no divider.
    mut_none.value = true;

    input.blur();

    input.focus();

    await settle();

    assert.isNull(container.querySelector('.bp6-daterangepicker-shortcuts'));

    assert.isNull(container.querySelector('.bp6-divider'));

    unmount();
  });

  test('passes the weekday heads on to its calendar', async () => {
    fixNow();

    const { value$, onChange } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        value={value$}
        weekdayNames={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
        onChange={onChange}
      />
    ));

    one<HTMLInputElement>(container, 'input').focus();

    await settle();

    assert.deepStrictEqual(
      all(container, 'th.rdp-head_cell').map((th) => th.textContent),
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    );

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

  test('works inside a modal dialog, and its Escape leaves the dialog open', async () => {
    fixNow();

    const { value$, onChange, changes } = controlled('2026-10-09');

    const dialog = document.createElement('dialog');

    document.body.append(dialog);

    const unmount = render(
      () => <DateInput {...RANGE} value={value$} onChange={onChange} />,
      dialog,
    );

    try {
      dialog.showModal();

      const input = one<HTMLInputElement>(dialog, 'input.bp6-input');

      input.focus();

      await settle();

      const popover = one(dialog, '.bp6-date-input-popover');

      // Drawn in the dialog, in the top layer with it: a press reaches it.
      await userEvent.click(dayButton(popover, 12));

      assert.deepStrictEqual(changes, ['2026-10-12']);

      input.click();

      await settle();

      dayButton(one(dialog, '.bp6-date-input-popover'), 12).focus();

      await userEvent.keyboard('{Escape}');

      await settle();

      assert.strictEqual(all(dialog, '.bp6-date-input-popover').length, 0);

      // Given back to the field, which does not open the calendar again.
      assert.strictEqual(document.activeElement, input);

      await settle();

      assert.strictEqual(all(dialog, '.bp6-date-input-popover').length, 0);

      assert.isTrue(dialog.open);
    } finally {
      unmount();

      dialog.remove();
    }
  });

  test('Escape elsewhere closes the calendar, leaving the focus where it is', async () => {
    fixNow();

    const { value$, onChange } = controlled('');

    const { container, unmount } = mountInto(() => (
      <DateInput {...RANGE} value={value$} onChange={onChange} />
    ));

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    // As a press on the calendar's text leaves it.
    input.blur();

    assert.strictEqual(document.activeElement, document.body);

    assert.strictEqual(all(container, '.bp6-date-input-popover').length, 1);

    assert.isFalse(press(document.body, 'Escape'));

    await settle();

    assert.strictEqual(all(container, '.bp6-date-input-popover').length, 0);

    assert.strictEqual(document.activeElement, document.body);

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

    // A press on the field is the field's.
    one(container, 'input').dispatchEvent(
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

  test('the Escape that cancels a composition in the time picker keeps the calendar open', async () => {
    fixNow();

    const { value$, onChange } = controlled('2026-10-09T18:00');

    const { container, unmount } = mountInto(() => (
      <DateInput
        {...RANGE}
        timePrecision={'minute'}
        value={value$}
        onChange={onChange}
      />
    ));

    one<HTMLInputElement>(container, 'input').focus();

    await settle();

    const hour = one<HTMLInputElement>(container, 'input.bp6-timepicker-hour');

    hour.focus();

    press(hour, 'Escape', { isComposing: true });

    // Safari's, after the composition has ended.
    press(hour, 'Escape', { keyCode: 229 });

    await settle();

    assert.strictEqual(all(container, '.bp6-overlay').length, 1);

    assert.strictEqual(document.activeElement, hour);

    unmount();
  });
});

/**
 * Mounts a `DateInput` whose field is at `at` in the viewport, opens it, and
 * once Floating UI has placed the calendar, runs `check` on where everything
 * went; unmounts it whatever `check` does, so that no calendar is left open
 * over the overlays of the tests after.
 */
const openAt = async (
  at: Readonly<{ top: number; right?: number; dark?: boolean }>,
  check: (
    placed: Readonly<{
      field: DOMRectReadOnly;
      popover: HTMLElement;
      placed: DOMRectReadOnly;
      arrow: DOMRectReadOnly;
    }>,
  ) => void,
): Promise<void> => {
  const { value$, onChange } = controlled('2026-10-09');

  const { container, unmount } = mountInto(() => (
    <DateInput {...RANGE} value={value$} onChange={onChange} />
  ));

  try {
    container.style.setProperty('position', 'fixed');

    container.style.setProperty('top', `${at.top.toString()}px`);

    if (at.right === undefined) {
      container.style.setProperty('left', '0px');
    } else {
      container.style.setProperty('right', `${at.right.toString()}px`);
    }

    if (at.dark === true) {
      container.classList.add('bp6-dark');
    }

    const input = one<HTMLInputElement>(container, 'input');

    input.focus();

    await settle();

    await nextFrame();

    check({
      field: one(container, '.bp6-input-group').getBoundingClientRect(),
      popover: one(container, '.bp6-date-input-popover'),
      placed: one(
        container,
        '.bp6-popover-transition-container',
      ).getBoundingClientRect(),
      arrow: one(container, '.bp6-popover-arrow').getBoundingClientRect(),
    });
  } finally {
    unmount();
  }
};
