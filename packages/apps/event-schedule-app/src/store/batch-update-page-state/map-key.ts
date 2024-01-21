import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../functions';
import {
  type BatchUpdateTableCellPos,
  type BatchUpdateTableCellPosSerialized,
} from '../../types';

export const toBatchUpdateTableCellKey = (
  keyObj: BatchUpdateTableCellPos,
): BatchUpdateTableCellPosSerialized =>
  `${datetimeRangeToMapKey(keyObj.datetimeRange)}*${keyObj.eventId}`;

export const fromBatchUpdateTableCellKey = (
  keyStr: BatchUpdateTableCellPosSerialized,
): BatchUpdateTableCellPos => {
  const split = keyStr.split('*');
  if (Arr.isArrayOfLength2(split)) {
    return {
      datetimeRange: datetimeRangeFromMapKey(
        // eslint-disable-next-line no-restricted-syntax
        split[0] as DatetimeRangeMapKey,
      ),
      eventId: split[1],
    };
  } else {
    throw new TypeError(
      `Parse error: "${keyStr}" cannot be parsed to AnswerCellKey.`,
    );
  }
};
