import { Arr } from 'ts-data-forge';
import type { HandLinks } from './github.mjs';

/**
 * What {@link HandLinks} says, as lines for a reader: nothing when every list
 * was read, and otherwise which pull requests' issue links may be missing one
 * linked by hand, and why. Without a token every list is unread, and the lines
 * name every open pull request: a caller that runs without one says so in its
 * own words instead, as the report does.
 */
export const describeHandLinks = ({
  unread,
  truncated,
}: HandLinks): readonly string[] =>
  [
    ...(unread === undefined
      ? ([] as const)
      : ([
          // `because` is one line by `HandLinks`' own contract, which `facts`
          // keeps; it is not flattened again here.
          `The issues linked by hand to ${pullNumbers(unread.pulls)} could not be read (${unread.because}): their links are the closing keywords alone, so an issue linked by hand alone may be missing from them.`,
        ] as const)),
    ...(Arr.isNonEmpty(truncated)
      ? ([
          `The issues linked to ${pullNumbers(truncated)} were more than were read: an issue linked by hand past those may be missing.`,
        ] as const)
      : ([] as const)),
  ] as const;

const pullNumbers = (pulls: readonly number[]): string =>
  pulls.map((number) => `#${number}`).join(', ');
