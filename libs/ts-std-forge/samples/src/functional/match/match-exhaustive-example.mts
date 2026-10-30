// Example: src/functional/match.mts (match exhaustive)
import { match } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Status = 'draft' | 'review' | 'published';

    const status: Status = 'draft';

    const message = match<
      Status,
      /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line convert-to-readonly
      Readonly<{ draft: string; review: string; published: string }>
    >(status, {
      draft: 'Work in progress',
      review: 'Awaiting feedback',
      published: 'Complete',
    });

    assert.isTrue(message === 'Work in progress');

    // embed-sample-code-ignore-below
  });
}
