/** Lines of a pull request's description that tools read, and that its guards protect. */

/**
 * A heading `review-findings-digest` reads as the `## Review` section, suffix
 * and all (`## Review (/code-review high)`). `pr-description` refuses a body
 * that would be read otherwise by this same pattern.
 */
export const REVIEW_SECTION_HEADING = /^##\s+Review\b/u;

/**
 * The start of a line `split-view-link` reads as a `Claude-Session:` trailer. It
 * cannot import this (`claude-session.mts` there says why), so `pr-manager`, which
 * has both, tests that the two agree.
 */
export const CLAUDE_SESSION_LINE = /^[^\S\n]*claude-session[^\S\n]*:/iu;
