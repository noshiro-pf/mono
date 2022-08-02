import { Button } from '@blueprintjs/core';
import {
  AnswerFilterAndSortStore,
  AnswerPageStore,
  AnswerTableStore,
} from '../../../store';
import { CustomIcon, RequiredParticipantIcon } from '../../atoms';
import { HTMLTableBorderedStyled2 } from '../../bp';
import { CommentButton } from './comment-button';
import { DatetimeRangeCell } from './datetime-range-cell';
import { FilterByIconPopover } from './filter-by-icon-popover';
import { SortButton } from './sort-button';

const dc = dict.answerPage.answers;

type Props = Readonly<{
  datetimeSpecification: EventSchedule['datetimeSpecification'];
  answers: readonly Answer[];
  editAnswerButtonIsDisabled: boolean;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({
    datetimeSpecification,
    answers,
    editAnswerButtonIsDisabled,
    holidaysJpDefinition,
  }) => {
    const answersWithHandler = useMemo<
      readonly (Pick<
        Answer,
        'comment' | 'id' | 'isRequiredParticipants' | 'user' | 'weight'
      > & {
        readonly onClick: () => void;
      })[]
    >(
      () =>
        answers.map((a) => ({
          id: a.id,
          user: a.user,
          comment: a.comment,
          weight: a.weight,
          isRequiredParticipants: a.isRequiredParticipants,
          onClick: () => {
            AnswerPageStore.onAnswerClick(a);
          },
        })),
      [answers]
    );

    const tableBodyValuesFiltered = useObservableValue(
      AnswerTableStore.tableBodyValuesFiltered$
    );

    const tableMinimized = useObservableValue(AnswerTableStore.tableMinimized$);

    return (
      <StickyHeaderTable
        // eslint-disable-next-line react/forbid-component-props
        className={tableMinimized ? 'minimized' : ''}
      >
        <thead>
          <tr>
            <th className='sticky horizontal'>
              <TableTopLeftCell>
                <MinimizeTableButton>
                  <Button
                    icon={tableMinimized ? 'maximize' : 'minimize'}
                    minimal={true}
                    outlined={true}
                    onClick={
                      tableMinimized
                        ? AnswerTableStore.maximizeTable
                        : AnswerTableStore.minimizeTable
                    }
                  />
                </MinimizeTableButton>
                <DatetimeHeaderCell>
                  {tableMinimized ? undefined : (
                    <PaddedSpan>{dc.datetime}</PaddedSpan>
                  )}
                  <SortButton
                    onSortChange={
                      AnswerFilterAndSortStore.onDatetimeSortOrderChange
                    }
                  />
                </DatetimeHeaderCell>
              </TableTopLeftCell>
            </th>
            <th>
              {tableMinimized ? undefined : <PaddedSpan>{dc.score}</PaddedSpan>}
              <SortButton
                onSortChange={AnswerFilterAndSortStore.onScoreSortOrderChange}
              />
            </th>

            {/* icons */}

            <IconHeaderCell>
              <Centering>
                <FilterByIconPopover answerIconId={'good'} />
              </Centering>
            </IconHeaderCell>
            <IconHeaderCell>
              <Centering>
                <FilterByIconPopover answerIconId={'fair'} />
              </Centering>
            </IconHeaderCell>
            <IconHeaderCell>
              <Centering>
                <FilterByIconPopover answerIconId={'poor'} />
              </Centering>
            </IconHeaderCell>

            {answersWithHandler.map((answer) => (
              <th
                key={answer.id}
                style={tableMinimized ? answerCellThinStyle : answerCellStyle}
              >
                {editAnswerButtonIsDisabled ? (
                  answer.user.name
                ) : (
                  <BpButtonOverflowHidden
                    minimal={true}
                    title={answer.user.name}
                    onClick={answer.onClick}
                  >
                    {answer.user.name}
                  </BpButtonOverflowHidden>
                )}
                {answer.isRequiredParticipants ? (
                  <RequiredParticipantIconStyled>
                    <RequiredParticipantIcon />
                  </RequiredParticipantIconStyled>
                ) : undefined}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableBodyValuesFiltered.map(
            ({
              key,
              datetimeRange,
              score,
              answerSummaryRow,
              answerTableRow,
              style,
            }) => (
              <tr key={key} style={style}>
                <td className='sticky horizontal'>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={datetimeSpecification}
                    holidaysJpDefinition={holidaysJpDefinition}
                    tableMinimized={tableMinimized}
                  />
                </td>
                <td>
                  <span>{Num.roundBy(2, score)}</span>
                </td>
                {answerSummaryRow?.map((s, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={i}>
                    <SummaryCellStyle>
                      <span>{s}</span>
                      <SummaryCellUnit>{dc.numAnswersUnit}</SummaryCellUnit>
                    </SummaryCellStyle>
                  </td>
                ))}
                {answerTableRow?.map(
                  ({ iconId, point, showPoint, weight, comment }, i) => (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      style={
                        tableMinimized ? answerCellThinStyle : answerCellStyle
                      }
                    >
                      {iconId === 'none' ? (
                        ''
                      ) : (
                        <AnswerIconCell>
                          <IconAndString>
                            <CustomIcon iconName={iconId} />
                            {showPoint ? (
                              <CustomPointValue>
                                {`${dict.common.brace.start}${point}${dict.common.brace.end}`}
                              </CustomPointValue>
                            ) : undefined}
                            {weight === 1 || tableMinimized ? undefined : (
                              <WeightValue>
                                <WeightTimes>{dc.times}</WeightTimes>
                                <div>{weight}</div>
                              </WeightValue>
                            )}
                          </IconAndString>
                          {comment === '' || tableMinimized ? undefined : (
                            <CellCommentWrapper>
                              <CommentButton
                                comment={comment}
                                useSmallButton={true}
                              />
                            </CellCommentWrapper>
                          )}
                        </AnswerIconCell>
                      )}
                    </td>
                  )
                )}
              </tr>
            )
          )}

          {/* コメント行 */}
          <tr>
            <td className='sticky horizontal'>{dc.comment}</td>

            {/* spacer */}
            <td />

            {/* spacer - icons */}
            <td />
            <td />
            <td />

            {answersWithHandler.map((answer) => (
              <td
                key={answer.id}
                style={tableMinimized ? answerCellThinStyle : answerCellStyle}
              >
                <div>
                  {answer.comment === '' ? (
                    ''
                  ) : (
                    <CommentButton comment={answer.comment} />
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </StickyHeaderTable>
    );
  }
);

const userNameWrapperWidth = 80;
const userNameWrapperThinWidth = 45;

const answerCellStyle: CSSProperties = {
  minWidth: `${userNameWrapperWidth}px`,
  maxWidth: `${userNameWrapperWidth}px`,
  overflowX: 'hidden',
  padding: '5px',
  position: 'relative',
} as const;

const answerCellThinStyle: CSSProperties = {
  minWidth: `${userNameWrapperThinWidth}px`,
  maxWidth: `${userNameWrapperThinWidth}px`,
  overflowX: 'hidden',
  padding: '3px',
  position: 'relative',
} as const;

const RequiredParticipantIconStyled = styled.div`
  position: absolute;
  top: -5px;
  left: 5px;
`;

const BpButtonOverflowHidden = styled(Button)`
  max-width: 100%;
  overflow-x: hidden;
`;

const SummaryCellStyle = styled.div`
  vertical-align: baseline;
`;

const SummaryCellUnit = styled.span`
  font-size: x-small;
`;

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

const CustomPointValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;
`;

const WeightValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;
`;

const WeightTimes = styled.span`
  margin: 0 1px;
`;

const CellCommentWrapper = styled.span`
  margin-left: 3px;
`;

const IconHeaderCell = styled.th`
  padding: 0 !important;
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
const MinimizeTableButton = styled.div`
  flex: 0;
`;
const DatetimeHeaderCell = styled(Centering)`
  flex: 1;
`;
