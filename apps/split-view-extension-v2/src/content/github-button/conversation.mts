import {
  claudeSessionUrlOfBody,
  issueUrlOf,
  pullRequestTitleOf,
  type PullRequest,
} from '../../core/index.mjs';

/** What the conversation page says beyond the address (spec G2). */
export type Conversation = Readonly<{
  title: string | undefined;
  issueUrl: string | undefined;
  sessionUrl: string | undefined;
}>;

/**
 * Fetches the conversation page — same-origin, so private repositories too —
 * and reads the title, the first issue the pull request closes, and the first
 * `Claude-Session:` line of its description. `undefined` when the fetch fails;
 * markup GitHub has moved reads as `undefined` fields.
 */
export const readConversation = async (
  pullRequest: PullRequest,
): Promise<Conversation | undefined> => {
  try {
    const response = await fetch(pullRequest.url, {
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (!response.ok) {
      return undefined;
    }

    const parser = new DOMParser();

    const page = parser.parseFromString(await response.text(), 'text/html');

    return {
      title: pullRequestTitleOf(page.title),
      issueUrl: Array.from(
        page.querySelectorAll(closingIssueSelector),
        (anchor) => issueUrlOf(anchor.getAttribute('href') ?? ''),
      ).find((url) => url !== undefined),
      sessionUrl: claudeSessionUrlOfBody(
        descriptionTextOf(page.querySelector(descriptionSelector)),
      ),
    };
  } catch {
    return undefined;
  }
};

/**
 * The rendered description as the Markdown a trailer is read from: links
 * written back as `[text](href)` (a bare URL renders as a link to itself), line
 * breaks as newlines, and code left out, as the PR Manager leaves it.
 */
const descriptionTextOf = (description: Element | null): string => {
  const mut_copy = description?.cloneNode(true);

  if (!(mut_copy instanceof Element)) {
    return '';
  }

  for (const mut_code of mut_copy.querySelectorAll('pre, code')) {
    mut_code.remove();
  }

  for (const mut_anchor of mut_copy.querySelectorAll('a[href]')) {
    mut_anchor.replaceWith(
      `[${mut_anchor.textContent}](${mut_anchor.getAttribute('href') ?? ''})`,
    );
  }

  for (const mut_lineBreak of mut_copy.querySelectorAll('br')) {
    mut_lineBreak.replaceWith('\n');
  }

  return mut_copy.textContent;
};

/** "Successfully merging this pull request may close these issues". */
const closingIssueSelector =
  'development-menu a[data-hovercard-type="issue"][href]';

const descriptionSelector = '.js-command-palette-pull-body .js-comment-body';

const fetchTimeoutMs = 5000;
