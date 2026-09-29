import { type LinkedIssue } from 'pr-report-core';
import { Fragment } from 'preact';
import { memoNamed } from 'preact-utils';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ issues: readonly LinkedIssue[] }>;

/**
 * The issues the pull request closes, with their titles where they are
 * known: "closes #1880" says a number, and "closes #1880 the report is
 * unreadable in a terminal" says what the pull request is for.
 *
 * The list is GitHub's own — the one in the pull request's sidebar, which
 * includes a link made by hand — and the keywords GitHub read in the body of
 * a pull request it does not link them on yet, a stacked one. The titles are
 * there unless GitHub would not describe the issue.
 */
export const LinkedIssues = memoNamed<Props>('LinkedIssues', ({ issues }) => (
  <span className={'linked-issues'}>
    {'closes '}
    {issues.map((issue, index) => (
      <Fragment key={issue.number}>
        {index === 0 ? '' : ', '}
        <ExternalLink dataState={issue.state} href={issue.url}>
          {`#${issue.number}`}
        </ExternalLink>
        {issue.title === '' ? '' : ` ${issue.title}`}
      </Fragment>
    ))}
  </span>
));
