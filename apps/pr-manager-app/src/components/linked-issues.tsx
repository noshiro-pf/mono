import { type LinkedIssue } from 'pr-report-core';
import * as React from 'react';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ issues: readonly LinkedIssue[] }>;

/**
 * The issues the pull request closes, with their titles where they are
 * known: "closes #1880" says a number, and "closes #1880 the report is
 * unreadable in a terminal" says what the pull request is for.
 *
 * The list is GitHub's own — the one in the pull request's sidebar, which
 * includes a link made by hand — so the titles are always there.
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
