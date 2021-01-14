import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { IEventSchedule } from '../../types/record/event-schedule';
import { createIYmdHm } from '../../types/record/ymd-hm';
import { ymdhm2strWithDay } from '../../utils/ymdhm2str';
import { Description } from '../atoms/description';

const vt = texts.answerPage;

interface Props {
  eventSchedule: IEventSchedule;
  isExpired: boolean;
}

export const AnswerPageEventInfo = memoNamed<Props>(
  'AnswerPageEventInfo',
  ({ eventSchedule, isExpired }) => {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <Title>{vt.eventInfo.eventName}</Title>
              <Content>{eventSchedule.title}</Content>
            </tr>
            <tr>
              <Title>{vt.eventInfo.notes}</Title>
              <Content>{eventSchedule.notes}</Content>
            </tr>
            <tr>
              <Title>{vt.eventInfo.answerDeadline}</Title>
              <Content>
                {eventSchedule.useAnswerDeadline ? (
                  <>
                    <div>
                      {ymdhm2strWithDay(
                        eventSchedule.answerDeadline ?? createIYmdHm()
                      )}
                    </div>
                    <Description
                      error={isExpired}
                      text={
                        isExpired
                          ? vt.eventInfo.answerDeadlineIsExpired
                          : vt.eventInfo.answerDeadlineDescription
                      }
                    />
                  </>
                ) : (
                  <div>{texts.answerPage.eventInfo.noAnswerDeadline}</div>
                )}
              </Content>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

const Title = styled.th`
  text-align: left;
  vertical-align: text-top;
  white-space: nowrap;
  padding-bottom: 5px;
  padding-right: 10px;
`;

const Content = styled.td`
  text-align: left;
  vertical-align: text-top;
  white-space: pre-line;
  padding-bottom: 10px;
`;
