import type { IMapMapped } from 'ts-data-forge';
import type { DeepReadonly, StrictPick } from 'ts-type-forge';
import type { AnswerTableCell } from './answer-table-cell.mjs';

/** A cell of the batch update table: one candidate datetime of one event. */
export type BatchUpdateTableCellPos = Readonly<{
  datetimeRange: DatetimeRange;
  eventId: string;
}>;

export type BatchUpdateTableCellPosSerialized =
  `${DatetimeRangeMapKey}*${string}`;

export type BatchUpdateTableCellEditableValue = StrictPick<
  AnswerTableCell,
  'comment' | 'iconId' | 'point'
>;

export type BatchUpdateTableCellDisplayValue = AnswerTableCell &
  Readonly<{
    editable: boolean;
    onClick: () => void;
  }>;

export type BatchUpdateTableCellMap = IMapMapped<
  BatchUpdateTableCellPos,
  BatchUpdateTableCellDisplayValue,
  BatchUpdateTableCellPosSerialized
>;

export type BatchUpdateTableBodyRow = DeepReadonly<{
  rowKey: string;
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  cells: (BatchUpdateTableCellDisplayValue | undefined)[];
}>;
