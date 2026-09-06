import { FieldValue, serverTimestamp } from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * `validationErrorMessage(value, message)` is gone; errors are built with
 * `createPrimitiveValidationError` now.
 *
 * The original guard was also inverted — it returned an error when the value
 * *was* a `FieldValue`, and accepted everything else. That is fixed here.
 */
export const firestoreTimestampTypeDef: t.Type<FieldValue> = t.createType({
  typeName: 'FieldValue',
  defaultValue: serverTimestamp(),
  validate: (a) =>
    a instanceof FieldValue
      ? Result.ok(a)
      : Result.err([
          t.createPrimitiveValidationError({
            actualValue: a,
            expectedType: 'FieldValue',
            typeName: 'FieldValue',
            details: undefined,
          }),
        ]),
});
