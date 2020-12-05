import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { IEventSchedule } from '../../types/record/event-schedule';
import { ymdhm2strWithDay } from '../../utils/ymdhm2str';
import { Description } from '../atoms/description';

const vt = texts.answerPage;

interface Props {
  eventSchedule: IEventSchedule;
  isExpired: boolean;
}

export const AnswerPageEventInfo = memoNamed<Props>(
  'AnswerPageEventInfo',
  (props: Props) => (
    <div>
      <table>
        <tbody>
          <tr>
            <Title>{vt.eventInfo.eventName}</Title>
            <Content>{props.eventSchedule.title}</Content>
          </tr>
          <tr>
            <Title>{vt.eventInfo.notes}</Title>
            <Content>{props.eventSchedule.notes}</Content>
          </tr>
          {props.eventSchedule.useAnswerDeadline ? (
            <tr>
              <Title>{vt.eventInfo.answerDeadline}</Title>
              <Content>
                {ymdhm2strWithDay(props.eventSchedule.answerDeadline)}
                <Description
                  error={props.isExpired}
                  text={
                    props.isExpired
                      ? vt.eventInfo.answerDeadlineIsExpired
                      : vt.eventInfo.answerDeadlineDescription
                  }
                />
              </Content>
            </tr>
          ) : undefined}
        </tbody>
      </table>
    </div>
  )
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
