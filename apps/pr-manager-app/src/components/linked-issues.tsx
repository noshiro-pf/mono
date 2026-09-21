import { type PayloadLinkedIssue } from 'pr-report-payload';
import * as React from 'react';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ issues: readonly PayloadLinkedIssue[] }>;

/**
 * The issues the pull request closes, with their titles where they are
 * known: "closes #1880" says a number, and "closes #1880 the report is
 * unreadable in a terminal" says what the pull request is for.
 *
 * A title is empty when the report ran without a token and read the closing
 * keywords out of the body instead of GitHub's own list, and for every merged
 * pull request, whose links are only ever read that way.
 */
export const LinkedIssues = React.memo<Props>(({ issues }) => (
  <span className={'linked-issues'}>
    {'closes '}
    {issues.map((issue, index) => (
      <React.Fragment key={issue.number}>
        {index === 0 ? '' : ', '}
        <ExternalLink dataState={issue.state} href={issue.url}>
          {`#${issue.number}`}
        </ExternalLink>
        {issue.title === '' ? '' : ` ${issue.title}`}
      </React.Fragment>
    ))}
  </span>
));

LinkedIssues.displayName = 'LinkedIssues';
