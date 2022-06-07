import { Button } from '@blueprintjs/core';
import {
  AnswerTableFilteringAndSortingManager,
  onAnswerClick,
  tableBodyValuesFiltered$,
} from '../../../store';
import { CustomIcon, RequiredParticipantIcon } from '../../atoms';
import { HTMLTableBorderedStyled } from '../../bp';
import { CommentButton } from './comment-button';
import { DatetimeRangeCell } from './datetime-range-cell';
import { FilterByIconPopover } from './filter-by-icon-popover';
import { SortButton } from './sort-button';

const dc = dict.answerPage.answers;

type Props = Readonly<{
  datetimeSpecification: EventSchedule['datetimeSpecification'];
  answers: readonly Answer[];
  editAnswerButtonIsDisabled: boolean;
}>;

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({ datetimeSpecification, answers, editAnswerButtonIsDisabled }) => {
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
            onAnswerClick(a);
          },
        })),
      [answers]
    );

    const tableBodyValuesFiltered = useObservableValue(
      tableBodyValuesFiltered$
    );

    return (
      <HTMLTableBorderedStyled>
        <thead>
          <tr>
            <th>
              <PaddedSpan>{dc.datetime}</PaddedSpan>
              <SortButton
                onSortChange={
                  AnswerTableFilteringAndSortingManager.onDatetimeSortChange
                }
              />
            </th>
            <th>
              <PaddedSpan>{dc.score}</PaddedSpan>
              <SortButton
                onSortChange={
                  AnswerTableFilteringAndSortingManager.onScoreSortChange
                }
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
              <th key={answer.id} style={noPadStyle}>
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
                <td>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={datetimeSpecification}
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
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={i}>
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
                            {weight !== 1 ? (
                              <WeightValue>
                                <WeightTimes>{dc.times}</WeightTimes>
                                <div>{weight}</div>
                              </WeightValue>
                            ) : undefined}
                          </IconAndString>
                          <CellCommentWrapper>
                            {comment === '' ? undefined : (
                              <CommentButton
                                comment={comment}
                                useSmallButton={true}
                              />
                            )}
                          </CellCommentWrapper>
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
            <td>{dc.comment}</td>

            {/* spacer */}
            <td />

            {/* spacer - icons */}
            <td />
            <td />
            <td />

            {answersWithHandler.map((answer) => (
              <td key={answer.id} style={noPadStyle}>
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
      </HTMLTableBorderedStyled>
    );
  }
);

const userNameWrapperWidth = 80;

const noPadStyle: CSSProperties = {
  minWidth: `${userNameWrapperWidth}px`,
  maxWidth: `${userNameWrapperWidth}px`,
  overflowX: 'hidden',
  padding: '5px',
  position: 'relative',
} as const;

const RequiredParticipantIconStyled = styled.div`
  position: absolute;
  top: -5px;
  left: 5px;
`;

const BpButtonOverflowHidden = styled(Button)`
  overflow-x: hidden;
`;

const SummaryCellStyle = styled.div`
  vertical-align: baseline;
`;

const SummaryCellUnit = styled.span`
  font-size: x-small;
`;

const PaddedSpan = styled.span`
  margin-right: 5px;
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
