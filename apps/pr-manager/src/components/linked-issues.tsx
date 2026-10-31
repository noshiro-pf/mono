import type { LinkedIssue } from 'pr-report-core';
import { constant, For, view, type Bindable, type JSX } from 'synstate-dom';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ issues: Bindable<readonly LinkedIssue[]> }>;

/**
 * The issues the pull request closes, with their titles where they are known:
 * "closes #1880" says a number, and "closes #1880 the report is unreadable in a
 * terminal" says what the pull request is for.
 *
 * The list is GitHub's own — the one in the pull request's sidebar, which
 * includes a link made by hand — and the keywords GitHub read in the body of a
 * pull request it does not link them on yet, a stacked one. The titles are
 * there unless GitHub would not describe the issue.
 */
export const LinkedIssues = ({ issues }: Props): JSX.Element => (
  <span class={constant('linked-issues')}>
    {constant('closes ')}
    <For items={issues} key={(issue) => issue.number}>
      {(issue$, index$) => (
        <>
          {view(index$, separator)}
          <ExternalLink
            dataState={view(issue$, (issue) => issue.state)}
            href={view(issue$, (issue) => issue.url)}
          >
            {view(issue$, (issue) => `#${issue.number}`)}
          </ExternalLink>
          {view(issue$, (issue) =>
            issue.title === '' ? '' : ` ${issue.title}`,
          )}
        </>
      )}
    </For>
  </span>
);

/** Between two items of a list written as a sentence. */
export const separator = (index: number): string => (index === 0 ? '' : ', ');
