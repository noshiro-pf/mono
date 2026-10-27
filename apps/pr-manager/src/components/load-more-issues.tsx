import {
  constant,
  derive,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { ISSUES_PAGE_SIZE } from '../report-query.mjs';
import { reader } from '../store/index.mjs';

type Props = Readonly<{
  /** How many open issues the list does not show yet. */
  notListed: Bindable<number>;
}>;

/**
 * The button under the open issues that lists the next page of them, and
 * why it did not if it did not.
 */
export const LoadMoreIssues = ({ notListed }: Props): JSX.Element => {
  const loading = view(reader.moreIssues, ({ type }) => type === 'loading');

  return (
    <div class={constant('load-more')}>
      <button
        class={constant('load-more-button')}
        disabled={loading}
        type={constant('button')}
        onClick={reader.loadMoreIssues}
      >
        {derive([loading, notListed], (isLoading, count) =>
          isLoading
            ? 'Reading…'
            : count > 0
              ? `Show ${Math.min(count, ISSUES_PAGE_SIZE)} more (${count} not shown)`
              : 'Show more',
        )}
      </button>

      <MatchOptional
        value={view(reader.moreIssues, (moreIssues) =>
          moreIssues.type === 'failed'
            ? Optional.some(moreIssues.message)
            : Optional.none,
        )}
        some={(message$) => (
          <span class={constant('poll-error')}>{message$}</span>
        )}
      />
    </div>
  );
};
