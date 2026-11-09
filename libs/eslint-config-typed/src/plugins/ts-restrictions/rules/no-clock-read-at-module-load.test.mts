import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noClockReadAtModuleLoad } from './no-clock-read-at-module-load.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

const messageId = 'clockReadAtModuleLoad';

const withHelpers = [
  { functions: ['DateUtils.today', 'todayYearMonthDate'] },
] as const;

describe('no-clock-read-at-module-load', () => {
  tester.run('no-clock-read-at-module-load', noClockReadAtModuleLoad, {
    valid: [
      {
        name: 'in a function declaration',
        code: 'export function now(): number { return Date.now(); }',
      },
      {
        name: 'in an arrow function',
        code: 'export const today = (): Date => new Date();',
      },
      {
        name: 'in a method',
        code: 'export const clock = { now(): number { return Date.now(); } };',
      },
      {
        name: 'in a getter',
        code: 'export const clock = { get now(): number { return Date.now(); } };',
      },
      {
        name: 'a default parameter, read on each call',
        code: 'export const f = (at: number = Date.now()): number => at;',
      },
      {
        name: 'an instance field, read on each construction',
        code: 'export class Stamp { readonly at = Date.now(); }',
      },
      {
        name: 'a static field of a class made in a function',
        code: 'export const make = () => class { static at = Date.now(); };',
      },
      {
        name: 'a function passed along, not invoked here',
        code: 'export const later = [() => Date.now()];',
      },
      {
        name: '`new Date` with an argument reads no clock',
        code: "export const epoch = new Date(0);\nexport const day = new Date('2026-11-03T00:00:00Z');",
      },
      {
        name: 'Date.UTC',
        code: 'export const t = Date.UTC(2026, 10, 3);',
      },
      {
        name: 'a local `Date`, which is not the global',
        code: 'class Date { static now(): number { return 0; } }\nexport const t = Date.now();',
      },
      {
        name: 'a helper not named in `functions`',
        code: 'declare const DateUtils: { today: () => Date };\nexport const t = DateUtils.today();',
      },
      {
        name: 'a function wrapped in a type, not invoked',
        code: 'export const f = (() => Date.now()) as () => number;',
      },
      {
        name: 'a named helper inside a function',
        code: 'declare const DateUtils: { today: () => Date };\nexport const f = (): Date => DateUtils.today();',
        options: withHelpers,
      },
    ],
    invalid: [
      {
        name: 'Date.now() at the top level',
        code: 'export const t = Date.now();',
        errors: [{ messageId, data: { callee: 'Date.now' } }],
      },
      {
        name: '`new Date()` with no argument',
        code: 'export const d = new Date();',
        errors: [{ messageId, data: { callee: 'new Date' } }],
      },
      {
        name: '`new Date` with no parentheses',
        code: 'export const d = new Date;',
        errors: [{ messageId, data: { callee: 'new Date' } }],
      },
      {
        name: 'through globalThis',
        code: 'export const t = globalThis.Date.now();\nexport const d = new globalThis.Date();',
        errors: [
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'new Date' } },
        ],
      },
      {
        name: 'through type wrappers and an optional call',
        code: 'export const t = (Date as DateConstructor).now();\nexport const u = Date.now?.();\nexport const d = new (Date satisfies DateConstructor)();',
        errors: [
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'new Date' } },
        ],
      },
      {
        name: 'through `!` on the global',
        code: 'export const t = Date!.now();\nexport const d = new Date!();',
        errors: [
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'new Date' } },
        ],
      },
      {
        name: 'the whole read wrapped in a type',
        code: 'export const t = Date.now() satisfies number;',
        errors: [{ messageId, data: { callee: 'Date.now' } }],
      },
      {
        name: 'a function wrapped in a type, then invoked at once',
        code: 'export const t = ((() => Date.now()) as () => number)();',
        errors: [{ messageId, data: { callee: 'Date.now' } }],
      },
      {
        name: 'nested in a value built at load',
        code: 'export const initial = { title: "", ymd: [new Date()] } as const;',
        errors: [{ messageId, data: { callee: 'new Date' } }],
      },
      {
        name: 'in a function invoked at once',
        code: 'export const t = (() => Date.now())();\nexport const u = (function () { return new Date(); })();',
        errors: [
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'new Date' } },
        ],
      },
      {
        name: 'in a static field and a static block of a top-level class',
        code: 'export class Clock { static at = Date.now(); static { new Date(); } }',
        errors: [
          { messageId, data: { callee: 'Date.now' } },
          { messageId, data: { callee: 'new Date' } },
        ],
      },
      {
        name: 'helpers named in `functions`, called and constructed',
        code: 'declare const DateUtils: { today: () => Date };\ndeclare const todayYearMonthDate: () => unknown;\nexport const a = DateUtils.today();\nexport const b = todayYearMonthDate();',
        options: withHelpers,
        errors: [
          { messageId, data: { callee: 'DateUtils.today' } },
          { messageId, data: { callee: 'todayYearMonthDate' } },
        ],
      },
    ],
  });
});
