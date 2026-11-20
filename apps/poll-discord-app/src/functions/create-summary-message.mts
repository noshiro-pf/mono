import { EmbedBuilder, type EmbedField } from 'discord.js';
import {
  Arr,
  type IMap,
  Result,
  asPositiveUint32,
  castMutable,
} from 'ts-data-forge';
import { embedMessageColor, emojis, footerText } from '../constants.mjs';
import type { Group, Poll, UserId } from '../types/index.mjs';
import {
  gpCreateSummaryField,
  rpCreateSummaryField,
} from './create-summary-value.mjs';

/**
 * A poll's summary: one field per option, in embeds of at most
 * {@link MAX_FIELDS_PER_EMBED}, the title on the first and the footer and
 * timestamp on the last. The voters are named while every field value fits in
 * {@link MAX_FIELD_VALUE} characters and the whole text in
 * {@link MAX_MESSAGE_TEXT}; otherwise every option gives its counts alone,
 * which {@link rpCheckPollLimits} makes sure fit.
 */
export const rpCreateSummaryMessages = (
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string>,
): readonly EmbedBuilder[] => {
  const title = summaryTitle(poll.title);

  const named = rpCreateSummaryFields(poll, userIdToDisplayName);

  const fields =
    named.every(({ value }) => value.length <= MAX_FIELD_VALUE) &&
    textLength(title, named) <= MAX_MESSAGE_TEXT
      ? named
      : rpCreateSummaryFields(poll, undefined);

  const chunks = Arr.chunk(fields, asPositiveUint32(MAX_FIELDS_PER_EMBED));

  return chunks.map((chunk, i) => {
    const builder = new EmbedBuilder();

    builder.setColor(embedMessageColor).addFields(Array.from(chunk));

    if (i === 0) {
      builder.setTitle(title);
    }

    if (i === chunks.length - 1) {
      builder.setFooter({ text: footerText }).setTimestamp();
    }

    return builder;
  });
};

/**
 * Why a poll of `title` and `labels` cannot have a summary, before anything is
 * posted: a title or an option label longer than a title or a field name may
 * be, more options than one message's embeds hold, or more text than one
 * message may carry even with counts alone in place of names.
 */
export const rpCheckPollLimits = (
  title: string,
  labels: readonly string[],
): Result<undefined, string> => {
  if (title.length > MAX_TITLE) {
    return Result.err(
      `The title is ${title.length} characters long; a poll's title can be ${MAX_TITLE} at most.`,
    );
  }

  const longLabel = labels.find((label) => label.length > MAX_LABEL);

  if (longLabel !== undefined) {
    return Result.err(
      `An option is ${longLabel.length} characters long; an option can be ${MAX_LABEL} at most.`,
    );
  }

  if (labels.length > MAX_OPTIONS) {
    return Result.err(
      `The poll has ${labels.length} options; a poll can have ${MAX_OPTIONS} at most.`,
    );
  }

  const length =
    summaryTitle(title).length +
    footerText.length +
    labels.reduce(
      (sum, label) => sum + fieldName(label).length + MAX_COUNTS_VALUE.length,
      0,
    );

  return length > MAX_MESSAGE_TEXT
    ? Result.err(
        `The summary of these ${labels.length} options would take ${length} characters, and a message can carry ${MAX_MESSAGE_TEXT}: use fewer options or shorter ones.`,
      )
    : Result.ok(undefined);
};

export const gpCreateSummaryMessage = (
  groups: readonly Group[],
): EmbedBuilder => {
  const builder = new EmbedBuilder();

  return builder
    .setColor(embedMessageColor)
    .addFields(castMutable(gpCreateFields(groups)));
};

const rpCreateSummaryFields = (
  poll: Poll,
  userIdToDisplayName: IMap<UserId, string> | undefined,
): readonly EmbedField[] =>
  poll.dateOptions.map((d) =>
    rpCreateSummaryField(d, poll, userIdToDisplayName),
  );

const summaryTitle = (title: string): string =>
  `Collected Results for "${title}"` as const;

/** As `rpCreateSummaryField` writes an option's label. */
const fieldName = (label: string): string => `**${label}**` as const;

/** What Discord counts towards a message's text, of the summary's fields. */
const textLength = (title: string, fields: readonly EmbedField[]): number =>
  fields.reduce(
    (sum, { name, value }) => sum + name.length + value.length,
    title.length + footerText.length,
  );

/** Discord's limits on embeds (https://discord.com/developers/docs/resources/message#embed-object-embed-limits). */
const MAX_FIELDS_PER_EMBED = 25;

const MAX_EMBEDS_PER_MESSAGE = 10;

const MAX_EMBED_TITLE = 256;

const MAX_FIELD_NAME = 256;

const MAX_FIELD_VALUE = 1024;

/** Across every embed of one message. */
const MAX_MESSAGE_TEXT = 6000;

const MAX_TITLE = MAX_EMBED_TITLE - summaryTitle('').length;

const MAX_LABEL = MAX_FIELD_NAME - fieldName('').length;

const MAX_OPTIONS = MAX_FIELDS_PER_EMBED * MAX_EMBEDS_PER_MESSAGE;

/**
 * The longest value of an option's counts alone: every answer given, by up to
 * 9999 voters.
 */
const MAX_COUNTS_VALUE = (['good', 'fair', 'poor'] as const)
  .map((answer) => `${emojis[answer].name} :\t(9999)`)
  .join('\r\n');

const gpCreateFields = (groups: readonly Group[]): readonly EmbedField[] =>
  groups.map(gpCreateSummaryField);
