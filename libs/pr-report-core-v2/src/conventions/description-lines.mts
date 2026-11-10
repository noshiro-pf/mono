/**
 * Lines of a description that tools read (`spec/conventions.md`, "Two-language
 * descriptions").
 */

/**
 * The heading read as the review section, suffix and all
 * (`## Review (/code-review high)`); the first in the body is the one.
 */
export const REVIEW_SECTION_HEADING = /^##\s+Review\b/u;

/** The start of a `Claude-Session:` trailer line. */
export const CLAUDE_SESSION_LINE = /^[^\S\n]*claude-session[^\S\n]*:/iu;
