/** How a check verdict is shown. */

import { type PayloadChecks } from 'pr-report-payload';

/**
 * The four reserved status roles of the palette. `neutral` is not one of them
 * — it is the absence of a status, which is what `paused` is.
 */
export type StatusRole = 'critical' | 'good' | 'neutral' | 'warning';

export type VerdictPresentation = Readonly<{
  glyph: string;
  label: string;
  status: StatusRole;
}>;

/**
 * A glyph and a word alongside the colour, never the colour alone: two of the
 * status steps sit below 3:1 on the light surface by design, and the pairing
 * is what the palette asks for in exchange.
 *
 * The glyphs are dingbats and geometric shapes rather than the emoji the
 * Markdown report uses. GitHub renders `⏸️` from its own font; a page renders
 * it from whatever the reader has, and a machine without an emoji font draws
 * a box — measured, in the container these were checked in.
 *
 * `paused` is `neutral` rather than a status. While `skip-ci` is on, nothing
 * has run and the red a reader might see is the cancelled `opened` run — a
 * held pull request is not a broken one, and colouring it as one would make
 * a queue of them read as a wall of failures.
 */
export const presentVerdict = (
  verdict: PayloadChecks['verdict'],
): VerdictPresentation => {
  switch (verdict) {
    case 'passed':
      return { glyph: '✓', label: 'checks passed', status: 'good' };

    case 'failing':
      return { glyph: '✗', label: 'checks failing', status: 'critical' };

    case 'pending':
      return { glyph: '◐', label: 'checks running', status: 'warning' };

    case 'paused':
      return { glyph: '‖', label: 'checks paused', status: 'neutral' };
  }
};
