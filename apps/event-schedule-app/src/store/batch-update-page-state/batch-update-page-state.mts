import { UserId, type EventListItem } from 'event-schedule-app-shared';
import {
  combine,
  createState as createStateBase,
  map,
  type InitializedObservable,
} from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';
import { IMapMapped, Optional, match, tp } from 'ts-data-forge';
import { defaultIconPoint } from '../../constants/index.mjs';
import { eventIsAfterDeadline } from '../../functions/index.mjs';
import type {
  BatchUpdateTableBodyRow,
  BatchUpdateTableCellDisplayValue,
  BatchUpdateTableCellEditableValue,
  BatchUpdateTableCellMap,
  BatchUpdateTableCellPos,
  BatchUpdateTableCellPosSerialized,
} from '../../types/index.mjs';
import { eventListToBatchUpdateTableBodyValues } from './event-list-to-batch-update-table-body-values.mjs';
import {
  fromBatchUpdateTableCellKey,
  toBatchUpdateTableCellKey,
} from './map-key.mjs';

export type BatchUpdateAnswersDeps = Readonly<{
  /** The events the table has a column for (the event list page's list). */
  eventList$: InitializedObservable<readonly EventListItem[] | undefined>;
  /** The signed-in user, whose answers the table shows. */
  fireAuthUser$: InitializedObservable<Readonly<{ uid: string }> | undefined>;
}>;

export type BatchInputFormState = Readonly<{
  comment: string;
  point: AnswerIconPoint;
  selectedIconId: AnswerIconIdWithNone;
}>;

export type BatchUpdateAnswers = Readonly<{
  editing$: InitializedObservable<boolean>;
  useEditing: () => boolean;
  startEditing: () => void;
  exitEditing: () => void;
  batchInputFormState$: InitializedObservable<BatchInputFormState>;
  useBatchInputFormState: () => BatchInputFormState;
  setComment: (comment: string) => void;
  setPoint: (point: AnswerIconPoint) => void;
  setSelectedIconId: (selectedIconId: AnswerIconIdWithNone) => void;
  onGoodClick: () => void;
  onFairClick: () => void;
  onPoorClick: () => void;
  tableBodyValues$: InitializedObservable<readonly BatchUpdateTableBodyRow[]>;
  /**
   * The cells clicked while editing, with the value each is to be given.
   * Nothing writes it yet [WIP].
   */
  newAnswerMap$: InitializedObservable<
    IMapMapped<
      BatchUpdateTableCellPos,
      BatchUpdateTableCellEditableValue,
      BatchUpdateTableCellPosSerialized
    >
  >;
  setBatchUpdateTableCellState: (pos: BatchUpdateTableCellPos) => void;
  resetNewAnswerMap: () => void;
}>;

/**
 * The batch update page: the signed-in user's answers to every listed event in
 * one table, and the batch input that a click on a cell applies while editing.
 *
 * [WIP] The clicked cells are only collected in `newAnswerMap$`; neither the
 * table nor the database reads it yet.
 */
export const createBatchUpdateAnswersStore = (
  deps: BatchUpdateAnswersDeps,
): BatchUpdateAnswers => {
  const [
    useEditing,
    { state: editing$, setTrue: setEditingTrue, setFalse: setEditingFalse },
  ] = createBooleanState(false);

  const [
    useBatchInputFormState,
    ,
    {
      state: batchInputFormState$,
      updateState: updateBatchInputFormState,
      resetState: resetBatchInputFormState,
      getSnapshot: getBatchInputFormStateSnapshot,
    },
  ] = createState<BatchInputFormState>({
    comment: '',
    point: 0,
    selectedIconId: 'none',
  });

  const setComment = (comment: string): void => {
    updateBatchInputFormState((s) => ({ ...s, comment }));
  };

  const setPoint = (point: AnswerIconPoint): void => {
    updateBatchInputFormState((s) => ({ ...s, point }));
  };

  const setSelectedIconId = (selectedIconId: AnswerIconIdWithNone): void => {
    updateBatchInputFormState((s) => ({
      ...s,
      selectedIconId,
      point: match(selectedIconId, defaultIconPoint),
    }));
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

  const [
    newAnswerMap$,
    ,
    { updateState: updateNewAnswerMap, resetState: resetNewAnswerMapState },
  ] = createStateBase<
    IMapMapped<
      BatchUpdateTableCellPos,
      BatchUpdateTableCellEditableValue,
      BatchUpdateTableCellPosSerialized
    >
  >(
    IMapMapped.create<
      BatchUpdateTableCellPos,
      BatchUpdateTableCellEditableValue,
      BatchUpdateTableCellPosSerialized
    >([], toBatchUpdateTableCellKey, fromBatchUpdateTableCellKey),
  );

  const resetNewAnswerMap = (): void => {
    resetNewAnswerMapState();
  };

  const eventListToBatchUpdateTableCellMap = (
    eventList: readonly EventListItem[] | undefined,
    myUserId: UserId | undefined,
  ): BatchUpdateTableCellMap => {
    type AnswerCellKeyValue = readonly [
      BatchUpdateTableCellPos,
      BatchUpdateTableCellDisplayValue,
    ];

    const answerCells: readonly AnswerCellKeyValue[] =
      myUserId === undefined || eventList === undefined
        ? []
        : eventList.flatMap((eventItem) => {
            const editable = !eventIsAfterDeadline(eventItem.eventSchedule);

            const myAnswer = eventItem.answers.find(
              (a) => a.user.id === myUserId,
            );

            return (
              myAnswer?.selection.map((sel): AnswerCellKeyValue =>
                tp(
                  {
                    datetimeRange: sel.datetimeRange,
                    eventId: eventItem.eventScheduleMetadata.id,
                  },
                  {
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
                  },
                ),
              ) ?? []
            );
          });

    return IMapMapped.create(
      answerCells,
      toBatchUpdateTableCellKey,
      fromBatchUpdateTableCellKey,
    );
  };

  const tableValueMap$: InitializedObservable<BatchUpdateTableCellMap> =
    combine(tp(deps.eventList$, deps.fireAuthUser$)).pipe(
      map(([eventList, fireAuthUser]) =>
        eventListToBatchUpdateTableCellMap(
          eventList,
          fireAuthUser === undefined
            ? undefined
            : UserId.cast(fireAuthUser.uid),
        ),
      ),
    );

  /**
   * Marks the cell to be given the batch input's value, or unmarks it when its
   * answer already has that value.
   */
  const setBatchUpdateTableCellState = (pos: BatchUpdateTableCellPos): void => {
    const curr = Optional.toNullable(
      tableValueMap$.getSnapshot().value.get(pos),
    );

    const newValue = getBatchInputFormStateSnapshot();

    updateNewAnswerMap((state) =>
      curr?.iconId === newValue.selectedIconId &&
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

  const tableBodyValues$: InitializedObservable<
    readonly BatchUpdateTableBodyRow[]
  > = combine(tp(deps.eventList$, tableValueMap$)).pipe(
    map(([eventList, tableValueMap]) =>
      eventListToBatchUpdateTableBodyValues(eventList, tableValueMap),
    ),
  );

  return {
    editing$,
    useEditing,
    startEditing,
    exitEditing,
    batchInputFormState$,
    useBatchInputFormState,
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
};
