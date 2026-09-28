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
        // `isRecord` rejects an array, so dropping it on the cast's word
        // would turn `false` into `true`.
        name: 'keeps isRecord for an array cast to a record',
        code: dedent`
          declare const arr: string[];
          const ok = Object.hasOwn(arr as unknown as Record<string, unknown>, '0');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const arr: string[];
          const ok = (isRecord(arr as unknown as Record<string, unknown>) && hasKey(arr as unknown as Record<string, unknown>, '0'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
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
        name: 'reads `!` on an optional record as the record it asserts',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>> | undefined;
          const ok = Object.hasOwn(obj!, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-std-forge';
          declare const obj: Readonly<Record<string, unknown>> | undefined;
          const ok = hasKey(obj!, 'a');
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
        name: 'keeps the parentheses of a sequence object in `in`',
        code: dedent`
          declare const a: number;
          declare const o: unknown;
          const ok = 'k' in (a, o);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const a: number;
          declare const o: unknown;
          const ok = (isRecord((a, o)) && hasKey((a, o), 'k'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps the parentheses of a sequence object in Object.hasOwn',
        code: dedent`
          declare const a: number;
          declare const o: unknown;
          const ok = Object.hasOwn((a, o), 'k');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-std-forge';
          declare const a: number;
          declare const o: unknown;
          const ok = (isRecord((a, o)) && hasKey((a, o), 'k'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
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
