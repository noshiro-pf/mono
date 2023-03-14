import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
  type Type,
} from '@noshiro/io-ts';
import { type PermutationString } from '@noshiro/ts-utils-additional';

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
  P extends PermutationString<A> = PermutationString<A>
>(
  defaultValue: P,
  typeName?: string
): Type<P> => {
  const valueSet = ISet.new(permutationStringImpl(defaultValue));

  const validate: Type<P>['validate'] = (a) => {
    if (!(valueSet as ISet<unknown>).has(a)) {
      const valuesStr = valueSet
        .toArray()
        .map((s) => `'${s}'`)
        .join(', ');

      return Result.err([
        validationErrorMessage(
          a,
          `The value is expected to be one of the elements contained in { ${valuesStr} }`
        ),
      ]);
    }

    return Result.ok(a as P);
  };

  const is = createIsFnFromValidateFn<P>(validate);

  const fill: Type<P>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName: typeName ?? `permutation(${defaultValue})`,
    defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFunction(validate),
  };
};
