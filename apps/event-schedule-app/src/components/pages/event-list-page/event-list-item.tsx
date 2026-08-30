import styled from '@emotion/styled';
import { type EventListItem } from 'event-schedule-app-shared';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr, Optional } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import {
  errorFontColor,
  eventListItemTextColor,
  Routes,
  ymd2str,
  ymdhm2strWithDay,
} from '../../../constants/index.mjs';
import { eventIsAfterDeadline } from '../../../functions/index.mjs';
import { Router } from '../../../store/index.mjs';
import { match } from '../../../utils-ported/index.mjs';
import { SectionTitle } from '../../atoms/index.mjs';
import { ArchiveEventButton } from '../../organisms/index.mjs';

const dc = dict.eventListPage;

type Props = Readonly<{
  eventListItem: EventListItem;
  fireAuthUser: FireAuthUser | undefined;
  archiveOrUnArchive: 'archive' | 'unarchive';
  onConfirmArchiving: () => void;
  onConfirmUnArchiving: () => void;
}>;

export const EventListItemComponent = memoNamed<Props>(
  'EventListItem',
  ({
    eventListItem: {
      eventSchedule,
      eventScheduleMetadata,
      answers,
      answersMetadata,
    },
    fireAuthUser,
    archiveOrUnArchive,
    onConfirmArchiving,
    onConfirmUnArchiving,
  }) => {
    const { id: eventId, updatedAt } = eventScheduleMetadata;

    const { lastUpdate } = answersMetadata;

    const onLinkClick = React.useCallback(() => {
      Router.push(Routes.routes.answerPage(eventId));
    }, [eventId]);

    const hasUnanswered = React.useMemo<boolean>(
      () =>
        fireAuthUser === undefined
          ? false
          : (answers
              .find(({ user }) => user.id === fireAuthUser.uid)
              ?.selection.some((a) => a.iconId === 'none') ?? false),
      [answers, fireAuthUser],
    );

    const afterDeadline = React.useMemo(
      () => eventIsAfterDeadline(eventSchedule),
      [eventSchedule],
    );

    const authorName = React.useMemo<string>(
      () =>
        eventSchedule.author.name === ''
          ? dc.listItem.anonymous
          : eventSchedule.author.name,
      [eventSchedule.author.name],
    );

    const datetimeOptionsSummary = React.useMemo<string>(
      () =>
        `${ymd2str(Optional.unwrapThrow(Arr.first(eventSchedule.datetimeRangeList)).ymd)} ${dict.common.tilde} ${ymd2str(Optional.unwrapThrow(Arr.last(eventSchedule.datetimeRangeList)).ymd)}`,
      [eventSchedule.datetimeRangeList],
    );

    const lastUpdateStr = React.useMemo<string>(() => {
      const answerLastUpdate = DateUtils.from(lastUpdate);

      const eventLastUpdate = DateUtils.from(updatedAt);

      return lastUpdate === '' ||
        answerLastUpdate.getTime() < eventLastUpdate.getTime()
        ? eventLastUpdate.toLocaleString()
        : answerLastUpdate.toLocaleString();
    }, [lastUpdate, updatedAt]);

    const archiveEventButtonHandler = React.useMemo(
      () =>
        match(archiveOrUnArchive, {
          archive: onConfirmArchiving,
          unarchive: onConfirmUnArchiving,
        }),
      [archiveOrUnArchive, onConfirmArchiving, onConfirmUnArchiving],
    );

    return (
      <ListItem onClick={onLinkClick}>
        <Header>
          <SectionTitleFlex title={dc.listItem.name(eventSchedule.title)}>
            {dc.listItem.name(eventSchedule.title)}
          </SectionTitleFlex>
          <Info>
            <UpdatedAtWrapper>
              <UpdatedAt>
                <span>
                  {dc.listItem.lastUpdate}
                  {dict.common.colon}
                </span>
                <span>{lastUpdateStr}</span>
              </UpdatedAt>
            </UpdatedAtWrapper>
            <ArchiveButtonWrapper>
              <ArchiveEventButton
                archiveOrUnArchive={archiveOrUnArchive}
                onConfirm={archiveEventButtonHandler}
              />
            </ArchiveButtonWrapper>
          </Info>
        </Header>
        <TableContainer>
          <TableLabel1>{dc.listItem.answerDeadline}</TableLabel1>
          <TableValue1>
            {eventSchedule.answerDeadline === 'none' ? (
              <div>{dict.answerPage.eventInfo.noAnswerDeadline}</div>
            ) : (
              <div>
                <span>{ymdhm2strWithDay(eventSchedule.answerDeadline)}</span>
                {afterDeadline ? (
                  <AlertText>
                    {`${dict.common.braceJp.start}${dc.listItem.expired}${dict.common.braceJp.end}`}
                  </AlertText>
                ) : undefined}
              </div>
            )}
          </TableValue1>
          <TableLabel2>{dc.listItem.datetimeOptions}</TableLabel2>
          <TableValue2>
            {datetimeOptionsSummary}
            {hasUnanswered ? (
              <AlertText>{dc.listItem.hasUnanswered}</AlertText>
            ) : undefined}
          </TableValue2>
          <TableLabel3>{dc.listItem.author}</TableLabel3>
          <TableValue3>{authorName}</TableValue3>
        </TableContainer>
      </ListItem>
    );
  },
);

const ListItem = styled.div`
  /* reset anchor element default styles */
  display: block;
  text-decoration: none;
  color: unset;

  /* .bp4-card */
  background-color: #fff;
  border-radius: 3px;
  padding: 18px;

  /* .bp4-elevation-1 */
  box-shadow:
    0 0 0 1px rgb(17 20 24 / 10%),
    0 0 0 rgb(17 20 24 / 0%),
    0 1px 1px rgb(17 20 24 / 20%);

  transition:
    transform 200ms cubic-bezier(0.4, 1, 0.75, 0.9),
    box-shadow 200ms cubic-bezier(0.4, 1, 0.75, 0.9),
    -webkit-transform 200ms cubic-bezier(0.4, 1, 0.75, 0.9),
    -webkit-box-shadow 200ms cubic-bezier(0.4, 1, 0.75, 0.9);

  /* .bp4-card.bp4-interactive:hover */
  &:hover {
    /* reset anchor element default styles */
    text-decoration: none;
    color: unset;

    box-shadow:
      0 0 0 1px rgb(17 20 24 / 10%),
      0 2px 4px rgb(17 20 24 / 20%),
      0 8px 24px rgb(17 20 24 / 20%);
    cursor: pointer;
  }
`;

const Header = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
`;

const SectionTitleFlex = styled(SectionTitle)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Info = styled.div`
  flex: 0;
  display: flex;
  align-items: center;
  color: ${eventListItemTextColor};
`;

const UpdatedAtWrapper = styled.div`
  flex: 1;
  margin-left: 40px;
  display: flex;
  justify-content: flex-end;
`;

const UpdatedAt = styled.div`
  display: flex;
  flex-wrap: wrap;
  white-space: nowrap;
  font-size: 0.75rem;
`;

const ArchiveButtonWrapper = styled.div`
  flex: 0;
  margin: 0 5px;
`;

const AlertText = styled.span`
  color: ${errorFontColor};
  white-space: nowrap;
`;

const TableContainer = styled.div`
  color: ${eventListItemTextColor};
  margin: 0 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: repeat(2, auto);
  grid-template-areas:
    'label1 value1'
    'label2 value2'
    'label3 value3';
  font-size: 12px;
`;

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
  font-weight: normal;
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

const TableValue = styled(TableCell)`
  grid-area: value;
  white-space: pre-line;
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
