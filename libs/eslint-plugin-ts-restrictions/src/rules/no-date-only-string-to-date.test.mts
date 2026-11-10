import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noDateOnlyStringToDate } from './no-date-only-string-to-date.mjs';

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

const messageId = 'dateOnlyString';

const withDateUtils = [{ functions: ['DateUtils.from'] }] as const;

describe('no-date-only-string-to-date', () => {
  tester.run('no-date-only-string-to-date', noDateOnlyStringToDate, {
    valid: [
      { name: 'a time and zone', code: "new Date('2026-11-03T00:00:00Z');" },
      { name: 'a local time', code: "new Date('2026-11-03T00:00');" },
      {
        name: 'slashes, which V8 reads locally',
        code: "new Date('2026/11/03');",
      },
      {
        name: 'a sign with four digits is not the ISO form',
        code: "new Date('+2026-11-03');",
      },
      { name: 'five digits is not the ISO form', code: "new Date('20261');" },
      { name: 'a number', code: 'new Date(2026);' },
      {
        name: 'a template literal with a substitution',
        // eslint-disable-next-line no-template-curly-in-string -- the code linted
        code: 'new Date(`2026-11-${String(3)}`);',
      },
      {
        name: 'a date-only string passed through another call',
        code: "new Date(String('2026-11-03'));",
      },
      { name: 'not the first argument', code: "new Date(0, '2026-11-03');" },
      {
        name: 'the left of &&, which is never the result when it is a date',
        code: "declare const override: number;\nnew Date('2026-11-03' && override);",
      },
      { name: 'another function', code: "String('2026-11-03');" },
      {
        name: 'Date called without new, which ignores its argument',
        code: "Date('2026-11-03');",
      },
      { name: 'Date.UTC', code: "Date.UTC(Number('2026'));" },
      {
        name: 'a local `Date`, which is not the global',
        code: "class Date { constructor(_: string) {} }\nnew Date('2026-11-03');",
      },
      {
        name: 'a function not named in `functions`',
        code: "DateUtils.from('2026-11-03');",
      },
      {
        name: 'a named function given a full timestamp',
        code: "DateUtils.from('2026-11-03T00:00:00Z');",
        options: withDateUtils,
      },
      {
        name: 'a `string`, whatever it holds',
        code: 'declare const day: string;\nnew Date(day);',
      },
      {
        name: 'a union of full timestamps',
        code: "declare const at: '2026-11-03T00:00Z' | '2026-11-04T00:00Z';\nnew Date(at);",
      },
      {
        name: 'both branches full timestamps',
        code: "declare const ok: boolean;\nnew Date(ok ? '2026-11-03T00:00Z' : '2026-11-04T00:00Z');",
      },
      {
        name: 'a constructor not named in `functions`',
        code: "class LocalDate extends Date {}\nnew LocalDate('2026-11-03');",
      },
      {
        name: 'another member of a named object',
        code: "DateUtils.to('2026-11-03');",
        options: withDateUtils,
      },
      {
        name: 'new Date with several arguments reads numbers, not a string',
        code: "const year = '2026';\nnew Date(year, 10, 3);",
      },
      {
        name: 'new Date with a spread argument',
        code: "declare const parts: readonly ['2026-11-03'];\nnew Date(...parts);",
      },
      {
        name: 'globalThis.Date with several arguments',
        code: "new globalThis.Date('2026', 10, 3);",
      },
      {
        name: 'a template literal type, which is no literal',
        // eslint-disable-next-line no-template-curly-in-string -- the code linted
        code: 'declare const d: `${number}-01`;\nnew Date(d);',
      },
      {
        name: 'a template literal type behind a type parameter',
        // eslint-disable-next-line no-template-curly-in-string -- the code linted
        code: 'const f = <T extends `${number}-01`>(t: T) => new Date(t);',
      },
    ],
    invalid: [
      {
        name: 'Date.parse reads its first argument whatever follows',
        code: "(Date.parse as (s: string, x: number) => number)('2026-11-03', 1);",
        errors: [{ messageId, data: { callee: 'Date.parse' } }],
      },
      {
        name: 'a function named in options with several arguments',
        code: "DateUtils.from('2026-11-03', 'Asia/Tokyo');",
        options: withDateUtils,
        errors: [{ messageId, data: { callee: 'DateUtils.from' } }],
      },
      {
        name: 'new Date with one argument after a spread-free check',
        code: "const day = '2026-11-03';\nnew Date(day);",
        errors: [{ messageId, data: { callee: 'Date' } }],
      },
      {
        name: 'an indexed access on a type parameter',
        code: "const f = <T extends { day: '2026-11-03' }>(t: T) => new Date(t.day);",
        errors: [{ messageId, data: { callee: 'Date' } }],
      },
      {
        name: 'an indexed access type',
        code: "const f = <T extends { day: '2026-11-03' }>(d: T['day']) => new Date(d);",
        errors: [{ messageId, data: { callee: 'Date' } }],
      },
      {
        name: 'an indexed access with a generic key',
        code: "const f = <T extends Readonly<Record<string, '2026-11-03'>>, K extends string>(t: T, k: K) => new Date(t[k]);",
        errors: [{ messageId, data: { callee: 'Date' } }],
      },
      {
        name: 'a date',
        code: "new Date('2026-11-03');",
        errors: [{ messageId, data: { callee: 'Date' } }],
      },
      {
        name: 'a year and month',
        code: 'new Date("2026-11");',
        errors: [{ messageId }],
      },
      { name: 'a year', code: "new Date('2026');", errors: [{ messageId }] },
      {
        name: 'an expanded year',
        code: "new Date('+002026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a template literal with no substitution',
        code: 'new Date(`2026-11-03`);',
        errors: [{ messageId }],
      },
      {
        name: 'Date.parse',
        code: "Date.parse('2026-11-03');",
        errors: [{ messageId, data: { callee: 'Date.parse' } }],
      },
      {
        name: "Date['parse']",
        code: "Date['parse']('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'globalThis.Date',
        code: "new globalThis.Date('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'globalThis.Date.parse, optional',
        code: "globalThis.Date?.parse('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a parenthesized argument',
        code: "new Date(('2026-11-03'));",
        errors: [{ messageId }],
      },
      {
        name: 'a named function',
        code: "DateUtils.from('2026-11-03');",
        options: withDateUtils,
        errors: [{ messageId, data: { callee: 'DateUtils.from' } }],
      },
      {
        name: 'a const holding one',
        code: "const start = '2026-11-03';\nnew Date(start);",
        errors: [{ messageId }],
      },
      {
        name: 'a row of an as const table',
        code: "(['2026-11-03', '2026-11-04'] as const).map((day) => new Date(day));",
        errors: [{ messageId }],
      },
      {
        name: 'a union with a date-only member',
        code: "declare const day: '2026-11-03' | '2026-11-03T00:00Z';\nDate.parse(day);",
        errors: [{ messageId }],
      },
      {
        name: 'the fallback of ??, though the whole is a string',
        code: "declare const day: string | undefined;\nnew Date(day ?? '2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a branch of ?:',
        code: "declare const ok: boolean;\ndeclare const day: string;\nnew Date(ok ? day : '2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a branded literal',
        code: "declare const day: '2026-11-03' & { readonly brand: 1 };\nnew Date(day);",
        errors: [{ messageId }],
      },
      {
        name: 'a type parameter constrained to one',
        code: "export const f = <T extends '2026-11-03'>(day: T): Date => new Date(day);",
        errors: [{ messageId }],
      },
      {
        name: 'the right of &&',
        code: "declare const ok: boolean;\nnew Date(ok && '2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'Date.parse under ?. in parentheses',
        code: "(Date?.parse)('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a template literal key',
        code: "Date[`parse`]('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'globalThis with a template literal key',
        code: "new globalThis[`Date`]('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'an optional chain around the object of parse',
        code: "(globalThis?.Date).parse('2026-11-03');",
        errors: [{ messageId }],
      },
      {
        name: 'a named constructor',
        code: "class LocalDate extends Date {}\nnew LocalDate('2026-11-03');",
        options: [{ functions: ['LocalDate'] }],
        errors: [{ messageId, data: { callee: 'LocalDate' } }],
      },
      {
        name: 'a named plain function',
        code: "parseDay('2026-11-03');",
        options: [{ functions: ['parseDay'] }],
        errors: [{ messageId }],
      },
    ],
  });

  describe('through type wrappers', () => {
    tester.run('no-date-only-string-to-date', noDateOnlyStringToDate, {
      valid: [],
      invalid: [
        {
          name: 'the argument under as, satisfies, ! and <T>',
          code: "new Date((<string>'2026-11-03' as string satisfies string)!);",
          errors: [{ messageId }],
        },
        {
          name: 'the constructor under as',
          code: "new (Date as DateConstructor)('2026-11-03');",
          errors: [{ messageId }],
        },
        {
          name: 'the object of parse under satisfies and !',
          code: "(globalThis.Date! satisfies DateConstructor).parse('2026-11-03');",
          errors: [{ messageId }],
        },
        {
          name: 'the callee under as',
          code: "(Date.parse as (s: string) => number)('2026-11-03' as const);",
          errors: [{ messageId }],
        },
        {
          name: 'a named function under wrappers',
          code: "(DateUtils as typeof DateUtils).from!(<string>'2026-11-03');",
          options: withDateUtils,
          errors: [{ messageId }],
        },
      ],
    });
  });
});
