import type { EventListItem } from 'event-schedule-app-shared';
import { constant, type JSX } from 'synstate-dom';
import { Arr, match, Optional } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import {
  dict,
  routes,
  ymd2str,
  ymdhm2strWithDay,
} from '../../../constants/index.mjs';
import { eventIsAfterDeadline } from '../../../functions/index.mjs';
import { Router } from '../../../store/index.mjs';
import { ArchiveEventButton } from '../../organisms/index.mjs';
import * as styles from './event-list-item.module.css';

const dc = dict.eventListPage;

type Props = Readonly<{
  eventListItem: EventListItem;
  fireAuthUser: FireAuthUser | undefined;
  archiveOrUnArchive: 'archive' | 'unarchive';
  onConfirmArchiving: () => void;
  onConfirmUnArchiving: () => void;
}>;

/** One event, drawn once: the list is drawn again when it is read again. */
export const EventListItemComponent = ({
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
}: Props): JSX.Element => {
  const { id: eventId, updatedAt } = eventScheduleMetadata;

  const { lastUpdate } = answersMetadata;

  const hasUnanswered: boolean =
    (fireAuthUser !== undefined &&
      answers
        .find(({ user }) => user.id === fireAuthUser.uid)
        ?.selection.some((a) => a.iconId === 'none')) ??
    false;

  const afterDeadline = eventIsAfterDeadline(eventSchedule);

  const authorName: string =
    eventSchedule.author.name === ''
      ? dc.listItem.anonymous
      : eventSchedule.author.name;

  const datetimeOptionsSummary =
    `${ymd2str(Optional.unwrapThrow(Arr.first(eventSchedule.datetimeRangeList)).ymd)} ${dict.common.tilde} ${ymd2str(Optional.unwrapThrow(Arr.last(eventSchedule.datetimeRangeList)).ymd)}` as const;

  const lastUpdateStr = ((): string => {
    const answerLastUpdate = DateUtils.from(lastUpdate);

    const eventLastUpdate = DateUtils.from(updatedAt);

    return lastUpdate === '' ||
      answerLastUpdate.getTime() < eventLastUpdate.getTime()
      ? eventLastUpdate.toLocaleString()
      : answerLastUpdate.toLocaleString();
  })();

  const title = dc.listItem.name(eventSchedule.title);

  return (
    <div
      class={constant(styles.listItem)}
      data-e2e={constant('event-list-item')}
      onClick={() => {
        Router.push(routes.event.answer.href({ eventId }));
      }}
    >
      <div class={constant(styles.header)}>
        <div class={constant(styles.sectionTitle)} title={constant(title)}>
          {constant(title)}
        </div>
        <div class={constant(styles.info)}>
          <div class={constant(styles.updatedAtWrapper)}>
            <div class={constant(styles.updatedAt)}>
              <span>
                {constant(dc.listItem.lastUpdate)}
                {constant(dict.common.colon)}
              </span>
              <span>{constant(lastUpdateStr)}</span>
            </div>
          </div>
          <div class={constant(styles.archiveButtonWrapper)}>
            <ArchiveEventButton
              archiveOrUnArchive={archiveOrUnArchive}
              onConfirm={match(archiveOrUnArchive, {
                archive: onConfirmArchiving,
                unarchive: onConfirmUnArchiving,
              })}
            />
          </div>
        </div>
      </div>
      <div class={constant(styles.tableContainer)}>
        <div class={constant(cell(styles.label, styles.label1))}>
          {constant(dc.listItem.answerDeadline)}
        </div>
        <div class={constant(cell(styles.value, styles.value1))}>
          {eventSchedule.answerDeadline === 'none' ? (
            <div>{constant(dict.answerPage.eventInfo.noAnswerDeadline)}</div>
          ) : (
            <div>
              <span>
                {constant(ymdhm2strWithDay(eventSchedule.answerDeadline))}
              </span>
              {afterDeadline ? (
                <span class={constant(styles.alertText)}>
                  {constant(
                    `${dict.common.braceJp.start}${dc.listItem.expired}${dict.common.braceJp.end}`,
                  )}
                </span>
              ) : (
                []
              )}
            </div>
          )}
        </div>
        <div class={constant(cell(styles.label, styles.label2))}>
          {constant(dc.listItem.datetimeOptions)}
        </div>
        <div class={constant(cell(styles.value, styles.value2))}>
          {constant(datetimeOptionsSummary)}
          {hasUnanswered ? (
            <span class={constant(styles.alertText)}>
              {constant(dc.listItem.hasUnanswered)}
            </span>
          ) : (
            []
          )}
        </div>
        <div class={constant(cell(styles.label, styles.label3))}>
          {constant(dc.listItem.author)}
        </div>
        <div class={constant(cell(styles.value, styles.value3))}>
          {constant(authorName)}
        </div>
      </div>
    </div>
  );
};

const cell = (kind: string, area: string): string =>
  `${styles.cell} ${kind} ${area}` as const;
