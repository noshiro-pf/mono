import type * as Discord from 'discord.js';
import { emojis } from '../constants.mjs';
import {
  type AnswerOfDate,
  type AnswerType,
  type DateOption,
  type Group,
  type Poll,
  type UserId,
} from '../types/index.mjs';
import { userIdToMention } from './user-id-to-mention.mjs';

export const rpCreateSummaryField = (
  dateOption: DateOption,
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string>,
): Discord.EmbedField => {
  const answerOfDate = poll.answers.get(dateOption.id);
  if (answerOfDate === undefined) {
    return rpFormatEmbedField(
      dateOption.label,
      rpToUserListString(ISet.new<UserId>([]), userIdToDisplayName),
    );
  }
  if (
    answerOfDate.good.size + answerOfDate.fair.size + answerOfDate.poor.size ===
    0
  ) {
    return rpFormatEmbedField(
      dateOption.label,
      rpToUserListString(ISet.new<UserId>([]), userIdToDisplayName),
    );
  }

  return rpCreateSummaryFieldSub(
    dateOption.label,
    answerOfDate,
    userIdToDisplayName,
  );
};

const rpFormatEmbedField = (
  pollName: string,
  value: string,
): Discord.EmbedField => ({
  inline: false,
  name: `**${pollName}**`,
  value,
});

const rpCreateSummaryFieldSub = (
  pollName: string,
  answerOfDate: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string>,
): Discord.EmbedField =>
  rpFormatEmbedField(
    pollName,
    rpCreateSummaryValue(answerOfDate, userIdToDisplayName),
  );

export const rpCreateSummaryValue = (
  value: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string>,
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
  userIdToDisplayName: IMap<UserId, string>,
): string =>
  `${emojis[answerType].name} :${rpToUserListString(
    reactions,
    userIdToDisplayName,
  )}`;

const rpToUserListString = (
  reactions: ISet<UserId>,
  userIdToDisplayName: IMap<UserId, string>,
): string =>
  `\t(${reactions.size})\t${Arr.sorted(reactions.toArray(), (a, b) =>
    a.localeCompare(b),
  )
    .map((id) => userIdToDisplayName.get(id) ?? userIdToMention(id))
    .join(', ')}`.trimEnd();

export const gpCreateSummaryField = (group: Group): Discord.EmbedField =>
  gpFormatEmbedFieldData(group.no, group.nameList.join(', '));

const gpFormatEmbedFieldData = (
  groupName: string,
  value: string,
): Discord.EmbedField => ({
  inline: true,
  name: `**${groupName}**`,
  value,
});
