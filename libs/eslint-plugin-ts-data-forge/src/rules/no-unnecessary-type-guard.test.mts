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
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('no-unnecessary-type-guard', () => {
  tester.run('no-unnecessary-type-guard', noUnnecessaryTypeGuard, {
    valid: [
      {
        name: 'isRecord that actually narrows a union',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Record<string, unknown> | string;
          const y = isRecord(x);
        `,
      },
      {
        name: 'isUndefined on undefined handed to an assertion function, which checks at run time what the type says',
        code: dedent`
          import { isUndefined } from 'ts-data-forge';
          declare const assertIsTrue: (value: unknown) => asserts value is true;
          declare const x: undefined;
          assertIsTrue(isUndefined(x));
        `,
      },
      {
        name: 'isRecord on an object type without an index signature of its own',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Readonly<{ a: number }>;
          const y = isRecord(x);
        `,
      },
      {
        name: 'isRecord on unknown',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: unknown;
          const y = isRecord(x);
        `,
      },
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
        name: 'isRecord on a record type (always true)',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Readonly<Record<string, unknown>>;
          const y = isRecord(x);
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Readonly<Record<string, unknown>>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isRecord on a union of record types (always true)',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Record<string, number> | Record<string, string>;
          const y = isRecord(x);
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: Record<string, number> | Record<string, string>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'isRecord on a primitive (always false)',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: string | null;
          const y = isRecord(x);
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: string | null;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isRecord on an array (always false)',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: readonly number[];
          const y = isRecord(x);
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: readonly number[];
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isRecord on a function (always false)',
        code: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: () => void;
          const y = isRecord(x);
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          declare const x: () => void;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
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
          import { isNonNullish, isNotNull } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNotNull(x);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'the message names an aliased replacement guard by its local name',
        code: dedent`
          import { isNonNullish, isNotNull as inn } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNonNullish(x);
        `,
        output: dedent`
          import { isNonNullish, isNotNull as inn } from 'ts-data-forge';
          declare const x: string | null;
          const y = inn(x);
        `,
        errors: [
          {
            messageId: 'replaceTypeGuard',
            data: { from: 'isNonNullish', to: 'inn' },
          },
        ],
      },
      {
        name: 'several reports bind each replacement guard they write',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string | null;
          declare const z: string | undefined;
          const a = isNonNullish(x);
          const b = isNonNullish(x);
          const c = isNonNullish(z);
        `,
        output: [
          dedent`
            import { isNonNullish, isNotNull } from 'ts-data-forge';
            declare const x: string | null;
            declare const z: string | undefined;
            const a = isNotNull(x);
            const b = isNonNullish(x);
            const c = isNonNullish(z);
          `,
          dedent`
            import { isNonNullish, isNotNull, isNotUndefined } from 'ts-data-forge';
            declare const x: string | null;
            declare const z: string | undefined;
            const a = isNotNull(x);
            const b = isNonNullish(x);
            const c = isNotUndefined(z);
          `,
          dedent`
            import { isNonNullish, isNotNull, isNotUndefined } from 'ts-data-forge';
            declare const x: string | null;
            declare const z: string | undefined;
            const a = isNotNull(x);
            const b = isNotNull(x);
            const c = isNotUndefined(z);
          `,
        ],
        errors: [
          { messageId: 'replaceTypeGuard' },
          { messageId: 'replaceTypeGuard' },
          { messageId: 'replaceTypeGuard' },
        ],
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

describe('no-unnecessary-type-guard through type wrappers', () => {
  tester.run('no-unnecessary-type-guard', noUnnecessaryTypeGuard, {
    valid: [
      {
        name: 'isNullish on a value cast away from null',
        code: dedent`
          import { isNullish } from 'ts-data-forge';
          declare const x: string | null | undefined;
          const y = isNullish(x as string | undefined);
        `,
      },
      {
        name: 'isNonNullish on a value cast away from null',
        code: dedent`
          import { isNonNullish } from 'ts-data-forge';
          declare const x: string | null | undefined;
          const y = isNonNullish(x as string | undefined);
        `,
      },
      {
        name: 'isNonEmptyString on a string cast to NonEmptyString',
        code: dedent`
          import { type NonEmptyString } from 'ts-type-forge';
          import { isNonEmptyString } from 'ts-data-forge';
          declare const x: string | null | undefined;
          const y = isNonEmptyString(x as NonEmptyString | null | undefined);
        `,
      },
      {
        name: 'isNull on a value whose `!` does not remove the null',
        code: dedent`
          import { isNull } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNull(x!);
        `,
      },
      {
        name: 'isNull on a value widened to include null: the `as` is the author saying it may be null',
        code: dedent`
          import { isNull } from 'ts-data-forge';
          declare const x: string;
          const y = isNull(x as string | null);
        `,
      },
      {
        name: 'isNullish on a value widened to include null is not narrowed to isUndefined',
        code: dedent`
          import { isNullish } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNullish(x as string | null | undefined);
        `,
      },
    ],
    invalid: [
      {
        name: 'isNonNullish on a value whose `!` does not remove the null',
        code: dedent`
          import { isNonNullish, isNotNull } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNonNullish(x!);
        `,
        output: dedent`
          import { isNonNullish, isNotNull } from 'ts-data-forge';
          declare const x: string | null;
          const y = isNotNull(x!);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
      {
        name: 'isNull on a value widened to exclude null still, at every layer',
        code: dedent`
          import { isNull } from 'ts-data-forge';
          declare const x: string;
          const y = isNull(x as string | undefined);
        `,
        output: dedent`
          import { isNull } from 'ts-data-forge';
          declare const x: string;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'isNullish replaced on the value under `satisfies`, keeping the wrapper',
        code: dedent`
          import { isNullish, isUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isNullish(x satisfies string | null | undefined);
        `,
        output: dedent`
          import { isNullish, isUndefined } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = isUndefined(x satisfies string | null | undefined);
        `,
        errors: [{ messageId: 'replaceTypeGuard' }],
      },
    ],
  });
});

describe('no-unnecessary-type-guard on the variant guards of Optional, Result, TernaryResult and AsyncData', () => {
  tester.run('no-unnecessary-type-guard', noUnnecessaryTypeGuard, {
    valid: [
      {
        name: 'Optional.isNone on an Optional',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const x: Optional<number>;
          const y = Optional.isNone(x);
        `,
      },
      {
        name: 'Optional.isSome on a generic Optional',
        code: dedent`
          import { Optional, type UnknownOptional } from 'ts-data-forge';
          const f = <O extends UnknownOptional>(x: O): boolean => Optional.isSome(x);
        `,
      },
      {
        name: 'Optional.isSome on any',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const x: any;
          const y = Optional.isSome(x);
        `,
      },
      {
        name: 'Optional.isNone on a union with a member that has no tag',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number> | Readonly<{ value: number }>;
          const y = Optional.isNone(x);
        `,
      },
      {
        name: 'Result.isOk on a Result',
        code: dedent`
          import { Result } from 'ts-data-forge';
          declare const x: Result<number, string>;
          const y = Result.isOk(x);
        `,
      },
      {
        name: 'Optional.isSome on a Some widened to an Optional: the `as` is the author saying it may be None',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isSome(x as Optional<number>);
        `,
      },
      {
        name: 'Optional.isSome on a Some handed to an assertion function, which checks at run time what the type says',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const assertIsTrue: (value: unknown) => asserts value is true;
          declare const x: Some<number>;
          assertIsTrue(Optional.isSome(x));
        `,
      },
      {
        name: 'Result.isErr on an Ok handed to a truthiness assertion',
        code: dedent`
          import { Result, type Ok } from 'ts-data-forge';
          declare const assertFalsy: (value: unknown) => asserts value;
          declare const x: Ok<number>;
          assertFalsy(!Result.isErr(x));
        `,
      },
      {
        name: 'Optional.isSome on a Some handed to an assertion function under `satisfies`',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const assertIsTrue: (value: unknown) => asserts value is true;
          declare const x: Some<number>;
          assertIsTrue(Optional.isSome(x) satisfies boolean);
        `,
      },
      {
        name: 'Optional.isSome on a Some handed to an assertion function under `as`',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const assertIsTrue: (value: unknown) => asserts value is true;
          declare const x: Some<number>;
          assertIsTrue(Optional.isSome(x) as boolean);
        `,
      },
      {
        name: 'Optional.isNone on an Optional cast to Some: the cast does not make the value Some',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Optional<number>;
          const y = Optional.isNone(x as Some<number>);
        `,
      },
      {
        name: 'Optional.isSome on a `let` a closure reassigns, which TypeScript still narrows to its initial None',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const xs: readonly number[];
          let mut_found: Optional<number> = Optional.none;
          xs.forEach((x) => {
            mut_found = Optional.some(x);
          });
          const y = Optional.isSome(mut_found);
        `,
      },
      {
        name: 'Optional.isSome on a property a closure assigns, which TypeScript still narrows to the None assigned before',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const mut_state: { found: Optional<number> };
          mut_state.found = Optional.none;
          xs.forEach((x) => {
            mut_state.found = Optional.some(x);
          });
          const y = Optional.isSome(mut_state.found);
        `,
      },
      {
        name: 'Optional.isSome on a conditional between `let`s a closure reassigns',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const flag: boolean;
          let mut_a: Optional<number> = Optional.none;
          let mut_b: Optional<number> = Optional.none;
          xs.forEach((x) => {
            mut_a = Optional.some(x);
            mut_b = Optional.some(x);
          });
          const y = Optional.isSome(flag ? mut_a : mut_b);
        `,
      },
      {
        name: 'isUndefined on a `let` a closure reassigns, which TypeScript still narrows to its initial undefined',
        code: dedent`
          import { isUndefined } from 'ts-data-forge';
          declare const xs: readonly string[];
          let mut_last: string | undefined = undefined;
          xs.forEach((x) => {
            mut_last = x;
          });
          const y = isUndefined(mut_last);
        `,
      },
      {
        name: 'a member named isNone of an Optional that is not ts-data-forge',
        code: dedent`
          import { Optional } from 'another-library';
          declare const x: Readonly<{ $$tag: 'ts-data-forge::Optional.some' }>;
          const y = Optional.isNone(x);
        `,
      },
      {
        name: 'a member of Optional that is not a variant guard',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isOptional(x);
        `,
      },
      {
        name: 'Optional.isNone ignored by option',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isNone(x);
        `,
        options: [{ ignore: ['Optional.isNone'] }],
      },
      {
        name: 'TernaryResult.isWarn on a TernaryResult',
        code: dedent`
          import { TernaryResult } from 'ts-data-forge';
          declare const x: TernaryResult<number, string, boolean>;
          const y = TernaryResult.isWarn(x);
        `,
      },
      {
        name: 'AsyncData.isSettled on an AsyncData',
        code: dedent`
          import { AsyncData } from 'ts-data-forge';
          declare const x: AsyncData<number, string>;
          const y = AsyncData.isSettled(x);
        `,
      },
    ],
    invalid: [
      {
        name: 'Optional.isNone on a Some (always false)',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isNone(x);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = false;
        `,
        errors: [
          { messageId: 'alwaysFalse', data: { name: 'Optional.isNone' } },
        ],
      },
      {
        name: 'Optional.isSome on a Some (always true)',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isSome(x);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = true;
        `,
        errors: [
          { messageId: 'alwaysTrue', data: { name: 'Optional.isSome' } },
        ],
      },
      {
        name: 'Optional.isSome on a None (always false)',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          const x = Optional.none;
          const y = Optional.isSome(x);
        `,
        output: dedent`
          import { Optional } from 'ts-data-forge';
          const x = Optional.none;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'Optional.isNone on a None (always true)',
        code: dedent`
          import { Optional, type None } from 'ts-data-forge';
          declare const x: None;
          const y = Optional.isNone(x);
        `,
        output: dedent`
          import { Optional, type None } from 'ts-data-forge';
          declare const x: None;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'Optional.isNone on the snapshot of an InitializedObservable-like store, without a fix because the call is dropped',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const store: Readonly<{ getSnapshot: () => Some<number> }>;
          if (Optional.isNone(store.getSnapshot())) {
            console.log('unreachable');
          }
        `,
        output: null,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'Optional.isNone on a union of two Some types',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number> | Some<string>;
          const y = Optional.isNone(x);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number> | Some<string>;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'Optional.isSome on an Optional already narrowed by an earlier guard',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          declare const x: Optional<number>;
          if (Optional.isNone(x)) {
            throw new Error('none');
          }
          const y = Optional.isSome(x);
        `,
        output: dedent`
          import { Optional } from 'ts-data-forge';
          declare const x: Optional<number>;
          if (Optional.isNone(x)) {
            throw new Error('none');
          }
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'Optional.isSome on a Some under `!`, which narrows nothing here',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isSome(x!);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'Optional.isNone on a Some under `satisfies`',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = Optional.isNone((x satisfies Optional<number>));
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'an Optional imported under another name',
        code: dedent`
          import { Optional as O, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = O.isNone(x);
        `,
        output: dedent`
          import { Optional as O, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = false;
        `,
        errors: [
          { messageId: 'alwaysFalse', data: { name: 'Optional.isNone' } },
        ],
      },
      {
        name: 'Optional reached through a namespace import',
        code: dedent`
          import * as tf from 'ts-data-forge';
          declare const x: tf.Some<number>;
          const y = tf.Optional.isNone(x);
        `,
        output: dedent`
          import * as tf from 'ts-data-forge';
          declare const x: tf.Some<number>;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'the guard under a type wrapper of its own',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = (Optional as typeof Optional).isNone(x);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const x: Some<number>;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'Optional.isSome on a Some as the argument of a call that asserts another parameter',
        code: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const assertSecond: (label: unknown, value: unknown) => asserts value;
          declare const x: Some<number>;
          assertSecond(Optional.isSome(x), true);
        `,
        output: dedent`
          import { Optional, type Some } from 'ts-data-forge';
          declare const assertSecond: (label: unknown, value: unknown) => asserts value;
          declare const x: Some<number>;
          assertSecond(true, true);
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'Result.isOk on an Ok (always true)',
        code: dedent`
          import { Result } from 'ts-data-forge';
          const x = Result.ok(1);
          const y = Result.isOk(x);
        `,
        output: dedent`
          import { Result } from 'ts-data-forge';
          const x = Result.ok(1);
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue', data: { name: 'Result.isOk' } }],
      },
      {
        name: 'Result.isErr on an Ok (always false)',
        code: dedent`
          import { Result, type Ok } from 'ts-data-forge';
          declare const x: Ok<number>;
          const y = Result.isErr(x);
        `,
        output: dedent`
          import { Result, type Ok } from 'ts-data-forge';
          declare const x: Ok<number>;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse', data: { name: 'Result.isErr' } }],
      },
      {
        name: 'Result.isErr on an Err (always true)',
        code: dedent`
          import { Result, type Err } from 'ts-data-forge';
          declare const x: Err<string>;
          const y = Result.isErr(x);
        `,
        output: dedent`
          import { Result, type Err } from 'ts-data-forge';
          declare const x: Err<string>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'TernaryResult.isWarn on a TernaryOk (always false)',
        code: dedent`
          import { TernaryResult, type TernaryOk } from 'ts-data-forge';
          declare const x: TernaryOk<number>;
          const y = TernaryResult.isWarn(x);
        `,
        output: dedent`
          import { TernaryResult, type TernaryOk } from 'ts-data-forge';
          declare const x: TernaryOk<number>;
          const y = false;
        `,
        errors: [
          { messageId: 'alwaysFalse', data: { name: 'TernaryResult.isWarn' } },
        ],
      },
      {
        name: 'AsyncData.isSettled on an Ok or an AsyncErr (always true)',
        code: dedent`
          import { AsyncData, type AsyncErr, type Ok } from 'ts-data-forge';
          declare const x: Ok<number> | AsyncErr<number, string>;
          const y = AsyncData.isSettled(x);
        `,
        output: dedent`
          import { AsyncData, type AsyncErr, type Ok } from 'ts-data-forge';
          declare const x: Ok<number> | AsyncErr<number, string>;
          const y = true;
        `,
        errors: [
          { messageId: 'alwaysTrue', data: { name: 'AsyncData.isSettled' } },
        ],
      },
      {
        name: 'Optional.isSome on a `let` no closure reassigns (always false)',
        code: dedent`
          import { Optional } from 'ts-data-forge';
          let mut_found: Optional<number> = Optional.none;
          const y = Optional.isSome(mut_found);
        `,
        output: dedent`
          import { Optional } from 'ts-data-forge';
          let mut_found: Optional<number> = Optional.none;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
      {
        name: 'TernaryResult.isWarn on a TernaryWarn (always true)',
        code: dedent`
          import { TernaryResult, type TernaryWarn } from 'ts-data-forge';
          declare const x: TernaryWarn<number, string>;
          const y = TernaryResult.isWarn(x);
        `,
        output: dedent`
          import { TernaryResult, type TernaryWarn } from 'ts-data-forge';
          declare const x: TernaryWarn<number, string>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'AsyncData.isIdle on an AsyncIdle (always true)',
        code: dedent`
          import { AsyncData, type AsyncIdle } from 'ts-data-forge';
          declare const x: AsyncIdle;
          const y = AsyncData.isIdle(x);
        `,
        output: dedent`
          import { AsyncData, type AsyncIdle } from 'ts-data-forge';
          declare const x: AsyncIdle;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'AsyncData.isPending on an AsyncPending (always true)',
        code: dedent`
          import { AsyncData, type AsyncPending } from 'ts-data-forge';
          declare const x: AsyncPending<number>;
          const y = AsyncData.isPending(x);
        `,
        output: dedent`
          import { AsyncData, type AsyncPending } from 'ts-data-forge';
          declare const x: AsyncPending<number>;
          const y = true;
        `,
        errors: [{ messageId: 'alwaysTrue' }],
      },
      {
        name: 'AsyncData.isPending on an AsyncIdle (always false)',
        code: dedent`
          import { AsyncData, type AsyncIdle } from 'ts-data-forge';
          declare const x: AsyncIdle;
          const y = AsyncData.isPending(x);
        `,
        output: dedent`
          import { AsyncData, type AsyncIdle } from 'ts-data-forge';
          declare const x: AsyncIdle;
          const y = false;
        `,
        errors: [{ messageId: 'alwaysFalse' }],
      },
    ],
  });
});
