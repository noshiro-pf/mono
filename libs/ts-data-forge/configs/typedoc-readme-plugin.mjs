import { MarkdownEvent } from 'typedoc';

const HOME_PAGES = new Set(['index.html', 'index.md']);

/** @param {import('typedoc').Application} app */
export function load(app) {
  app.renderer.on(MarkdownEvent.PARSE, (event) => {
    if (!HOME_PAGES.has(event.page.url)) {
      return;
    }

    event.parsedText = stripLeadingHeading(event.parsedText);
  });
}

const HTML_LEADING_H1 = /^[\s\n]*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i;

const MARKDOWN_HEADING_PREFIX = /^[\s\r\n]*#/;

/**
 * @param {string} content
 * @returns {string}
 */
function stripLeadingHeading(content) {
  if (typeof content !== 'string' || content.trim() === '') {
    return content;
  }

  if (HTML_LEADING_H1.test(content)) {
    return content.replace(HTML_LEADING_H1, '');
  }

  if (!MARKDOWN_HEADING_PREFIX.test(content)) {
    return content;
  }

  const normalized = content.replace(/\r\n?/g, '\n');
  const trimmed = normalized.trimStart();

  if (!trimmed.startsWith('#')) {
    return content;
  }

  if (!trimmed.startsWith('# ') && !trimmed.startsWith('#\t')) {
    return content;
  }

  const headingMatch = normalized.match(/^[\s\n]*#\s+[^\n]+/);

  if (!headingMatch) {
    return content;
  }

  const remainder = normalized
    .slice(headingMatch[0].length)
    .replace(/^\s+/, '');

  return remainder;
}
