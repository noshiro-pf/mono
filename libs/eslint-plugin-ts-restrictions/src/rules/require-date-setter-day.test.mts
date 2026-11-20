import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { requireDateSetterDay } from './require-date-setter-day.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

const missingDay = 'missingDay';

const missingMonthAndDay = 'missingMonthAndDay';

describe('require-date-setter-day', () => {
  tester.run('require-date-setter-day', requireDateSetterDay, {
    valid: [
      {
        name: 'setMonth with the day',
        code: dedent`
          declare const d: Date;
          d.setMonth(1, 28);
          d.setUTCMonth(1, 28);
        `,
      },
      {
        name: 'setFullYear with the month and day',
        code: dedent`
          declare const d: Date;
          d.setFullYear(2026, 1, 28);
          d.setUTCFullYear(2026, 1, 28);
        `,
      },
      {
        name: 'a spread may pass every argument',
        code: dedent`
          declare const d: Date;
          declare const ymd: readonly [number, number, number];
          declare const md: readonly [number, number];
          d.setFullYear(...ymd);
          d.setMonth(...md);
          d.setFullYear(2026, ...md);
        `,
      },
      {
        name: 'another object with a setMonth method',
        code: dedent`
          declare const calendar: {
            setMonth: (month: number) => void;
            setFullYear: (year: number) => void;
          };
          calendar.setMonth(1);
          calendar.setFullYear(2026);
        `,
      },
      {
        name: 'the other setters of a Date',
        code: dedent`
          declare const d: Date;
          d.setDate(1);
          d.setHours(0);
          d.setTime(0);
        `,
      },
      {
        name: 'apply with an array it cannot count',
        code: dedent`
          declare const d: Date;
          declare const args: readonly [number];
          Date.prototype.setMonth.apply(d, args);
        `,
      },
      {
        name: 'call with every argument',
        code: dedent`
          declare const d: Date;
          Date.prototype.setFullYear.call(d, 2026, 1, 28);
        `,
      },
    ],
    invalid: [
      {
        name: 'setMonth and setUTCMonth without the day',
        code: dedent`
          declare const d: Date;
          d.setMonth(1);
          d.setUTCMonth(1);
        `,
        errors: [
          { messageId: missingDay, data: { method: 'setMonth' } },
          { messageId: missingDay, data: { method: 'setUTCMonth' } },
        ],
      },
      {
        name: 'setFullYear with one or two arguments',
        code: dedent`
          declare const d: Date;
          d.setFullYear(2026);
          d.setFullYear(2026, 1);
          d.setUTCFullYear(2026);
        `,
        errors: [
          { messageId: missingMonthAndDay, data: { method: 'setFullYear' } },
          { messageId: missingMonthAndDay, data: { method: 'setFullYear' } },
          {
            messageId: missingMonthAndDay,
            data: { method: 'setUTCFullYear' },
          },
        ],
      },
      {
        name: 'stacked type wrappers around the callee',
        code: dedent`
          declare const d: Date | undefined;
          type F = (month: number) => number;
          (d!.setMonth as unknown as F)(1);
          ((d as Date).setMonth satisfies F)(1);
          (<F>d!.setMonth)(1);
        `,
        errors: [
          { messageId: missingDay },
          { messageId: missingDay },
          { messageId: missingDay },
        ],
      },
      {
        name: 'a string-literal and a template-literal key',
        code: dedent`
          declare const d: Date;
          d['setMonth'](1);
          d[\`setFullYear\`](2026);
        `,
        errors: [{ messageId: missingDay }, { messageId: missingMonthAndDay }],
      },
      {
        name: 'an optional call',
        code: dedent`
          declare const d: Date | undefined;
          d?.setMonth(1);
        `,
        errors: [{ messageId: missingDay }],
      },
      {
        name: 'a subclass of Date',
        code: dedent`
          class Day extends Date {}
          declare const d: Day;
          d.setMonth(1);
        `,
        errors: [{ messageId: missingDay }],
      },
      {
        name: 'Date.prototype.setMonth.call and .apply',
        code: dedent`
          declare const d: Date;
          Date.prototype.setMonth.call(d, 1);
          Date.prototype.setFullYear.apply(d, [2026, 1]);
          d.setUTCMonth.call(d, 1);
        `,
        errors: [
          { messageId: missingDay, data: { method: 'setMonth' } },
          { messageId: missingMonthAndDay, data: { method: 'setFullYear' } },
          { messageId: missingDay, data: { method: 'setUTCMonth' } },
        ],
      },
    ],
  });
});
