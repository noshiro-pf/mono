/**
 * Returns a function that says whether one more mail may be sent at `now`
 * (milliseconds since the epoch): at most `limit` within any
 * `windowMilliseconds`. A call that returns `true` counts toward the limit;
 * one that returns `false` does not.
 *
 * The count is held in this instance's memory, so it bounds the whole function
 * only while a single instance serves it (`maxInstances: 1` in `index.mts`),
 * and it starts over when the instance does.
 */
import { Arr } from 'ts-data-forge';

export const createMailBudget = ({
  limit,
  windowMilliseconds,
}: Readonly<{
  limit: number;
  windowMilliseconds: number;
}>): ((now: number) => boolean) => {
  let mut_sentAt: readonly number[] = [];

  return (now) => {
    const recent = mut_sentAt.filter((t) => now - t < windowMilliseconds);

    if (recent.length >= limit) {
      mut_sentAt = recent;

      return false;
    }

    mut_sentAt = Arr.toPushed(recent, now);

    return true;
  };
};
