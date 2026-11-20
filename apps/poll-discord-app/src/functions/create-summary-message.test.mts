import { Arr, asUint32, IMap, ISet, Result, tp } from 'ts-data-forge';
import {
  answerOfDateDefaultValue,
  toDateOptionId,
  toPollId,
  toTimestamp,
  toTitleMessageId,
  toUserId,
  type AnswerOfDate,
  type DateOptionId,
  type Poll,
  type UserId,
} from '../types/index.mjs';
import {
  rpCheckPollLimits,
  rpCreateSummaryMessages,
} from './create-summary-message.mjs';

const pollOf = (
  title: string,
  labels: readonly string[],
  answerOf: (index: number) => AnswerOfDate = () => answerOfDateDefaultValue,
): Poll =>
  ({
    id: toPollId('poll'),
    updatedAt: toTimestamp(0),
    title,
    dateOptions: labels.map((label, i) => ({
      label,
      id: toDateOptionId(`option-${i}`),
    })),
    answers: IMap.create<DateOptionId, AnswerOfDate>(
      labels.map((_, i) => tp(toDateOptionId(`option-${i}`), answerOf(i))),
    ),
    titleMessageId: toTitleMessageId('title'),
  }) as const;

/** `count` half-hour labels, as `/rp30` writes them. */
const labelsOf = (count: number): readonly string[] =>
  Arr.seq(asUint32(count)).map((i) => `${i}:00-${i}:30`);

const userIdsOf = (prefix: string, count: number): readonly UserId[] =>
  Arr.seq(asUint32(count)).map((i) => toUserId(`${prefix}${1000 + i}`));

const noNames = IMap.create<UserId, string>([]);

/** What Discord counts towards a message's 6000 characters. */
const textLengthOf = (
  embeds: ReturnType<typeof rpCreateSummaryMessages>,
): number =>
  embeds
    .map((embed) => embed.toJSON())
    .reduce(
      (sum, { title = '', footer, fields = [] }) =>
        sum +
        title.length +
        (footer?.text.length ?? 0) +
        fields.reduce(
          (fieldSum, { name, value }) => fieldSum + name.length + value.length,
          0,
        ),
      0,
    );

describe(rpCreateSummaryMessages, () => {
  test.each([
    { options: 26, fields: [25, 1] },
    { options: 60, fields: [25, 25, 10] },
  ] as const)(
    '$options options build into embeds of $fields fields',
    ({ options, fields }) => {
      const embeds = rpCreateSummaryMessages(
        pollOf('x', labelsOf(options)),
        noNames,
      );

      const json = embeds.map((embed) => embed.toJSON());

      assert.deepStrictEqual(
        json.map((embed) => embed.fields?.length),
        Array.from(fields),
      );

      // The title on the first only, the footer and timestamp on the last only.
      const titles = json.map((embed) => embed.title);

      assert.strictEqual(titles[0], 'Collected Results for "x"');

      assert.isTrue(Arr.tail(titles).every((title) => title === undefined));

      const footers = json.map((embed) => embed.footer?.text);

      assert.strictEqual(footers.at(-1), 'Last Update');

      assert.isTrue(
        Arr.butLast(footers).every((footer) => footer === undefined),
      );

      const stamped = json.map((embed) => embed.timestamp !== undefined);

      assert.strictEqual(stamped.at(-1), true);

      assert.isTrue(Arr.butLast(stamped).every((isStamped) => !isStamped));
    },
  );

  test('names the voters when they fit', () => {
    const voter = toUserId('1');

    const [embed] = rpCreateSummaryMessages(
      pollOf('x', ['a'], () => ({
        ...answerOfDateDefaultValue,
        good: ISet.create([voter]),
      })),
      IMap.create<UserId, string>([tp(voter, 'alice')]),
    );

    assert.include(embed?.toJSON().fields?.[0]?.value, 'alice');
  });

  test('gives counts in place of names when all of them would pass 6000 characters', () => {
    const names = IMap.create(
      userIdsOf('', 12).map((id) => tp(id, 'n'.repeat(32))),
    );

    const embeds = rpCreateSummaryMessages(
      pollOf('x', labelsOf(24), () => ({
        ...answerOfDateDefaultValue,
        good: ISet.create(userIdsOf('', 12)),
      })),
      names,
    );

    const value = embeds[0]?.toJSON().fields?.[0]?.value ?? '';

    assert.notInclude(value, 'nnnn');

    assert.include(value, '(12)');

    assert.isBelow(textLengthOf(embeds), 6000);
  });

  test('gives counts in place of names when one option would pass 1024 characters', () => {
    // No display names: each voter is a mention of its id.
    const embeds = rpCreateSummaryMessages(
      pollOf('x', ['a'], () => ({
        ...answerOfDateDefaultValue,
        good: ISet.create(userIdsOf('12345678901234567', 60)),
      })),
      noNames,
    );

    const value = embeds[0]?.toJSON().fields?.[0]?.value ?? '';

    assert.include(value, '(60)');

    assert.isBelow(value.length, 1024);
  });
});

describe(rpCheckPollLimits, () => {
  test.each([
    { title: 'x'.repeat(233), labels: ['a'], says: 'title' },
    { title: 'x', labels: ['a'.repeat(253)], says: 'option' },
    { title: 'x', labels: labelsOf(251), says: '250' },
    { title: 'x', labels: labelsOf(120), says: '6000' },
  ] as const)(
    'refuses what no summary can show ($says)',
    ({ title, labels, says }) => {
      const result = rpCheckPollLimits(title, labels);

      assert.isTrue(Result.isErr(result));

      assert.include(result.value, says);
    },
  );

  test.each([
    { title: 'x'.repeat(232), labels: ['a'] },
    { title: 'x', labels: ['a'.repeat(252)] },
    { title: 'x', labels: labelsOf(60) },
  ] as const)(
    'accepts the boundary, and what it accepts builds',
    ({ title, labels }) => {
      assert.isTrue(Result.isOk(rpCheckPollLimits(title, labels)));

      const embeds = rpCreateSummaryMessages(pollOf(title, labels), noNames);

      for (const embed of embeds) {
        embed.toJSON();
      }

      assert.isAtMost(textLengthOf(embeds), 6000);
    },
  );
});
