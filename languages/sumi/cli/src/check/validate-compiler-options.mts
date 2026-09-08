import { type ReadonlyRecord } from 'ts-type-forge';
import {
  lockedCompilerOptions,
  lockedOptionsThatMustBeExplicit,
  strictFamilyOptionNames,
} from '../locked-compiler-options.mjs';

/** One locked option the project's effective configuration disagrees with. */
export type CompilerOptionViolation = Readonly<{
  option: string;
  expected: boolean | string;
  /** `undefined` when the project does not set the option at all. */
  actual: unknown;
}>;

/**
 * Compares a project's effective compilerOptions (as `tsc --showConfig`
 * reports them) with the locked entries. The comparison follows how the
 * compiler reads the file: an absent boolean is `false` unless the option is
 * one whose absence means something else, enum values compare
 * case-insensitively (`"NodeNext"` is `"nodenext"`), and a strict-family
 * flag set to `false` under `strict: true` is a violation of `strict`.
 */
export const validateCompilerOptions = (
  effective: ReadonlyRecord<string, unknown>,
): readonly CompilerOptionViolation[] =>
  [
    ...Object.entries(lockedCompilerOptions).flatMap(([option, expected]) => {
      const actual = effective[option];

      return matches(option, expected, actual)
        ? []
        : [{ option, expected, actual }];
    }),
    ...Object.entries(effective).flatMap(([option, actual]) =>
      actual === false && strictFamilyOptionNames.has(option)
        ? [{ option, expected: true, actual }]
        : [],
    ),
  ] as const;

const matches = (
  option: string,
  expected: boolean | string,
  actual: unknown,
): boolean => {
  if (actual === undefined) {
    return expected === false && !lockedOptionsThatMustBeExplicit.has(option);
  }

  if (typeof expected === 'string') {
    return (
      typeof actual === 'string' &&
      actual.toLowerCase() === expected.toLowerCase()
    );
  }

  return actual === expected;
};
