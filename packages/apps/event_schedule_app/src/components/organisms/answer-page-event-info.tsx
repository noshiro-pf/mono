import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { dict } from '../../constants';
import { ymdhm2strWithDay } from '../../functions';
import { Description } from '../atoms';
import { AnswerPageNotes } from './answer-page-notes';

const dc = dict.answerPage;

type Props = Readonly<{
  eventSchedule: EventSchedule;
  isExpired: boolean;
}>;

export const AnswerPageEventInfo = memoNamed<Props>(
  'AnswerPageEventInfo',
  ({ eventSchedule, isExpired }) => (
    <Container>
      <TableLabel1>{dc.eventInfo.eventName}</TableLabel1>
      <TableValue1>{eventSchedule.title}</TableValue1>
      <TableLabel2>{dc.eventInfo.notes}</TableLabel2>
      <TableValue2>
        <AnswerPageNotes notes={eventSchedule.notes} />
      </TableValue2>
      <TableLabel3>{dc.eventInfo.answerDeadline}</TableLabel3>
      <TableValue3>
        {eventSchedule.answerDeadline !== 'none' ? (
          <>
            <div>{ymdhm2strWithDay(eventSchedule.answerDeadline)}</div>
            <Description
              error={isExpired}
              text={
                isExpired
                  ? dc.eventInfo.answerDeadlineIsExpired
                  : dc.eventInfo.answerDeadlineDescription
              }
            />
          </>
        ) : (
          <div>{dict.answerPage.eventInfo.noAnswerDeadline}</div>
        )}
      </TableValue3>
    </Container>
  )
);

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: repeat(3, auto);
  grid-template-areas:
    'label1 value1'
    'label2 value2'
    'label3 value3';
`;

const TableLabel = styled.div`
  grid-area: label;
  text-align: left;
  vertical-align: text-top;
  white-space: nowrap;
  padding-bottom: 5px;
  padding-right: 10px;
  font-weight: bolder;
`;

const TableLabel1 = styled(TableLabel)`
  grid-area: label1;
`;
const TableLabel2 = styled(TableLabel)`
  grid-area: label2;
`;
const TableLabel3 = styled(TableLabel)`
  grid-area: label3;
`;

const TableValue = styled.div`
  grid-area: value;
  text-align: left;
  vertical-align: text-top;
  white-space: pre-line;
  padding-bottom: 10px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableValue1 = styled(TableValue)`
  grid-area: value1;
`;
const TableValue2 = styled(TableValue)`
  grid-area: value2;
`;
const TableValue3 = styled(TableValue)`
  grid-area: value3;
`;
