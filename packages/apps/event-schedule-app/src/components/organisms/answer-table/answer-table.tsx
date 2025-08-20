import { HTMLTableBorderedStyled2 } from '@noshiro/react-blueprintjs-utils';
import {
  AnswerFilterAndSortStore,
  AnswerPageStore,
  AnswerTableStore,
} from '../../../store';
import {
  BpButtonOverflowHidden,
  CustomIcon,
  RequiredParticipantIcon,
} from '../../atoms';
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
      > &
        Readonly<{ onClick: () => void }>)[]
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
      [answers],
    );

    const tableBodyValuesFiltered = useObservableValue(
      AnswerTableStore.tableBodyValuesFiltered$,
    );

    const dateStringIsMinimized = AnswerTableStore.useDateStringIsMinimized();

    const answerIconIsHidden = AnswerTableStore.useAnswerIconIsHidden();

    const tableMinimized = AnswerTableStore.useTableIsMinimized();

    return (
      <StickyHeaderTable
        // eslint-disable-next-line react/forbid-component-props
        className={tableMinimized ? 'minimized' : ''}
      >
        <thead>
          <tr>
            <th className={'sticky horizontal'}>
              <TableTopLeftCell>
                <DatetimeHeaderCell>
                  {tableMinimized || dateStringIsMinimized ? undefined : (
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
              {tableMinimized || dateStringIsMinimized ? undefined : (
                <PaddedSpan>{dc.score}</PaddedSpan>
              )}
              <SortButton
                onSortChange={AnswerFilterAndSortStore.onScoreSortOrderChange}
              />
            </th>

            {/* icons */}

            {answerIconIsHidden ? undefined : (
              <>
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
              </>
            )}

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
                <td className={'sticky horizontal'}>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={datetimeSpecification}
                    holidaysJpDefinition={holidaysJpDefinition}
                    minimized={tableMinimized || dateStringIsMinimized}
                  />
                </td>
                <td>
                  <span>{Num.roundBy(2, score)}</span>
                </td>
                {answerIconIsHidden ? undefined : (
                  <>
                    {answerSummaryRow?.map((s, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <td key={i}>
                        <SummaryCellStyle>
                          <span>{s}</span>
                          <SummaryCellUnit>{dc.numAnswersUnit}</SummaryCellUnit>
                        </SummaryCellStyle>
                      </td>
                    ))}
                  </>
                )}
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
                  ),
                )}
              </tr>
            ),
          )}

          {/* コメント行 */}
          <tr>
            <td className={'sticky horizontal'}>{dc.comment}</td>

            {/* spacer */}
            <td />

            {/* spacer - icons */}
            {answerIconIsHidden ? undefined : (
              <>
                <td />
                <td />
                <td />
              </>
            )}

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
  },
);

const userNameWrapperWidth = 80;
const userNameWrapperThinWidth = 60;

const answerCellStyle = {
  minWidth: `${userNameWrapperWidth}px`,
  maxWidth: `${userNameWrapperWidth}px`,
  overflowX: 'hidden',
  padding: '5px',
  position: 'relative',
} as const satisfies React.CSSProperties;

const answerCellThinStyle = {
  minWidth: `${userNameWrapperThinWidth}px`,
  maxWidth: `${userNameWrapperThinWidth}px`,
  overflowX: 'hidden',
  padding: '3px',
  position: 'relative',
} as const satisfies React.CSSProperties;

const RequiredParticipantIconStyled = styled.div`
  position: absolute;
  top: -5px;
  left: 5px;
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

const DatetimeHeaderCell = styled(Centering)`
  flex: 1;
`;
