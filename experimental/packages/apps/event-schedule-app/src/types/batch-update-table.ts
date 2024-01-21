import { type AnswerTableCell } from './answer-table-cell';

export type BatchUpdateTableCellPos = Readonly<{
  datetimeRange: DatetimeRange;
  eventId: string;
}>;

export type BatchUpdateTableCellPosSerialized =
  `${DatetimeRangeMapKey}*${string}`;

export type BatchUpdateTableCellEditableValue = Pick<
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
