// Example: src/functional/match.mts (match exhaustive)
import { match } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Status = 'draft' | 'review' | 'published';

const status: Status = 'draft';

const message = match<
  Status,
  { draft: string; review: string; published: string }
>(status, {
  draft: 'Work in progress',
  review: 'Awaiting feedback',
  published: 'Complete',
});

assert(message === 'Work in progress');
