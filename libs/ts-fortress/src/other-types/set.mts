import { Arr, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';

const isSet = (value: unknown): value is ReadonlySet<unknown> =>
  Object.prototype.toString.call(value) === '[object Set]';

type SetResultType<T extends Type<unknown>> = ReadonlySet<TypeOf<T>>;

export const SetType = <T extends Type<unknown>>(
  elementType: T,
  options?: PartialReadonly<{
    typeName: string;
  }>,
): Type<SetResultType<T>> => {
  type S = SetResultType<T>;

  const typeName = options?.typeName ?? 'Set';

  const defaultValue: S = new Set();

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
      for (const element of a.values()) {
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

    if (errors.length > 0) {
      return Result.err(errors);
    }

    return Result.ok(a as S);
  };

  const fill: Type<S>['fill'] = (a) =>
    isSet(a)
      ? (new Set(Array.from(a.values()).filter((v) => elementType.is(v))) as S)
      : defaultValue;

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
