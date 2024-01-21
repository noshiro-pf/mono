import {
  toUserId,
  type EventListItem,
} from '@noshiro/event-schedule-app-shared';
import { defaultIconPoint } from '../../constants';
import { eventIsAfterDeadline } from '../../functions';
import {
  type BatchUpdateTableCellDisplayValue,
  type BatchUpdateTableCellEditableValue,
  type BatchUpdateTableCellMap,
  type BatchUpdateTableCellPos,
  type BatchUpdateTableCellPosSerialized,
} from '../../types';
import { Auth } from '../auth';
import { eventList$ } from '../fetching-state';
import { eventListToBatchUpdateTableBodyValues } from './event-list-to-batch-update-table-body-values';
import {
  fromBatchUpdateTableCellKey,
  toBatchUpdateTableCellKey,
} from './map-key';

const {
  state$: editing$,
  setTrue: setEditingTrue,
  setFalse: setEditingFalse,
} = createBooleanState(false);

const {
  state$: batchInputFormState$,
  updateState: updateBatchInputFormState,
  resetState: resetBatchInputFormState,
} = createState<
  Readonly<{
    comment: string;
    point: AnswerIconPoint;
    selectedIconId: AnswerIconIdWithNone;
  }>
>({
  comment: '',
  point: 0,
  selectedIconId: 'none',
});

const setComment = (comment: string): void => {
  updateBatchInputFormState((s) => Obj.set(s, 'comment', comment));
};

const setPoint = (point: AnswerIconPoint): void => {
  updateBatchInputFormState((s) => Obj.set(s, 'point', point));
};

const setSelectedIconId = (selectedIconId: AnswerIconIdWithNone): void => {
  updateBatchInputFormState(
    (curr) =>
      pipe(curr)
        .chain((s) => Obj.set(s, 'selectedIconId', selectedIconId))
        .chain((s) =>
          Obj.set(s, 'point', match(selectedIconId, defaultIconPoint)),
        ).value,
  );
};

const onGoodClick = (): void => {
  setSelectedIconId('good');
};
const onFairClick = (): void => {
  setSelectedIconId('fair');
};
const onPoorClick = (): void => {
  setSelectedIconId('poor');
};

const startEditing = (): void => {
  setEditingTrue();
  setSelectedIconId('poor');
};

const exitEditing = (): void => {
  setEditingFalse();
  resetBatchInputFormState();
};

const {
  state$: newAnswerMap$,
  updateState: updateNewAnswerMap,
  resetState: resetNewAnswerMap,
} = createState<
  IMapMapped<
    BatchUpdateTableCellPos,
    BatchUpdateTableCellEditableValue,
    BatchUpdateTableCellPosSerialized
  >
>(IMapMapped.new([], toBatchUpdateTableCellKey, fromBatchUpdateTableCellKey));

const setBatchUpdateTableCellState = (pos: BatchUpdateTableCellPos): void => {
  const curr = tableValueMap$.snapshot.value.get(pos);
  const newValue = batchInputFormState$.snapshot.value;

  updateNewAnswerMap((state) =>
    curr !== undefined &&
    curr.iconId === newValue.selectedIconId &&
    curr.point === newValue.point &&
    curr.comment === newValue.comment
      ? state.delete(pos)
      : state.set(pos, {
          comment: newValue.comment,
          iconId: newValue.selectedIconId,
          point: newValue.point,
        }),
  );
};

const eventListToBatchUpdateTableCellMap = (
  eventList: readonly EventListItem[] | undefined,
  myUserId: UserId | undefined,
): BatchUpdateTableCellMap => {
  type AnswerCellKeyValue = Readonly<{
    key: BatchUpdateTableCellPos;
    value: BatchUpdateTableCellDisplayValue;
  }>;

  const answerCells: readonly AnswerCellKeyValue[] =
    myUserId === undefined || eventList === undefined
      ? []
      : eventList.flatMap((eventItem: EventListItem) => {
          const editable = !eventIsAfterDeadline(eventItem.eventSchedule);

          return (pipe(
            eventItem.answers.find((a) => a.user.id === myUserId),
          ).chainOptional((myAnswer: Answer) =>
            myAnswer.selection.map(
              (sel: AnswerSelection) =>
                ({
                  key: {
                    datetimeRange: sel.datetimeRange,
                    eventId: eventItem.eventScheduleMetadata.id,
                  },
                  value: {
                    comment: sel.comment,
                    iconId: sel.iconId,
                    point: sel.point,
                    showPoint:
                      sel.iconId === 'fair' &&
                      sel.point !==
                        eventItem.eventSchedule.answerIcons.fair.point,
                    weight: myAnswer.weight,
                    editable,
                    onClick: () => {
                      setBatchUpdateTableCellState({
                        datetimeRange: sel.datetimeRange,
                        eventId: eventItem.eventScheduleMetadata.id,
                      });
                    },
                  } satisfies BatchUpdateTableCellDisplayValue,
                }) satisfies AnswerCellKeyValue,
            ),
          ).value ?? []) satisfies readonly AnswerCellKeyValue[];
        });

  return IMapMapped.new(
    answerCells.map((c) =>
      tp(
        c.key satisfies BatchUpdateTableCellPos,
        c.value satisfies BatchUpdateTableCellDisplayValue,
      ),
    ),
    toBatchUpdateTableCellKey,
    fromBatchUpdateTableCellKey,
  ) satisfies BatchUpdateTableCellMap;
};

const tableValueMap$: InitializedObservable<BatchUpdateTableCellMap> =
  combineLatestI([eventList$, Auth.fireAuthUser$]).chain(
    mapI(([eventList, fireAuthUser]) =>
      eventListToBatchUpdateTableCellMap(
        eventList,
        mapOptional(fireAuthUser?.uid, toUserId),
      ),
    ),
  );

const tableBodyValues$ = combineLatestI([eventList$, tableValueMap$]).chain(
  mapI(([evList, tableValueMap]) =>
    eventListToBatchUpdateTableBodyValues(evList, tableValueMap),
  ),
);

export const BatchUpdateAnswersStore = {
  editing$,
  startEditing,
  exitEditing,
  batchInputFormState$,
  setComment,
  setPoint,
  setSelectedIconId,
  onGoodClick,
  onFairClick,
  onPoorClick,
  tableBodyValues$,
  newAnswerMap$,
  setBatchUpdateTableCellState,
  resetNewAnswerMap,
};
