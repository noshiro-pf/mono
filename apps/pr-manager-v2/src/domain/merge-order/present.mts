import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type {
  ChecksBadge,
  CodeOwnerBadge,
  SetAsideBadge,
  ShownVerdict,
} from './card.mjs';

/**
 * A status colour never carries meaning alone (spec §14): every badge is a
 * tone, a glyph and a word, with what it rests on in its tooltip.
 */
export type BadgeText = Readonly<{
  tone: Tone;
  glyph: string;
  word: string;
  title: string;
  /** `1✗ 1… 1– 6✓`, or empty. */
  counts: string;
}>;

/** The four status steps, neutral for what judges nothing, info for a category. */
export type Tone =
  'critical' | 'good' | 'info' | 'neutral' | 'serious' | 'warning';

export const checksBadgeText = (badge: ChecksBadge): BadgeText => {
  if (badge.kind === 'unread') {
    return {
      tone: 'neutral',
      glyph: '?',
      word: 'checks unread',
      counts: '',
      title: badge.reason,
    };
  }

  const parts = [
    { label: 'failed', glyph: '✗', names: badge.failed },
    { label: 'pending', glyph: '…', names: badge.pending },
    { label: 'skipped', glyph: '–', names: badge.skipped },
    { label: 'passed', glyph: '✓', names: badge.passed },
  ] as const;

  const shown = parts.filter(({ names }) => Arr.isNonEmpty(names));

  const total = parts.reduce((sum, { names }) => sum + names.length, 0);

  const contexts = `${total} ${total === 1 ? 'context' : 'contexts'}` as const;

  return {
    ...VERDICTS[badge.verdict],
    counts: shown
      .map(({ glyph, names }) => `${names.length}${glyph}`)
      .join(' '),
    title: Arr.toUnshifted(
      badge.noneRequired
        ? `Over the ${contexts} reported, the branch rules requiring none:`
        : `Over the ${contexts} the branch rules require:`,
    )(shown.map(({ label, names }) => `${label} — ${names.join(', ')}`)).join(
      '\n',
    ),
  };
};

export const codeOwnerBadgeText = (badge: CodeOwnerBadge): BadgeText => {
  switch (badge.kind) {
    case 'waiting':
      return {
        tone: 'warning',
        glyph: '◔',
        word: 'awaiting code owner',
        counts: '',
        title: `Waits for a review from ${badge.owners.join(', ')}, who own ${badge.paths.join(', ')}.`,
      };

    case 'bypass':
      return {
        tone: 'serious',
        glyph: '⚑',
        word: 'needs a ruleset bypass',
        counts: '',
        title: `Its author is the only owner (${badge.owners.join(', ')}) of ${badge.paths.join(', ')}, and GitHub never counts an author’s own approval: it merges only through a ruleset bypass.`,
      };

    case 'unknown':
      return {
        tone: 'neutral',
        glyph: '?',
        word: 'code owner unknown',
        counts: '',
        title: `Owned by ${badge.teams.join(', ')}: a team’s members cannot be read without the read:org scope, so whether one has reviewed is unknown.`,
      };
  }
};

export const setAsideBadgeText = (badge: SetAsideBadge): BadgeText =>
  badge.applies
    ? ({
        tone: 'serious',
        glyph: '⏸',
        word: 'set aside',
        counts: '',
        title: `The merge queue set it aside: ${badge.reason}`,
      } as const)
    : ({
        tone: 'neutral',
        glyph: '⏸',
        word: 'set aside',
        counts: '',
        title: `The merge queue set it aside: ${badge.reason}. Its base has moved or a retry was asked since, so the queue will pick it again.`,
      } as const);

const VERDICTS = {
  passed: { tone: 'good', glyph: '✓', word: 'passing' },
  failing: { tone: 'critical', glyph: '✗', word: 'failing' },
  pending: { tone: 'warning', glyph: '…', word: 'pending' },
  running: { tone: 'warning', glyph: '◷', word: 'running' },
  paused: { tone: 'neutral', glyph: '‖', word: 'paused' },
} as const satisfies ReadonlyRecord<
  ShownVerdict,
  Readonly<{ tone: Tone; glyph: string; word: string }>
>;

/** Open or draft: a category, so the categorical blue, not a status. */
export const stateBadgeText = (isDraft: boolean): BadgeText =>
  isDraft
    ? ({
        tone: 'info',
        glyph: '◌',
        word: 'draft',
        counts: '',
        title: 'A draft: not ready for review.',
      } as const)
    : ({
        tone: 'info',
        glyph: '●',
        word: 'open',
        counts: '',
        title: 'Open and ready for review.',
      } as const);

export const autoMergeBadgeText = (armed: boolean): BadgeText =>
  armed
    ? ({
        tone: 'good',
        glyph: '⇢',
        word: 'auto-merge',
        counts: '',
        title: 'Auto-merge is armed: GitHub merges it once its checks pass.',
      } as const)
    : ({
        tone: 'neutral',
        glyph: '⇢',
        word: 'auto-merge off',
        counts: '',
        title: 'Auto-merge is not armed.',
      } as const);
