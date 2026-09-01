import { Arr, ISet, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type PermutationString } from 'ts-utils-additional';

const permutationStringImpl = (s: string): readonly string[] => {
  if (s.length === 0) return [];

  const mut_values = [];

  for (const c of s) {
    const suffixes = permutationStringImpl(s.replace(c, ''));

    if (Arr.isEmpty(suffixes)) {
      mut_values.push(c);
    } else {
      for (const sf of suffixes) {
        mut_values.push(`${c}${sf}`);
      }
    }
  }

  return mut_values;
};

export const permutationType = <
  A extends string,
  P extends PermutationString<A> = PermutationString<A>,
>(
  defaultValue: P,
  typeName?: string,
): t.Type<P> => {
  const valueSet = ISet.create(permutationStringImpl(defaultValue));

  // `createType` rather than a hand-written `validate` / `fill` / `is`: it
  // supplies `is`, `fill` and `prune`, and `prune` is required by `Type` now.
  // `validationErrorMessage` is gone; errors are built with
  // `createPrimitiveValidationError`. The acceptance predicate is unchanged.
  return t.createType({
    typeName: typeName ?? `permutation(${defaultValue})`,
    defaultValue,
    validate: (a) =>
      typeof a === 'string' && valueSet.has(a)
        ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          Result.ok(a as P)
        : Result.err([
            t.createPrimitiveValidationError({
              actualValue: a,
              expectedType: valueSet
                .map((v) => `'${v}'`)
                .toArray()
                .join(' | '),
              typeName: typeName ?? `permutation(${defaultValue})`,
              details: undefined,
            }),
          ]),
  });
};
