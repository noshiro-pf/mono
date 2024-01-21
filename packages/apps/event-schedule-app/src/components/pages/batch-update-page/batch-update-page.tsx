/* eslint-disable react/forbid-component-props */
import { Button, Card, Spinner } from '@blueprintjs/core';
import { Routes } from '../../../constants';
import {
  Auth,
  BatchUpdateAnswersStore,
  EventListStore,
  Router,
  eventList$,
  holidaysJpDefinition$,
} from '../../../store';
import { type BatchUpdateTableBodyRow } from '../../../types';
import { BpAnchorButtonOverflowHidden } from '../../atoms';
import { HTMLTableBorderedStyled2 } from '../../bp';
import {
  BatchInputFormShared,
  DatetimeRangeCell,
  Header,
} from '../../organisms';
import { editingModeTextColor } from './color';
import { CustomIconReadonlyOrButton } from './icon-button-switchable';

const dc = dict.batchUpdatePage;

export const BatchUpdatePage = memoNamed('BatchUpdatePage', () => {
  useEffect(() => {
    EventListStore.fetchEventList();
  }, []);

  const holidaysJpDefinition = useObservableValue(holidaysJpDefinition$);

  const eventList = useObservableValue(eventList$);

  const eventListWithHandler = useMemo(
    () =>
      eventList?.map((e) =>
        Obj.merge(e, {
          href: Routes.routes.answerPage(e.eventScheduleMetadata.id),
        }),
      ),
    [eventList],
  );

  const fireAuthUser = Auth.useFireAuthUser();

  const myUserId = fireAuthUser?.uid;

  const tableBodyValuesWithState: readonly BatchUpdateTableBodyRow[] =
    useObservableValue(BatchUpdateAnswersStore.tableBodyValues$);

  const refreshButtonIsDisabled = useObservableValue(
    EventListStore.refreshButtonIsDisabled$,
  );

  const refreshButtonIsLoading = useObservableValue(
    EventListStore.refreshButtonIsLoading$,
  );

  const editing = useObservableValue(BatchUpdateAnswersStore.editing$);

  const { comment, point, selectedIconId } = useObservableValue(
    BatchUpdateAnswersStore.batchInputFormState$,
  );

  const onClick = useRouterLinkClick({
    replace: false,
    pushFn: Router.push,
    redirectFn: Router.redirect,
  });

  return (
    <div>
      <Header isBatchUpdatePage={true} title={dc.title} />
      {eventListWithHandler === undefined || myUserId === undefined ? (
        <Spinner />
      ) : (
        <div
          css={css`
            margin: 0 20px;
            overflow: auto;
          `}
        >
          <div
            css={css`
              margin: 5px 0;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-wrap: nowrap;
                align-items: center;

                > * {
                  margin: 5px 2px;
                }
              `}
            >
              <Button
                disabled={refreshButtonIsDisabled}
                icon={'refresh'}
                intent={'none'}
                loading={refreshButtonIsLoading}
                onClick={EventListStore.refreshEventList}
              >
                {dc.refresh}
              </Button>

              <Button
                disabled={refreshButtonIsDisabled}
                icon={'edit'}
                intent={'success'}
                loading={refreshButtonIsLoading}
                onClick={
                  editing
                    ? BatchUpdateAnswersStore.exitEditing
                    : BatchUpdateAnswersStore.startEditing
                }
              >
                {editing ? dc.exitEditing : dc.edit}
              </Button>
            </div>

            {editing ? (
              <div
                css={css`
                  display: flex;
                `}
              >
                <Card
                  css={css`
                    margin: 2px;
                    padding: 3px;
                  `}
                >
                  <BatchInputFormShared
                    comment={comment}
                    point={point}
                    selectedIconId={selectedIconId}
                    setComment={BatchUpdateAnswersStore.setComment}
                    setFairPoint={BatchUpdateAnswersStore.setPoint}
                    onFairClick={BatchUpdateAnswersStore.onFairClick}
                    onGoodClick={BatchUpdateAnswersStore.onGoodClick}
                    onPoorClick={BatchUpdateAnswersStore.onPoorClick}
                  />
                </Card>
              </div>
            ) : undefined}
          </div>

          <div
            css={css`
              display: flex;
            `}
          >
            <Card elevation={1}>
              <StickyHeaderTable>
                <thead>
                  <tr>
                    <th className='sticky horizontal'>
                      <TableTopLeftCell>
                        <DatetimeHeaderCell>
                          <PaddedSpan>{dc.datetime}</PaddedSpan>
                        </DatetimeHeaderCell>
                      </TableTopLeftCell>
                    </th>

                    {eventListWithHandler.map((eventItem) => (
                      <TableHeaderCellStyled
                        key={eventItem.eventScheduleMetadata.id}
                      >
                        {editing ? (
                          eventItem.eventSchedule.title
                        ) : (
                          <BpAnchorButtonOverflowHidden
                            href={eventItem.href}
                            minimal={true}
                            title={eventItem.eventSchedule.title}
                            onClick={onClick}
                          >
                            {eventItem.eventSchedule.title}
                          </BpAnchorButtonOverflowHidden>
                        )}
                      </TableHeaderCellStyled>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableBodyValuesWithState.map((row) => (
                    <tr key={row.rowKey}>
                      <td className='sticky horizontal'>
                        <DatetimeRangeCell
                          datetimeRange={row.datetimeRange}
                          datetimeSpecification={row.datetimeSpecification}
                          holidaysJpDefinition={holidaysJpDefinition}
                          minimized={false}
                        />
                      </td>

                      {row.cells.map((cell, i) => (
                        <TableCellStyled
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          className={`${selectedIconId} ${editing ? 'editing' : ''} ${cell !== undefined && cell.iconId !== 'none' && cell.editable ? 'editable' : ''}`}
                          title={
                            editing &&
                            cell !== undefined &&
                            cell.iconId !== 'none' &&
                            !cell.editable
                              ? dc.isReadonly
                              : undefined
                          }
                        >
                          {cell === undefined || cell.iconId === 'none' ? (
                            ''
                          ) : (
                            <AnswerIconCell>
                              <IconAndString>
                                <CustomIconReadonlyOrButton
                                  editable={cell.editable}
                                  iconId={cell.iconId}
                                  mode={
                                    editing && cell.editable
                                      ? 'button'
                                      : 'readonly'
                                  }
                                  point={cell.point}
                                  showPoint={cell.showPoint}
                                  weight={cell.weight}
                                  onClick={cell.onClick}
                                />
                              </IconAndString>
                            </AnswerIconCell>
                          )}
                        </TableCellStyled>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </StickyHeaderTable>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
});

const iconCursorSize = 16;
const iconCursorStyle = {
  color: 'blue',
  size: iconCursorSize,
  offsetX: iconCursorSize / 2,
  offsetY: iconCursorSize / 2,
} as const;

const userNameWrapperWidth = 80;

const PaddedSpan = styled.span`
  margin: 0 5px;
`;

const AnswerIconCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconAndString = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Centering = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StickyHeaderTable = styled(HTMLTableBorderedStyled2)`
  .sticky {
    position: sticky;
    z-index: 1;
    background-color: white;

    &.horizontal {
      left: 0;
    }
  }

  &.minimized {
    td,
    th {
      padding: 5px;
    }
  }
`;

const TableTopLeftCell = styled.div`
  display: flex;
  align-items: center;
`;

const DatetimeHeaderCell = styled(Centering)`
  flex: 1;
`;

// https://yoksel.github.io/url-encoder/ で assets/icon_svg 以下の svg をエンコード

const tableCellStyle = css`
  min-width: ${userNameWrapperWidth}px;
  max-width: ${userNameWrapperWidth}px;
  overflow-x: hidden;
  padding: 5px;
  position: relative;
`;

const TableHeaderCellStyled = styled.th`
  ${tableCellStyle}
`;

const TableCellStyled = styled.td`
  ${tableCellStyle}

  &.poor {
    cursor:
      url("data:image/svg+xml,%3Csvg width='${iconCursorStyle.size}' height='${iconCursorStyle.size}' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M31.6464 2.63927C31.8417 2.44401 31.8417 2.12742 31.6464 1.93216L30.0678 0.353553C29.8726 0.158291 29.556 0.158291 29.3607 0.353553L16 13.7143L2.63927 0.353553C2.44401 0.158291 2.12742 0.158291 1.93216 0.353553L0.353553 1.93216C0.158291 2.12742 0.158291 2.44401 0.353553 2.63927L13.7143 16L0.353553 29.3607C0.158291 29.556 0.158291 29.8726 0.353553 30.0678L1.93216 31.6464C2.12742 31.8417 2.44401 31.8417 2.63927 31.6464L16 18.2857L29.3607 31.6464C29.556 31.8417 29.8726 31.8417 30.0678 31.6464L31.6464 30.0678C31.8417 29.8726 31.8417 29.556 31.6464 29.3607L18.2857 16L31.6464 2.63927Z' fill='${iconCursorStyle.color}'/%3E%3C/svg%3E%0A")
        ${iconCursorStyle.offsetX} ${iconCursorStyle.offsetY},
      pointer;
  }

  &.fair {
    cursor:
      url("data:image/svg+xml,%3Csvg width='${iconCursorStyle.size}' height='${iconCursorStyle.size}' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0)'%3E%3Cpath d='M30.5202 30.0507L30.512 30.0507L1.47986 30.0507C0.951413 30.0507 0.462572 29.7687 0.198244 29.3108C-0.0660844 28.8529 -0.0660145 28.2889 0.198244 27.831L14.7143 2.68902C14.9786 2.23105 15.4674 1.94905 15.996 1.94905C16.5244 1.94905 17.0131 2.23105 17.2774 2.68902L31.722 27.7063C31.897 27.9495 32 28.2478 32 28.5709C32 29.3882 31.3376 30.0507 30.5202 30.0507ZM3.60223 27.0911L27.9489 27.0911L15.996 6.3885L3.60223 27.0911Z' fill='${iconCursorStyle.color}'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0'%3E%3Crect width='32' height='32' fill='white' transform='translate(32 32) rotate(-180)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A")
        ${iconCursorStyle.offsetX} ${iconCursorStyle.offsetY},
      pointer;
  }

  &.good {
    cursor:
      url("data:image/svg+xml,%3Csvg width='${iconCursorStyle.size}' height='${iconCursorStyle.size}' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 32C7.17775 32 0 24.8223 0 16C0 7.17775 7.17775 0 16 0C24.8223 0 32 7.17775 32 16C32 24.8223 24.8223 32 16 32ZM16 3.2C8.2803 3.2 3.2 8.28128 3.2 16C3.2 23.7187 8.2803 28.8 16 28.8C23.7197 28.8 28.8 23.7187 28.8 16C28.8 8.28128 23.7197 3.2 16 3.2Z' fill='${iconCursorStyle.color}'/%3E%3C/svg%3E%0A")
        ${iconCursorStyle.offsetX} ${iconCursorStyle.offsetY},
      pointer;
  }

  &.editing {
    &:not(.editable) {
      cursor: not-allowed;
      background-color: #efefef;
      color: ${editingModeTextColor};
    }
  }
`;
