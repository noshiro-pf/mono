/** How a check verdict is shown. */

import { type ChecksSummary } from 'pr-report-core';

/**
 * The four reserved status roles of the palette. `neutral` is not one of them
 * — it is the absence of a status, which is what `paused` is.
 */
export type StatusRole = 'critical' | 'good' | 'neutral' | 'warning';

export type VerdictPresentation = Readonly<{
  /**
   * The `d` of one SVG path, drawn on a 16×16 viewBox and stroked in
   * `currentColor`. See {@link presentVerdict} for why it is not a character.
   */
  icon: string;
  label: string;
  status: StatusRole;
}>;

/**
 * An icon and a word alongside the colour, never the colour alone: two of the
 * status steps sit below 3:1 on the light surface by design, and the pairing
 * is what the palette asks for in exchange.
 *
 * **Drawn rather than typed.** These were characters — `✓ ✗ ◐ ‖` — chosen
 * over the emoji the Markdown report uses, because GitHub renders `⏸️` from
 * its own font while a page renders it from whatever the reader has, and a
 * machine without an emoji font draws a box. But a character is still at the
 * mercy of a font: `‖` is a double vertical line, and at 12px in whatever
 * the reader has installed it is a smudge rather than a pause. A path is the
 * same shape everywhere and scales with the text around it.
 *
 * `paused` is `neutral` rather than a status. While `skip-ci` is on, nothing
 * has run and the red a reader might see is the cancelled `opened` run — a
 * held pull request is not a broken one, and colouring it as one would make
 * a queue of them read as a wall of failures.
 */
export const presentVerdict = (
  verdict: ChecksSummary['verdict'],
): VerdictPresentation => {
  switch (verdict) {
    case 'passed':
      return {
        icon: 'M3.4 8.6L6.5 11.7L12.6 4.7',
        label: 'checks passed',
        status: 'good',
      };

    case 'failing':
      return {
        icon: 'M4.6 4.6L11.4 11.4M11.4 4.6L4.6 11.4',
        label: 'checks failing',
        status: 'critical',
      };

    // A clock rather than a half-filled circle: "running" is a wait, and the
    // half circle read as a state of its own.
    case 'pending':
      return {
        icon: 'M2.6 8a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0-10.8 0M8 4.9V8.3l2.4 1.4',
        label: 'checks running',
        status: 'warning',
      };

    case 'paused':
      return {
        icon: 'M6.2 4.2V11.8M9.8 4.2V11.8',
        label: 'checks paused',
        status: 'neutral',
      };
  }
};
