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
  /** A 16×16 path drawn in place of the glyph, where there is one. */
  icon?: string;
  word: string;
  title: string;
  /** `1✗ 1… 1– 6✓`, or empty. */
  counts: string;
}>;

/**
 * The four status steps, neutral for what judges nothing, info for a category;
 * plain and quiet for a state that is no status, said in ink or faded.
 */
export type Tone =
  | 'critical'
  | 'good'
  | 'info'
  | 'neutral'
  | 'plain'
  | 'quiet'
  | 'serious'
  | 'warning';

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
        icon: EYE,
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
        icon: EYE,
        word: 'code owner unknown',
        counts: '',
        title: `Owned by ${badge.teams.join(', ')}: a team’s members cannot be read without the read:org scope, so whether one has reviewed is unknown.`,
      };
  }
};

export const setAsideBadgeText = (badge: SetAsideBadge): BadgeText => {
  const reason = badge.reason.replaceAll('-', ' ');

  return badge.applies
    ? ({
        tone: 'critical',
        glyph: '⏸',
        icon: AROUND,
        word: `set aside: ${reason}`,
        counts: '',
        title: `The merge queue set it aside: ${reason}.`,
      } as const)
    : ({
        tone: 'neutral',
        glyph: '⏸',
        icon: AROUND,
        word: `was set aside: ${reason}`,
        counts: '',
        title: `The merge queue set it aside: ${reason}. Its base has moved or a retry was asked since, so the queue will pick it again.`,
      } as const);
};

/** A clock rather than a half circle for a wait, which read as a state. */
const CLOCK =
  'M2.6 8a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0-10.8 0M8 4.9V8.3l2.4 1.4';

const VERDICTS = {
  passed: {
    tone: 'good',
    glyph: '✓',
    icon: 'M3.4 8.6L6.5 11.7L12.6 4.7',
    word: 'checks passed',
  },
  failing: {
    tone: 'critical',
    glyph: '✗',
    icon: 'M4.6 4.6L11.4 11.4M11.4 4.6L4.6 11.4',
    word: 'checks failing',
  },
  pending: { tone: 'warning', glyph: '…', icon: CLOCK, word: 'checks pending' },
  running: { tone: 'warning', glyph: '◷', icon: CLOCK, word: 'checks running' },
  paused: {
    tone: 'neutral',
    glyph: '‖',
    icon: 'M6.2 4.2V11.8M9.8 4.2V11.8',
    word: 'checks paused',
  },
} as const satisfies ReadonlyRecord<
  ShownVerdict,
  Readonly<{ tone: Tone; glyph: string; icon: string; word: string }>
>;

/** An eye: what a code owner's review is about. */
const EYE =
  'M1.8 8s2.3-4.2 6.2-4.2S14.2 8 14.2 8s-2.3 4.2-6.2 4.2S1.8 8 1.8 8zM6.4 8a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0';

/** An arrow that goes around rather than through: set aside. */
const AROUND = 'M3 12.5V9.5a4 4 0 0 1 4-4h6M10.5 3l2.5 2.5L10.5 8';

/** Open or draft: a category, so not a status colour: open blue, draft grey. */
export const stateBadgeText = (isDraft: boolean): BadgeText =>
  isDraft
    ? ({
        tone: 'neutral',
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
        tone: 'plain',
        glyph: '⇥',
        word: 'auto-merge on',
        counts: '',
        title: 'Auto-merge is armed: GitHub merges it once its checks pass.',
      } as const)
    : ({
        tone: 'quiet',
        glyph: '⊘',
        word: 'auto-merge off',
        counts: '',
        title: 'Auto-merge is not armed.',
      } as const);
