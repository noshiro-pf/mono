import { ymdhm2strWithDay } from '../../constants';
import { eventIsAfterDeadline } from '../../functions';
import { Description } from '../atoms';
import { AnswerPageNotes } from './answer-page-notes';

const dc = dict.answerPage;

type Props = Readonly<{
  eventSchedule: EventSchedule;
}>;

export const AnswerPageEventInfo = memoNamed<Props>(
  'AnswerPageEventInfo',
  ({ eventSchedule }) => {
    const afterDeadline = useMemo(
      () => eventIsAfterDeadline(eventSchedule),
      [eventSchedule]
    );

    return (
      <div
        css={css`
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: repeat(3, auto);
          grid-template-areas:
            'label1 value1'
            'label2 value2'
            'label3 value3';
        `}
      >
        <TableLabel
          css={css`
            grid-area: label1;
          `}
        >
          {dc.eventInfo.eventName}
        </TableLabel>
        <TableValue
          css={css`
            grid-area: value1;
          `}
        >
          {eventSchedule.title}
        </TableValue>
        <TableLabel
          css={css`
            grid-area: label2;
          `}
        >
          {dc.eventInfo.notes}
        </TableLabel>
        <TableValue
          css={css`
            grid-area: value2;
            white-space: pre-wrap;
          `}
        >
          <AnswerPageNotes notes={eventSchedule.notes} />
        </TableValue>
        <TableLabel
          css={css`
            grid-area: label3;
          `}
        >
          {dc.eventInfo.answerDeadline}
        </TableLabel>
        <TableValue
          css={css`
            grid-area: value3;
          `}
        >
          {eventSchedule.answerDeadline === 'none' ? (
            <div>{dict.answerPage.eventInfo.noAnswerDeadline}</div>
          ) : (
            <>
              <div>{ymdhm2strWithDay(eventSchedule.answerDeadline)}</div>
              <Description
                error={afterDeadline}
                text={
                  afterDeadline
                    ? dc.eventInfo.answerDeadlineIsExpired
                    : dc.eventInfo.answerDeadlineDescription
                }
              />
            </>
          )}
        </TableValue>
      </div>
    );
  }
);

const TableCell = styled.div`
  padding-top: 3px;
  padding-bottom: 3px;
  text-align: left;
  vertical-align: text-top;
`;

const TableLabel = styled(TableCell)`
  grid-area: label;
  white-space: nowrap;
  padding-right: 10px;
  font-weight: bolder;
`;

const TableValue = styled(TableCell)`
  grid-area: value;
  white-space: pre-line;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
