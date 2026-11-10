import {
  graphqlRead,
  malformed,
  type Read,
  type ReadContext,
} from 'pr-report-core-v2';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  activityQuery,
  todayOf,
  weekBefore,
  weeklyActivityOf,
  type WeeklyActivity,
} from '../domain/index.mjs';

/**
 * The week before the day `nowMs` is in, and that day so far, counted in the
 * reader's time zone (`timeZone` names another, for a test). A count GitHub did
 * not give fails the whole read.
 */
export const readWeeklyActivity = async (
  context: ReadContext,
  nowMs: number,
  timeZone?: string,
): Promise<Read<WeeklyActivity>> => {
  const days = weekBefore(nowMs, timeZone);

  const today = todayOf(nowMs, timeZone);

  const { query, variables } = activityQuery(
    { owner: context.owner, name: context.name },
    days,
    today,
  );

  const read = await graphqlRead(
    context,
    WHAT,
    query,
    variables,
    ActivitySchema,
  );

  if (Result.isErr(read)) {
    return read;
  }

  const counts = Object.fromEntries(
    Arr.generate(function* () {
      for (const [alias, field] of Object.entries(read.value)) {
        if (
          isRecord(field) &&
          hasKey(field, 'issueCount') &&
          typeof field.issueCount === 'number'
        ) {
          yield [alias, field.issueCount] as const;
        }
      }
    }),
  );

  const activity = weeklyActivityOf(counts, days, today, nowMs);

  return activity === undefined
    ? Result.err(malformed(WHAT, 'a count is missing from the answer'))
    : Result.ok(activity);
};

const WHAT = 'the week’s activity';

const ActivitySchema = t.keyValueRecord(t.string(), t.unknown());
