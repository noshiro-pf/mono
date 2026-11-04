import { Arr } from 'ts-data-forge';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../functions/index.mjs';
import type {
  BatchUpdateTableCellPos,
  BatchUpdateTableCellPosSerialized,
} from '../../types/index.mjs';

export const toBatchUpdateTableCellKey = (
  keyObj: BatchUpdateTableCellPos,
): BatchUpdateTableCellPosSerialized =>
  `${datetimeRangeToMapKey(keyObj.datetimeRange)}*${keyObj.eventId}`;

export const fromBatchUpdateTableCellKey = (
  keyStr: BatchUpdateTableCellPosSerialized,
): BatchUpdateTableCellPos => {
  const split = keyStr.split('*');

  if (Arr.isFixedLengthTuple(2, split)) {
    return {
      datetimeRange: datetimeRangeFromMapKey(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        split[0] as DatetimeRangeMapKey,
      ),
      eventId: split[1],
    };
  }

  throw new TypeError(
    `Parse error: "${keyStr}" cannot be parsed to BatchUpdateTableCellPos.`,
  );
};
