import type * as Discord from 'discord.js';
import { type IMap, ISet, isNotUndefined, Optional } from 'ts-data-forge';
import { emojis } from '../constants.mjs';
import type {
  AnswerOfDate,
  AnswerType,
  DateOption,
  Group,
  Poll,
  UserId,
} from '../types/index.mjs';
import { userIdToMention } from './user-id-to-mention.mjs';

/**
 * The summary field of one option. `userIdToDisplayName` names the voters;
 * `undefined` gives their counts alone, for a summary whose names do not fit.
 */
export const rpCreateSummaryField = (
  dateOption: DateOption,
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string> | undefined,
): Discord.EmbedField => {
  const answerOfDate = Optional.toNullable(poll.answers.get(dateOption.id));

  if (answerOfDate === undefined) {
    return rpFormatEmbedField(
      dateOption.label,
      rpToUserListString(ISet.create<UserId>([]), userIdToDisplayName),
    );
  }

  if (
    answerOfDate.good.size + answerOfDate.fair.size + answerOfDate.poor.size ===
    0
  ) {
    return rpFormatEmbedField(
      dateOption.label,
      rpToUserListString(ISet.create<UserId>([]), userIdToDisplayName),
    );
  }

  return rpCreateSummaryFieldSub(
    dateOption.label,
    answerOfDate,
    userIdToDisplayName,
  );
};

export const rpCreateSummaryValue = (
  value: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string> | undefined,
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
  userIdToDisplayName: IMap<UserId, string> | undefined,
): string =>
  `${emojis[answerType].name} :${rpToUserListString(
    reactions,
    userIdToDisplayName,
  )}` as const;

export const gpCreateSummaryField = (group: Group): Discord.EmbedField =>
  gpFormatEmbedFieldData(group.no, group.nameList.join(', '));

const rpFormatEmbedField = (
  pollName: string,
  value: string,
): Discord.EmbedField =>
  ({
    inline: false,
    name: `**${pollName}**`,
    value,
  }) as const;

const rpCreateSummaryFieldSub = (
  pollName: string,
  answerOfDate: AnswerOfDate,
  userIdToDisplayName: IMap<UserId, string> | undefined,
): Discord.EmbedField =>
  rpFormatEmbedField(
    pollName,
    rpCreateSummaryValue(answerOfDate, userIdToDisplayName),
  );

const rpToUserListString = (
  reactions: ISet<UserId>,
  userIdToDisplayName: IMap<UserId, string> | undefined,
): string =>
  userIdToDisplayName === undefined
    ? (`\t(${reactions.size})` as const)
    : `\t(${reactions.size})\t${reactions
        .toArray()
        .toSorted((a, b) => a.localeCompare(b))
        .map(
          (id) =>
            Optional.toNullable(userIdToDisplayName.get(id)) ??
            userIdToMention(id),
        )
        .join(', ')}`.trimEnd();

const gpFormatEmbedFieldData = (
  groupName: string,
  value: string,
): Discord.EmbedField =>
  ({
    inline: true,
    name: `**${groupName}**`,
    value,
  }) as const;
