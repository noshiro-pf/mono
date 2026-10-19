import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('prefer-is-record-and-has-key', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        name: 'ignores other Object methods',
        code: dedent`
          const obj = { a: 1 };
          const keys = Object.keys(obj);
        `,
      },
      {
        name: 'ignores hasOwn with the wrong number of arguments',
        code: dedent`
          const obj = { a: 1 };
          const ok = Object.hasOwn(obj);
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites Object.hasOwn on an unknown object, keeping isRecord',
        code: dedent`
          declare const obj: unknown;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const obj: unknown;
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'drops isRecord when the object already has a string index signature',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'rewrites `key in obj` too',
        code: dedent`
          declare const obj: Record<string, number>;
          const ok = 'a' in obj;
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Record<string, number>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
    ],
  });
});

describe('prefer-is-record-and-has-key through type wrappers', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [],
    invalid: [
      {
        name: 'keeps isRecord for an unknown value cast to a record in `in`',
        code: dedent`
          declare const u: unknown;
          const ok = 'a' in (<Record<string, unknown>>u);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const u: unknown;
          const ok = (isRecord(<Record<string, unknown>>u) && hasKey(<Record<string, unknown>>u, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'drops isRecord for a record behind `satisfies` and keeps the wrapper',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj satisfies object, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj satisfies object, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        // `Object.hasOwn(undefined, 'a')` throws; `isRecord` answers false.
        name: 'keeps isRecord for `!` on an optional record, which leaves undefined in place',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>> | undefined;
          const ok = Object.hasOwn(obj!, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>> | undefined;
          const ok = (isRecord(obj!) && hasKey(obj!, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'drops isRecord for a record that is a record at every layer',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj! as Readonly<Record<string, unknown>>, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj! as Readonly<Record<string, unknown>>, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'reads `Object` through `as`',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = (Object as ObjectConstructor).hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
    ],
  });
});

describe('prefer-is-record-and-has-key with parenthesized operands', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [],
    invalid: [
      {
        name: 'a sequence object in `in`, read twice by the fix, gets no fix',
        code: dedent`
          declare const a: number;
          declare const o: unknown;
          const ok = 'k' in (a, o);
        `,
        output: null,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'a sequence object in Object.hasOwn, read twice by the fix, gets no fix',
        code: dedent`
          declare const a: number;
          declare const o: unknown;
          const ok = Object.hasOwn((a, o), 'k');
        `,
        output: null,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps the parentheses of a sequence object read once',
        code: dedent`
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = 'k' in (a, o);
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = hasKey((a, o), 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'keeps the parentheses of a sequence key',
        code: dedent`
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = (a, 'k') in o;
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = hasKey(o, (a, 'k'));
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
    ],
  });
});

describe('prefer-is-record-and-has-key where the rewrite would change behavior', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        // `isRecord` rejects an array, so `'0' in xs` would turn false.
        name: 'an array',
        code: dedent`
          declare const xs: readonly number[];
          const a = '0' in xs;
          const b = Object.hasOwn(xs, 'length');
        `,
      },
      {
        name: 'a union with an array',
        code: dedent`
          declare const v: Readonly<Record<string, unknown>> | readonly number[];
          const ok = 'k' in v;
        `,
      },
      {
        name: 'an array cast to a record',
        code: dedent`
          declare const arr: readonly string[];
          const ok = Object.hasOwn(arr as unknown as Record<string, unknown>, '0');
        `,
      },
      {
        name: 'a record widened by `as` to one that may be an array: the author says it may be one',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj as Readonly<Record<string, unknown>> | readonly string[], 'a');
        `,
      },
    ],
    invalid: [
      {
        // `isRecord(…) && hasKey(…)` would evaluate the object twice.
        name: 'an object with side effects is reported without a fix',
        code: dedent`
          declare const getObj: () => object;
          declare const log: () => void;
          declare const o: object;
          const a = 'k' in getObj();
          const b = Object.hasOwn(getObj(), 'k');
          const c = 'k' in (log(), o);
        `,
        output: null,
        errors: [
          { messageId: 'useIsRecordAndHasKey' },
          { messageId: 'useIsRecordAndHasKey' },
          { messageId: 'useIsRecordAndHasKey' },
        ],
      },
      {
        name: 'an object with side effects is fixed when isRecord is dropped: it is read once',
        code: dedent`
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = 'k' in getRec();
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = hasKey(getRec(), 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a reference read through type wrappers is still read without side effects',
        code: dedent`
          declare const o: { readonly p: object };
          const ok = 'k' in (o.p satisfies object);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const o: { readonly p: object };
          const ok = (isRecord(o.p satisfies object) && hasKey(o.p satisfies object, 'k'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
    ],
  });
});
