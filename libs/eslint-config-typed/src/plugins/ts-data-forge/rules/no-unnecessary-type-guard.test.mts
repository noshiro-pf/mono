import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noUnnecessaryTypeGuard } from './no-unnecessary-type-guard.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('no-unnecessary-type-guard', () => {
  tester.run('no-unnecessary-type-guard', noUnnecessaryTypeGuard, {
    valid: [
      {
        name: 'isNotUndefined on a type that includes undefined',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNotUndefined(x);
        `,
      },
      {
        name: 'isNonNullish on a type that includes both null and undefined',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string | null | undefined;
          const y = isNonNullish(x);
        `,
      },
      {
        name: 'isBoolean that actually narrows',
        code: dedent`
          import { isBoolean } from 'ts-data-forge';
          declare const x: boolean | string;
          const y = isBoolean(x);
        `,
      },
      {
        name: 'isNotBoolean that actually narrows',
        code: dedent`
          import { isNotBoolean } from 'ts-data-forge';
          declare const x: boolean | string;
          const y = isNotBoolean(x);
        `,
      },
      {
        name: 'isNonEmptyString on a plain string (real string/empty work)',
        code: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNonEmptyString(x);
        `,
      },
      {
        name: 'isNonEmptyString on a union that may be empty',
        code: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: 'a' | '';
          const y = isNonEmptyString(x);
        `,
      },
      {
        name: 'generic type parameter is treated conservatively',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          const f = <T,>(x: T) => isNotUndefined(x);
        `,
      },
      {
        name: 'any is treated conservatively',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: any;
          const y = isNonNullish(x);
        `,
      },
      {
        name: 'identifier not imported from ts-data-forge is ignored',
        code: dedent`
          const isNotUndefined = (u: unknown): boolean => u !== undefined;
          declare const x: string;
          const y = isNotUndefined(x);
        `,
      },
      {
        name: 'guard passed by reference (not called) is ignored',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const xs: readonly (string | undefined)[];
          const ys = xs.filter(isNotUndefined);
        `,
      },
      {
        name: 'ignore option disables a specific guard',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: string;
          const y = isNotUndefined(x);
        `,
        options: [{ ignore: ['isNotUndefined'] }],
      },
    ],
    invalid: [
      {
        name: 'isNotUndefined on a type that cannot be undefined (always true)',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: string;
          const y = isNotUndefined(x);
        `,
        output: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: string;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isBoolean on a value that is already boolean (always true)',
        code: dedent`
          import { isBoolean } from 'ts-data-forge';
          declare const x: boolean;
          const y = isBoolean(x);
        `,
        output: dedent`
          import { isBoolean } from 'ts-data-forge';
          declare const x: boolean;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNotBoolean on a value that can never be boolean (always true)',
        code: dedent`
          import { isNotBoolean } from 'ts-data-forge';
          declare const x: string | number;
          const y = isNotBoolean(x);
        `,
        output: dedent`
          import { isNotBoolean } from 'ts-data-forge';
          declare const x: string | number;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNonNullish on a non-nullable value (always true)',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNullish on a value that is already null | undefined (always true)',
        code: dedent`
          import { isNullish } from 'ts-data-forge';
          declare const x: null | undefined;
          const y = isNullish(x);
        `,
        output: dedent`
          import { isNullish } from 'ts-data-forge';
          declare const x: null | undefined;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNonEmptyString on a NonEmptyString value (always true)',
        code: dedent`
          import { type NonEmptyString } from 'ts-type-forge';
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: NonEmptyString;
          const y = isNonEmptyString(x);
        `,
        output: dedent`
          import { type NonEmptyString } from 'ts-type-forge';
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: NonEmptyString;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNonEmptyString on a non-empty string literal union (always true)',
        code: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: 'a' | 'b';
          const y = isNonEmptyString(x);
        `,
        output: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: 'a' | 'b';
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isBoolean on a value that can never be boolean (always false)',
        code: dedent`
          import { isBoolean } from 'ts-data-forge';
          declare const x: string;
          const y = isBoolean(x);
        `,
        output: dedent`
          import { isBoolean } from 'ts-data-forge';
          declare const x: string;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isNotUndefined on an always-undefined value (always false)',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: undefined;
          const y = isNotUndefined(x);
        `,
        output: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const x: undefined;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isNonNullish on an always-nullish value (always false)',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: null | undefined;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: null | undefined;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isNonEmptyString on the empty string literal (always false)',
        code: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: '';
          const y = isNonEmptyString(x);
        `,
        output: dedent`
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: '';
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'no autofix when the argument has side effects',
        code: dedent`
          import { isNotUndefined } from 'ts-data-forge';
          declare const getValue: () => string;
          const y = isNotUndefined(getValue());
        `,
        output: null,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isNonNullish that only removes undefined -> isNotUndefined',
        code: dedent`
          import { isNonNullish, isNotUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNonNullish, isNotUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNotUndefined(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'replacement guard imported under an alias renames to the alias',
        code: dedent`
          import { isNonNullish, isNotUndefined as inu } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNonNullish, isNotUndefined as inu } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = inu(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'isNonNullish that only removes null -> isNotNull (import inserted)',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNotNull } from 'ts-data-forge';
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNotNull(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'isNullish that only matches undefined -> isUndefined',
        code: dedent`
          import { isNullish, isUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNullish(x);
        `,
        output: dedent`
          import { isNullish, isUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isUndefined(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'isNonEmptyString that only removes nullish -> isNonNullish',
        code: dedent`
          import { type NonEmptyString } from 'ts-type-forge';
          import { isNonEmptyString, isNonNullish } from 'ts-data-forge';
          declare const x: NonEmptyString | null | undefined;
          const y = isNonEmptyString(x);
        `,
        output: dedent`
          import { type NonEmptyString } from 'ts-type-forge';
          import { isNonEmptyString, isNonNullish } from 'ts-data-forge';
          declare const x: NonEmptyString | null | undefined;
          const y = isNonNullish(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'namespace import member call is replaced without import change',
        code: dedent`
          import * as tf from 'ts-data-forge';
          declare const x: string | undefined;
          const y = tf.isNonNullish(x);
        `,
        output: dedent`
          import * as tf from 'ts-data-forge';
          declare const x: string | undefined;
          const y = tf.isNotUndefined(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
    ],
  });
});
