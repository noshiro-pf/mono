import { isSet } from '@sindresorhus/is';
import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';

type SetResultType<T extends Type<unknown>> = ReadonlySet<TypeOf<T>>;

export const SetType = <T extends Type<unknown>>(
  elementType: T,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<SetResultType<T>> => {
  type S = SetResultType<T>;

  const typeName = options?.typeName ?? 'Set';

  const getDefaultValue = memoizeFunction((): S => new Set());

  const validate: Type<S>['validate'] = (a) => {
    if (!isSet(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'Set',
          typeName,
          details: undefined,
        }),
      ]);
    }

    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const element of a) {
        const res = elementType.validate(element);

        if (Result.isErr(res)) {
          yield {
            path: [],
            actualValue: element,
            expectedType: typeName,
            typeName,
            details: {
              kind: 'set-element',
              expectedType: elementType.typeName,
            },
          } satisfies ValidationError;

          yield* res.value;
        }
      }
    });

    if (Arr.isNonEmpty(errors)) {
      return Result.err(errors);
    }

    return Result.ok(a);
  };

  const fill: Type<S>['fill'] = (a) =>
    !isSet(a)
      ? getDefaultValue()
      : new Set(Array.from(a).filter((v) => elementType.is(v)));

  return {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
