import { EmbedBuilder, type EmbedField } from 'discord.js';
import { embedMessageColor, footerText } from '../constants.mjs';
import { type Group, type Poll, type UserId } from '../types/index.mjs';
import {
  gpCreateSummaryField,
  rpCreateSummaryField,
} from './create-summary-value.mjs';

export const rpCreateSummaryMessage = (
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string>,
): EmbedBuilder =>
  new EmbedBuilder()
    .setColor(embedMessageColor)
    .setTitle(`Collected Results for "${poll.title}"`)
    .addFields(castMutable(rpCreateSummaryFields(poll, userIdToDisplayName)))
    .setFooter({ text: footerText })
    .setTimestamp();

const rpCreateSummaryFields = (
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string>,
): readonly EmbedField[] =>
  poll.dateOptions.map((d) =>
    rpCreateSummaryField(d, poll, userIdToDisplayName),
  );

export const gpCreateSummaryMessage = (
  groups: readonly Group[],
): EmbedBuilder =>
  new EmbedBuilder()
    .setColor(embedMessageColor)
    .addFields(castMutable(gpCreateFields(groups)));

const gpCreateFields = (groups: readonly Group[]): readonly EmbedField[] =>
  groups.map(gpCreateSummaryField);
