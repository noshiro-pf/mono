// DateRangePicker and DateRangeInput beside Blueprint React's, driven alike:
// what each asks the app for, and what each draws as it goes.
import '@blueprintjs/core/lib/css/blueprint.css';
import * as BlueprintDatetime from '@blueprintjs/datetime';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import {
  DateRangeInput,
  DateRangePicker,
  formatDateText,
  parseDateText,
  wallClockOf,
  type Boundary,
  type DayRange,
} from 'blueprint-synstate';
import { createElement as h, useState, type ReactElement } from 'react';
import { createState } from 'synstate';
import { constant, render } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import { userEvent } from 'vitest/browser';
import { mountBlueprint } from './blueprint-cases.js';
import {
  all,
  dayButton,
  fixNow,
  one,
  pick,
  settle,
  transitioned,
} from './helpers.mjs';
import { stage } from './stage.mjs';

describe('DateRangePicker beside Blueprint React', () => {
  test('starts, finishes, moves and clears a range, drawing the hovered range', async () => {
    fixNow();

    const steps = [
      ['hover', 5],
      ['hover', 12],
      ['click', 12],
      ['hover', 8],
      ['hover', 20],
      ['click', 20],
      ['hover', 16],
      ['click', 12],
      ['hover', 3],
      ['click', 3],
      ['click', 3],
    ] as const;

    const [blueprint, synstate] = await bothRun(
      theirPicker({ initial: ['', ''] }),
      ourPicker({ initial: ['', ''] }),
      onDays(steps),
    );

    assert.deepStrictEqual(synstate, blueprint);

    // Pressing an end takes it away.
    assert.include(blueprint, 'change 2026-10-12..2026-10-20 → ..2026-10-20');
  });

  test('allows one day for a range only when asked', async () => {
    fixNow();

    const steps = [
      ['click', 9],
      ['hover', 9],
      ['click', 9],
    ] as const;

    for (const allowSingleDayRange of [false, true]) {
      // eslint-disable-next-line no-await-in-loop -- one after the other, on one stage each
      const [blueprint, synstate] = await bothRun(
        theirPicker({ initial: ['', ''], allowSingleDayRange }),
        ourPicker({ initial: ['', ''], allowSingleDayRange }),
        onDays(steps),
      );

      assert.deepStrictEqual(synstate, blueprint);
    }
  });

  test('changes only the end it is given', async () => {
    fixNow();

    const steps = [
      ['hover', 22],
      ['click', 22],
      ['hover', 4],
      ['click', 4],
      ['hover', 26],
    ] as const;

    for (const boundary of ['start', 'end'] as const) {
      // eslint-disable-next-line no-await-in-loop -- one after the other, on one stage each
      const [blueprint, synstate] = await bothRun(
        theirPicker({ initial: ['2026-10-10', '2026-10-18'], boundary }),
        ourPicker({ initial: ['2026-10-10', '2026-10-18'], boundary }),
        onDays(steps),
      );

      assert.deepStrictEqual(synstate, blueprint);
    }
  });
});

describe(DateRangePicker, () => {
  test('keeps the month shown within the range as a year is picked', async () => {
    fixNow();

    const host = stage();

    const unmount = render(
      () => (
        <DateRangePicker
          maxDate={'2027-04-03'}
          value={constant(['', ''] as const)}
          onChange={() => {}}
        />
      ),
      host,
    );

    const [month, year] = all<HTMLSelectElement>(host, 'select');

    try {
      assert.isDefined(month);

      assert.isDefined(year);

      assert.strictEqual(`${month.value}/${year.value}`, '9/2026');

      pick(year, '2027');

      await settle();

      assert.strictEqual(`${month.value}/${year.value}`, '3/2027');
    } finally {
      unmount();

      host.remove();
    }
  });

  test('heads the weekdays with the names given', () => {
    fixNow();

    const host = stage();

    const unmount = render(
      () => (
        <DateRangePicker
          locale={'ja'}
          value={constant(['', ''] as const)}
          weekdayNames={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
          onChange={() => {}}
        />
      ),
      host,
    );

    try {
      const heads = all(host, 'th.rdp-head_cell');

      assert.deepStrictEqual(
        heads.map((th) => th.textContent),
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      );

      assert.strictEqual(heads[0]?.getAttribute('aria-label'), '日曜日');
    } finally {
      unmount();

      host.remove();
    }
  });

  test('keeps the month shown when the value comes again with the same days', async () => {
    fixNow();

    const [range$, setRange] = createState<DayRange>([
      '2026-10-05',
      '2026-12-10',
    ]);

    const host = stage();

    const unmount = render(
      () => <DateRangePicker value={range$} onChange={setRange} />,
      host,
    );

    const shown = (): string =>
      all<HTMLSelectElement>(host, 'select')
        .map((select) => select.value)
        .join('/');

    try {
      assert.strictEqual(shown(), '9/2026');

      one<HTMLButtonElement>(host, 'button[name="next-month"]').click();

      await settle();

      assert.strictEqual(shown(), '10/2026');

      setRange(['2026-10-05', '2026-12-10']);

      await settle();

      assert.strictEqual(shown(), '10/2026');
    } finally {
      unmount();

      host.remove();
    }
  });
});

describe(DateRangeInput, () => {
  test('passes the weekday heads on to its calendar', async () => {
    fixNow();

    const host = stage();

    const unmount = render(
      () => (
        <DateRangeInput
          value={constant(['', ''] as const)}
          weekdayNames={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
          onChange={() => {}}
        />
      ),
      host,
    );

    try {
      const [start] = all(host, '.bp6-date-range-input input');

      assert.isDefined(start);

      await userEvent.click(start);

      await settle();

      assert.deepStrictEqual(
        all(host, 'th.rdp-head_cell').map((th) => th.textContent),
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      );
    } finally {
      unmount();

      host.remove();
    }
  });
});

describe('DateRangeInput, Escape elsewhere', () => {
  test('closes the calendar and drops what the pointer showed', async () => {
    fixNow();

    const host = stage();

    const unmount = render(
      () => (
        <DateRangeInput
          maxDate={RANGE.maxDate}
          minDate={RANGE.minDate}
          value={constant(['', ''] as const)}
          onChange={() => {}}
        />
      ),
      host,
    );

    try {
      const [start] = all<HTMLInputElement>(
        host,
        '.bp6-date-range-input input',
      );

      assert.isDefined(start);

      await userEvent.click(start);

      await settle();

      await userEvent.hover(dayButton(host, 12));

      assert.strictEqual(start.value, '2026/10/12');

      start.blur();

      assert.strictEqual(document.activeElement, document.body);

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );

      await settle();

      assert.strictEqual(all(host, '.bp6-date-range-input-popover').length, 0);

      assert.strictEqual(start.value, '');

      assert.strictEqual(document.activeElement, document.body);
    } finally {
      unmount();

      host.remove();
    }
  });
});

describe('DateRangeInput beside Blueprint React', () => {
  test('picks both ends on the calendar, the fields following the pointer', async () => {
    fixNow();

    const [blueprint, synstate] = await bothRun(
      theirInput({ initial: ['', ''] }),
      ourInput({ initial: ['', ''] }),
      onInput([
        ['click', 'start'],
        ['hover', 12],
        ['day', 12],
        ['hover', 18],
        ['hover', 9],
        ['hover', 18],
        ['day', 18],
        ['click', 'start'],
        ['hover', 15],
        ['day', 15],
        ['keys', '{Escape}'],
        ['click', 'end'],
        ['hover', 25],
        ['day', 25],
        ['keys', '{Escape}'],
        ['click', 'start'],
        ['hover', 27],
        ['day', 20],
      ]),
    );

    assert.deepStrictEqual(synstate, blueprint);
  });

  test('takes days typed, and moves between the fields and out by the keys', async () => {
    fixNow();

    const [blueprint, synstate] = await bothRun(
      theirInput({ initial: ['', ''] }),
      ourInput({ initial: ['', ''] }),
      onInput([
        ['click', 'start'],
        ['keys', '2026/10/03'],
        ['keys', '{Tab}'],
        ['keys', '2026/10/0'],
        ['keys', '1'],
        ['keys', '{Backspace}9'],
        ['keys', '{Enter}'],
        ['click', 'start'],
        ['keys', '{Control>}a{/Control}'],
        ['keys', '{ArrowRight}'],
        ['keys', '{ArrowDown}'],
        ['keys', '{ArrowDown}'],
        ['keys', '{Tab}'],
        ['keys', '{Control>}a{/Control}'],
        ['keys', '{ArrowLeft}'],
        ['keys', '{Shift>}{Tab}{/Shift}'],
        ['keys', '{Escape}'],
        ['click', 'end'],
        ['keys', '{Tab}'],
      ]),
    );

    assert.deepStrictEqual(synstate, blueprint);
  });

  test('draws an end before the start, and days out of range, as errors', async () => {
    fixNow();

    const [blueprint, synstate] = await bothRun(
      theirInput({
        initial: ['2026-10-20', '2026-10-10'],
        maxDate: '2026-11-15',
      }),
      ourInput({
        initial: ['2026-10-20', '2026-10-10'],
        maxDate: '2026-11-15',
      }),
      onInput([
        ['click', 'end'],
        ['keys', '{Control>}a{/Control}{Backspace}'],
        ['keys', '2026/12/01'],
        ['keys', '{Escape}'],
        ['click', 'end'],
        ['keys', '{Control>}a{/Control}2026/10/1'],
        ['keys', '{Escape}'],
        ['click', 'start'],
        ['keys', '{Control>}a{/Control}nonsense'],
        ['keys', '{Escape}'],
      ]),
    );

    assert.deepStrictEqual(synstate, blueprint);
  });

  test('gives the focus back to the field as Escape in the calendar closes it', async () => {
    fixNow();

    const [blueprint, synstate] = await bothRun(
      theirInput({ initial: ['', ''] }),
      ourInput({ initial: ['', ''] }),
      onInput([
        ['click', 'start'],
        ['day', 12],
        ['keys', '{Escape}'],
        ['wait'],
        ['click', 'start'],
      ]),
    );

    // Pressed, the field has the calendar open on both sides.
    assert.strictEqual(synstate.at(-1), blueprint.at(-1));

    assert.deepStrictEqual(
      Arr.skipLast(synstate, 3),
      Arr.skipLast(blueprint, 3),
    );

    // Blueprint's gives it back once the popover has finished closing, which
    // opens it again; this library's keeps it closed, as its DateInput does.
    assert.deepStrictEqual(blueprint.slice(-3, -1), [
      'keys {Escape}: 2026/10/12|Start date |End date closed',
      'wait: 2026/10/12|2020/01/01* |End date open 12*[]',
    ]);

    assert.deepStrictEqual(synstate.slice(-3, -1), [
      'keys {Escape}: 2026/10/12|2020/01/01* |End date closed',
      'wait: 2026/10/12|2020/01/01* |End date closed',
    ]);
  });

  test('takes nothing on Enter for text that reads as no date', async () => {
    fixNow();

    // Blueprint's passes on an invalid Date (see the README).
    const [, synstate] = await bothRun(
      theirInput({ initial: ['2026-10-20', ''] }),
      ourInput({ initial: ['2026-10-20', ''] }),
      onInput([
        ['click', 'start'],
        ['keys', '{Control>}a{/Control}nonsense{Enter}'],
      ]),
    );

    assert.deepStrictEqual(synstate, [
      'click start: 2026/10/20|2020/01/01* |End date open 20*[]',
      'keys {Control>}a{/Control}nonsense{Enter}: nonsense|2020/01/01!* |End date open 20*[]',
    ]);
  });
});

type InputSetup = Readonly<{
  initial: DayRange;
  maxDate?: string;
}>;

type InputStep =
  | readonly [action: 'click', field: Boundary]
  | readonly [action: 'day' | 'hover', day: number]
  | readonly [action: 'keys', keys: string]
  | readonly [action: 'wait'];

/** The popover open on the page, wherever it is drawn. */
const popover = (): HTMLElement =>
  one(document.body, '.bp6-date-range-input-popover');

/** The days of the month shown that carry a range class, with those classes. */
const rangeDrawn = (host: HTMLElement): string =>
  all(host, 'button.rdp-day:not(.rdp-day_outside)')
    .map((button) => {
      const marks = rangeClasses
        .filter(([name]) => button.classList.contains(name))
        .map(([, mark]) => mark)
        .join('');

      return marks === '' ? '' : `${button.textContent}${marks}`;
    })
    .filter((day) => day !== '')
    .join(' ');

/**
 * Each field's text and placeholder, `!` for an error and `*` for the focus,
 * and whether the calendar is open, with the range it draws.
 */
const inputDrawn = (host: HTMLElement): string => {
  const target = one(host, '.bp6-date-range-input');

  const fields = all<HTMLInputElement>(target, 'input').map(
    (input) =>
      `${input.value}|${input.placeholder}${input.parentElement?.classList.contains('bp6-intent-danger') === true ? '!' : ''}${document.activeElement === input ? '*' : ''}`,
  );

  return target.getAttribute('aria-expanded') === 'true'
    ? `${fields.join(' ')} open ${rangeDrawn(popover())}`
    : `${fields.join(' ')} closed`;
};

/** Does `steps` to the input, logging what it draws after each. */
const onInput =
  (steps: readonly InputStep[]): Steps =>
  (host, log) =>
    steps.reduce(async (before, step) => {
      await before;

      switch (step[0]) {
        case 'click':
          await userEvent.click(
            all(host, '.bp6-date-range-input input')[
              step[1] === 'start' ? 0 : 1
            ] ?? host,
          );

          // Blueprint's popover, closing, may still be on the page.
          await transitioned();

          break;

        case 'day':
          await userEvent.click(dayButton(popover(), step[1]));

          break;

        case 'hover':
          await userEvent.hover(dayButton(popover(), step[1]));

          break;

        case 'keys':
          await userEvent.keyboard(step[1]);

          break;

        case 'wait':
          // Off the calendar, so that one opened again is not under the
          // pointer; then for Blueprint's popover to finish closing.
          await userEvent.hover(one(host, '.bp6-date-range-input'));

          await transitioned();

          break;
      }

      await settle();

      log(`${step.join(' ')}: ${inputDrawn(host)}`);
    }, Promise.resolve());

const RANGE = { minDate: '2020-01-01', maxDate: '2030-12-31' } as const;

const showRange = ([start, end]: DayRange): string =>
  `${start}..${end}` as const;

const blueprintDayOf = (day: string): Date => new Date(`${day}T00:00`);

/** Blueprint's value for a day, or `null` for none. */
const blueprintDay = (day: string): Date | null =>
  day === '' ? null : blueprintDayOf(day);

/** `YYYY-MM-DD` of a date Blueprint gives, in local time, or `''`. */
const dayOf = (date: Date | null): string =>
  date === null
    ? ''
    : Number.isNaN(date.getTime())
      ? 'invalid'
      : [
          date.getFullYear().toString(),
          (date.getMonth() + 1).toString().padStart(2, '0'),
          date.getDate().toString().padStart(2, '0'),
        ].join('-');

const theirInput =
  ({ initial, maxDate = RANGE.maxDate }: InputSetup): Mount =>
  (host, log) => {
    const Input = (): ReactElement => {
      const [range, setRange] = useState(initial);

      return h(BlueprintDatetime.DateRangeInput, {
        value: [blueprintDay(range[0]), blueprintDay(range[1])],
        singleMonthOnly: true,
        shortcuts: false,
        minDate: blueprintDayOf(RANGE.minDate),
        maxDate: blueprintDayOf(maxDate),
        formatDate: (date) => formatDateText(wallClockOf(date), undefined),
        parseDate: (text) => {
          const clock = parseDateText(text, undefined);

          return Optional.isSome(clock)
            ? blueprintDayOf(
                `${clock.value.year.toString().padStart(4, '0')}-${clock.value.month.toString().padStart(2, '0')}-${clock.value.day.toString().padStart(2, '0')}`,
              )
            : new Date(Number.NaN);
        },
        onChange: ([start, end]) => {
          const next = [dayOf(start), dayOf(end)] as const;

          log(`change ${showRange(range)} → ${showRange(next)}`);

          setRange(next);
        },
      });
    };

    return mountBlueprint(() => h(Input), host);
  };

const ourInput =
  ({ initial, maxDate = RANGE.maxDate }: InputSetup): Mount =>
  (host, log) => {
    const [range$, setRange] = createState(initial);

    return render(
      () => (
        <DateRangeInput
          maxDate={maxDate}
          minDate={RANGE.minDate}
          value={range$}
          onChange={(next) => {
            log(
              `change ${showRange(range$.getSnapshot().value)} → ${showRange(next)}`,
            );

            setRange(next);
          }}
        />
      ),
      host,
    );
  };

type PickerSetup = Readonly<{
  initial: DayRange;
  allowSingleDayRange?: boolean;
  boundary?: Boundary;
}>;

/** Mounts a side on `host`; what it asks the app for goes to `log`. */
type Mount = (on: HTMLElement, log: (entry: string) => void) => () => void;

/** What the test does to a side once mounted. */
type Steps = (on: HTMLElement, log: (entry: string) => void) => Promise<void>;

type Step = readonly [action: 'click' | 'hover', day: number];

/** Does `steps` to the calendar, logging what it draws after each. */
const onDays =
  (steps: readonly Step[]): Steps =>
  (host, log) =>
    steps.reduce(async (before, [action, day]) => {
      await before;

      await (action === 'click'
        ? userEvent.click(dayButton(host, day))
        : userEvent.hover(dayButton(host, day)));

      await settle();

      log(`${action} ${day.toString()}: ${rangeDrawn(host)}`);
    }, Promise.resolve());

/**
 * Mounts each side on its own stage, does `steps` to it, and returns the two
 * logs, Blueprint's first.
 */
const bothRun = async (
  mountTheirs: Mount,
  mountOurs: Mount,
  steps: Steps,
): Promise<readonly [theirs: readonly string[], ours: readonly string[]]> => {
  const run = async (mount: Mount): Promise<readonly string[]> => {
    const host = stage();

    // Blueprint's target is narrower for a moment as it opens; drawn from the
    // left, the calendar does not move under the pointer as it widens.
    host.style.setProperty('justify-content', 'flex-start');

    const mut_log: string[] = [];

    const log = (entry: string): void => {
      mut_log.push(entry);
    };

    const unmount = mount(host, log);

    try {
      await settle();

      await steps(host, log);
    } finally {
      unmount();

      host.remove();
    }

    return mut_log;
  };

  const theirs = await run(mountTheirs);

  const ours = await run(mountOurs);

  return [theirs, ours];
};

/** The classes of a day that show the range, and the mark each is logged as. */
const rangeClasses = [
  ['rdp-day_selected', '*'],
  ['rdp-day_range_start', '['],
  ['rdp-day_range_middle', '-'],
  ['rdp-day_range_end', ']'],
  ['rdp-day_hovered', '~'],
  ['rdp-day_hovered_start', '<'],
  ['rdp-day_hovered_end', '>'],
] as const;

const theirPicker =
  ({ initial, allowSingleDayRange, boundary }: PickerSetup): Mount =>
  (host, log) => {
    const Picker = (): ReactElement => {
      const [range, setRange] = useState(initial);

      return h(BlueprintDatetime.DateRangePicker, {
        value: [blueprintDay(range[0]), blueprintDay(range[1])],
        singleMonthOnly: true,
        shortcuts: false,
        ...(allowSingleDayRange === undefined ? {} : { allowSingleDayRange }),
        ...(boundary === undefined ? {} : { boundaryToModify: boundary }),
        onChange: ([start, end]) => {
          const next = [dayOf(start), dayOf(end)] as const;

          log(`change ${showRange(range)} → ${showRange(next)}`);

          setRange(next);
        },
      });
    };

    return mountBlueprint(() => h(Picker), host);
  };

const ourPicker =
  ({ initial, allowSingleDayRange, boundary }: PickerSetup): Mount =>
  (host, log) => {
    const [range$, setRange] = createState(initial);

    return render(
      () => (
        <DateRangePicker
          {...(allowSingleDayRange === undefined
            ? {}
            : { allowSingleDayRange })}
          {...(boundary === undefined
            ? {}
            : { boundaryToModify: constant(boundary) })}
          value={range$}
          onChange={(next) => {
            log(
              `change ${showRange(range$.getSnapshot().value)} → ${showRange(next)}`,
            );

            setRange(next);
          }}
        />
      ),
      host,
    );
  };
