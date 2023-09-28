import type * as t from '@noshiro/io-ts';
import { createType, validationErrorMessage } from '@noshiro/io-ts';
import { FieldValue, serverTimestamp } from 'firebase/firestore';

export const firestoreTimestampTypeDef: t.Type<FieldValue> = createType({
  typeName: 'FieldValue',
  defaultValue: serverTimestamp(),
  validate: (a) => {
    if (a instanceof FieldValue) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a FieldValue'),
      ]);
    }

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as FieldValue);
  },
});
