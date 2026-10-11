import { memoNamed } from 'preact-utils';
import { ISSUES_PAGE_SIZE } from '../report-query.mjs';
import { reader, readerSignals } from '../store/index.mjs';

type Props = Readonly<{
  /** How many open issues the list does not show yet. */
  notListed: number;
}>;

/**
 * The button under the open issues that lists the next page of them, and
 * why it did not if it did not.
 *
 * Its own component because the page being read changes nothing else, and
 * the one that reads that is the one that renders again for it.
 */
export const LoadMoreIssues = memoNamed<Props>(
  'LoadMoreIssues',
  ({ notListed }) => {
    const moreIssues = readerSignals.moreIssues.value;

    const loading = moreIssues.type === 'loading';

    return (
      <div className={'load-more'}>
        <button
          className={'load-more-button'}
          disabled={loading}
          type={'button'}
          onClick={reader.loadMoreIssues}
        >
          {loading
            ? 'Reading…'
            : notListed > 0
              ? `Show ${Math.min(notListed, ISSUES_PAGE_SIZE)} more (${notListed} not shown)`
              : 'Show more'}
        </button>

        {moreIssues.type === 'failed' ? (
          <span className={'poll-error'}>{moreIssues.message}</span>
        ) : undefined}
      </div>
    );
  },
);
