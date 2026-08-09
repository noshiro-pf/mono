import { isNonEmptyString } from 'ts-data-forge';
import { type NonEmptyString, type StrictOmit } from 'ts-type-forge';
import {
  string,
  type StringConstraintsResultType,
  type StringTypeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export type { NonEmptyString } from 'ts-type-forge';

/**
 * The constraints accepted by {@link nonEmptyString}: every {@link string}
 * constraint except `nonempty`, which is always implied.
 */
export type NonEmptyStringConstraints = StrictOmit<
  StringTypeConstraints,
  'nonempty'
>;

export function nonEmptyString(defaultValue?: string): Type<NonEmptyString>;

export function nonEmptyString<const C extends NonEmptyStringConstraints>(
  defaultValue: string,
  constraints: C,
): Type<StringConstraintsResultType<C & Readonly<{ nonempty: true }>>>;

export function nonEmptyString(
  defaultValue: string = ' ',
  constraints?: NonEmptyStringConstraints,
): Type<NonEmptyString> {
  // `nonempty` is always implied; the remaining constraints (if any) are
  // forwarded to `string`, which validates them at runtime and refines the
  // result type the same way it does for a plain string type.
  return string(defaultValue, { nonempty: true, ...constraints });
}

if (import.meta.vitest !== undefined) {
  test('defaultValue', () => {
    // eslint-disable-next-line ts-data-forge/no-unnecessary-type-guard
    assert.isTrue(isNonEmptyString(' '));
  });
}
