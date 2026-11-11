/** What one round of the skill is started with, and what it is told. */

import { sessionArgs } from '../../agent/index.mjs';

/** The arguments for `claude` on one round of the skill. */
export const claudeArgs = (round: Round): readonly string[] =>
  sessionArgs({
    prompt: `/${round.skill}`,
    instructions: roundInstructions(round),
    workDir: round.workDir,
    maxBudgetUsd: round.maxBudgetUsd,
    model: round.model,
    extraTools: [],
  });

/**
 * What the session is told besides the skill: what `/loop` and a person would
 * otherwise have settled, and what this command has done already.
 */
export const roundInstructions = (round: Round): string =>
  [
    `This session was started by \`run-unblock-prs-skill\` for one round of the \`${round.skill}\` skill, and nobody is watching it: a question you ask will not be answered.`,
    '',
    `- Work only on #${round.number}. Leave every other pull request, even one the survey shows as the skill's: the next round takes the next one, or an earlier round left it as it is.`,
    '- Leave `report-unowned-prs` to the command that started this session: it runs it.',
    `- The claimant is \`${round.claimant}\`: pass \`--by ${round.claimant}\` to \`claim-pr\` and \`push-fixed-pr\`.`,
    `- Make every worktree under \`${round.workDir}\`. The directory is removed when the round ends.`,
    '- Run one round and stop. Do not start `/loop`, schedule anything, or wait for checks: the worker watches them.',
    '- Where the skill says to leave a decision to a person, leave the comment it describes, release the claim, and end the round.',
  ].join('\n');

/** What one round of the skill is started with. */
export type Round = Readonly<{
  skill: string;
  /** The pull request it is handed, and the only one it may touch. */
  number: number;
  /** What it passes to `claim-pr --by` and `push-fixed-pr --by`. */
  claimant: string;
  /** Where its worktrees go, removed when it ends. */
  workDir: string;
  maxBudgetUsd: number;
  model: string | undefined;
}>;
