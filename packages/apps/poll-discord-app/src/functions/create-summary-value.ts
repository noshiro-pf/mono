import type { EmbedFieldData } from 'discord.js';
import { emojis } from '../constants';
import type {
  AnswerOfDate,
  AnswerType,
  DateOption,
  Group,
  Poll,
  UserId,
} from '../types';
import { userIdToMention } from './user-id-to-mention';

export const rpCreateSummaryField = (
  dateOption: DateOption,
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string>
): EmbedFieldData => {
  const answerOfDate = poll.answers.get(dateOption.id);
  if (answerOfDate === undefined) {
    return rpFormatEmbedFieldData(
      dateOption.label,
      rpToUserListString(ISet.new<UserId>([]), userIdToDisplayName)
    );
  }
  if (
    answerOfDate.good.size + answerOfDate.fair.size + answerOfDate.poor.size ===
    0
  ) {
    return rpFormatEmbedFieldData(
      dateOption.label,
      rpToUserListString(ISet.new<UserId>([]), userIdToDisplayName)
    );
  }

  return rpCreateSummaryFieldSub(
    dateOption.label,
    answerOfDate,
    userIdToDisplayName
  );
};

const rpFormatEmbedFieldData = (
  pollName: string,
  value: string
): EmbedFieldData => ({
  name: `**${pollName}**`,
  value,
});

const rpCreateSummaryFieldSub = (
  pollName: string,
  answerOfDate: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string>
): EmbedFieldData =>
  rpFormatEmbedFieldData(
    pollName,
    rpCreateSummaryValue(answerOfDate, userIdToDisplayName)
  );

export const rpCreateSummaryValue = (
  value: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string>
): string =>
  [
    value.good.size === 0
      ? undefined
      : rpCreateSummaryValueElement(value.good, 'good', userIdToDisplayName),
    value.fair.size === 0
      ? undefined
      : rpCreateSummaryValueElement(value.fair, 'fair', userIdToDisplayName),
    value.poor.size === 0
      ? undefined
      : rpCreateSummaryValueElement(value.poor, 'poor', userIdToDisplayName),
  ]
    .filter(isNotUndefined)
    .join('\r\n');

export const rpCreateSummaryValueElement = (
  reactions: ISet<UserId>,
  answerType: AnswerType,
  userIdToDisplayName: IMap<UserId, string>
): string =>
  `${emojis[answerType].name} :${rpToUserListString(
    reactions,
    userIdToDisplayName
  )}`;

const rpToUserListString = (
  reactions: ISet<UserId>,
  userIdToDisplayName: IMap<UserId, string>
): string =>
  `\t(${reactions.size})\t${Arr.sort(reactions.toArray(), (a, b) =>
    a.localeCompare(b)
  )
    .map((id) => userIdToDisplayName.get(id) ?? userIdToMention(id))
    .join(', ')}`.trimEnd();

export const gpCreateSummaryField = (group: Group): EmbedFieldData =>
  gpFormatEmbedFieldData(group.no, group.nameList.join(', '));

const gpFormatEmbedFieldData = (
  groupName: string,
  value: string
): EmbedFieldData => ({
  name: `**${groupName}**`,
  value,
});
